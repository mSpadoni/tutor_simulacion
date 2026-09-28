import { APICallError, generateText, RetryError, stepCountIs, type LanguageModel } from "ai";
import { crearModeloOpenAI } from "@/backend/lib/openai";
import { armarSystemPrompt } from "@/backend/lib/prompts/systemPrompt";
import type { Conversacion } from "@/backend/models/conversacion.model";
import { obtenerMaterialCatedra, type MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { crearToolsMaterial } from "@/backend/tools/material.tools";

/** Error con un mensaje pensado para mostrarle al alumno (qué pasó y qué hacer) y su código HTTP. */
// `extends Error`: hereda de Error, así se puede `throw` y atrapar con `catch` como cualquier error.
export class ErrorDeChat extends Error {
  // `options?`: parámetro opcional. `cause` guarda el error original (el del proveedor) para poder verlo en los logs.
  constructor(
    readonly mensajeParaAlumno: string,
    readonly status: number,
    options?: { cause?: unknown }
  ) {
    super(mensajeParaAlumno, options); // super(...) llama al constructor de Error (la clase padre).
  }
}

/** Una tool que usó el modelo para responder, con lo que le pasó. */
export type HerramientaUsada = { nombre: string; entrada: unknown };

/** La respuesta del tutor (Markdown) y las tools que usó el modelo para armarla. */
export type RespuestaTutor = { texto: string; herramientas: HerramientaUsada[] };

/**
 * Lo que se le puede pasar al ChatController para reemplazar sus piezas (útil en los tests).
 * Todas llevan `?`: son opcionales y, si no se pasan, se usan las reales.
 */
type Dependencias = {
  crearModelo?: () => LanguageModel;
  material?: () => MaterialCatedra;
  timeoutMs?: number;
};

/** Máximo de pasos por respuesta: hasta 3 rondas de tools y la respuesta final. Evita loops sin fin. */
const MAXIMO_DE_PASOS = 4;

/**
 * Arma la consulta al modelo (instrucciones + conversación + tools del material) y devuelve la respuesta del tutor.
 * El modelo decide qué tools usar según lo que pide el alumno: el controller no elige por él.
 */
export class ChatController {
  private readonly crearModelo: () => LanguageModel;
  private readonly material: () => MaterialCatedra;
  private readonly timeoutMs: number;

  // Recibe UN objeto y lo desestructura en el momento: cada propiedad con su valor por defecto (`= ...`).
  // `: Dependencias = {}` → el objeto entero es opcional: `new ChatController()` usa todo lo real.
  constructor({
    crearModelo = () => crearModeloOpenAI(),
    material = obtenerMaterialCatedra,
    timeoutMs = 45_000,
  }: Dependencias = {}) {
    this.crearModelo = crearModelo;
    this.material = material;
    this.timeoutMs = timeoutMs;
  }

  /** Le pasa la conversación al modelo (con sus tools) y devuelve la respuesta del tutor. */
  async responder(conversacion: Conversacion): Promise<RespuestaTutor> {
    const inicio = Date.now();
    const resultado = await generateText({
      model: this.crearModelo(),
      system: armarSystemPrompt(),
      messages: conversacion.paraModelo(),
      tools: crearToolsMaterial(this.material()),
      toolChoice: "auto", // el modelo decide si usa tools y cuáles
      stopWhen: stepCountIs(MAXIMO_DE_PASOS),
      maxOutputTokens: 2000,
      maxRetries: 1,
      timeout: this.timeoutMs,
    }).catch((error: unknown) => {
      // Cualquier error del proveedor se convierte en un ErrorDeChat con un mensaje entendible para el alumno.
      throw traducirError(error);
    });

    // Las tool calls de todos los pasos, en orden (steps = cada ida y vuelta con el modelo).
    const herramientas = resultado.steps.flatMap((paso) =>
      paso.toolCalls.map((llamada) => ({ nombre: llamada.toolName, entrada: llamada.input }))
    );
    // Log en formato JSON con datos útiles de cada respuesta (demora, tokens, tools usadas).
    console.info(
      JSON.stringify({
        evento: "chat.respuesta",
        ms: Date.now() - inicio,
        pasos: resultado.steps.length,
        tokens: resultado.totalUsage.totalTokens,
        herramientas,
      })
    );

    const texto = resultado.text.trim();
    if (!texto) {
      throw new ErrorDeChat("El tutor no generó una respuesta. Probá reformular tu mensaje.", 502);
    }
    return { texto, herramientas };
  }
}

/** ¿El error es de que la cuenta de OpenAI se quedó sin saldo? (llega como 429, igual que el exceso de consultas) */
function esSinSaldo(error: APICallError): boolean {
  // Hoy llega como type "insufficient_quota" + code "credit_balance_exhausted"; antes el code era "insufficient_quota".
  return /insufficient_quota|credit_balance_exhausted/.test(error.responseBody ?? "");
}

/**
 * Traduce un error técnico del proveedor a un ErrorDeChat con un mensaje para el alumno y un código HTTP.
 * `X.isInstance(error)` pregunta "¿este error es de la clase X?" (cada tipo de falla tiene su clase).
 */
export function traducirError(error: unknown): ErrorDeChat {
  console.error("Error al consultar a OpenAI:", error);

  // Si se agotaron los reintentos, el SDK envuelve el error: lo que importa es el último.
  const causa = RetryError.isInstance(error) ? error.lastError : error;

  // El timeout lo corta el SDK con un DOMException de nombre "TimeoutError".
  if (causa instanceof Error && causa.name === "TimeoutError") {
    return new ErrorDeChat("El tutor tardó demasiado en responder. Probá de nuevo en unos segundos.", 504, {
      cause: error,
    });
  }
  if (APICallError.isInstance(causa)) {
    // Sin saldo no se arregla esperando: cae abajo, en el error de configuración.
    if (causa.statusCode === 429 && !esSinSaldo(causa)) {
      return new ErrorDeChat(
        "El tutor está recibiendo demasiadas consultas. Esperá un minuto y volvé a intentar.",
        503,
        { cause: error }
      );
    }
    // 5xx: el proveedor está caído o saturado. Es pasajero, no de configuración.
    if (causa.statusCode !== undefined && causa.statusCode >= 500) {
      return new ErrorDeChat("El tutor está saturado en este momento. Esperá un minuto y volvé a intentar.", 503, {
        cause: error,
      });
    }
  }
  // Clave inválida, sin permisos, modelo inexistente, sin crédito, variable faltante: es un problema de
  // configuración, no del alumno.
  return new ErrorDeChat(
    "El tutor no está disponible en este momento. Probá de nuevo más tarde; si sigue pasando, avisale a quien administra la app.",
    502,
    { cause: error }
  );
}

/** Instancia única lista para usar desde la ruta /api/chat. */
export const chatController = new ChatController();
