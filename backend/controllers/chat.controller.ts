import "server-only";
import { randomUUID } from "node:crypto";
import {
  APICallError,
  convertToModelMessages,
  createUIMessageStreamResponse,
  RetryError,
  smoothStream,
  stepCountIs,
  streamText,
  type LanguageModel,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { crearModeloOpenAI } from "@/backend/lib/openai";
import { armarSystemPrompt } from "@/backend/lib/prompts/systemPrompt";
import { conversacionesModel, tituloDesde, type ConversacionesModel } from "@/backend/models/conversaciones.model";
import { ejerciciosModel, type EjerciciosModel } from "@/backend/models/ejercicios.model";
import { obtenerMaterialCatedra, type MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { MAX_MENSAJES_CONTEXTO, type PedidoDeChat } from "@/backend/models/pedidoDeChat.model";
import { crearToolsDiagrama } from "@/backend/tools/diagrama.tools";
import { crearToolsEjercicio } from "@/backend/tools/ejercicio.tools";
import { crearToolsFdp } from "@/backend/tools/fdp.tools";
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

/**
 * Lo que se le puede pasar al ChatController para reemplazar sus piezas (útil en los tests).
 * Todas llevan `?`: son opcionales y, si no se pasan, se usan las reales.
 */
type Dependencias = {
  crearModelo?: () => LanguageModel;
  material?: () => MaterialCatedra;
  conversaciones?: () => ConversacionesModel;
  ejercicios?: () => EjerciciosModel;
  timeoutMs?: number;
  /** Pausa entre palabras al mostrar la respuesta (ms). 0 = tan rápido como llega del modelo. */
  pausaEntrePalabrasMs?: number;
};

/** Máximo de pasos por respuesta: hasta 3 rondas de tools y la respuesta final. Evita loops sin fin. */
const MAXIMO_DE_PASOS = 4;

/**
 * El modelo manda el texto en ráfagas irregulares; así la respuesta se lee más cómoda: sale palabra por palabra,
 * a un ritmo parejo (~30 palabras por segundo).
 */
const PAUSA_ENTRE_PALABRAS_MS = 30;

/**
 * Para el contexto del modelo, de los mensajes anteriores solo va el texto: lo que devolvieron las tools
 * (modelos, enunciados) ocupa miles de tokens y, si lo necesita otra vez, el modelo vuelve a pedirlo.
 * En la base se guarda todo, para mostrarlo al reabrir la conversación.
 */
function soloTexto(mensaje: UIMessage): UIMessage {
  return { ...mensaje, parts: mensaje.parts.filter((parte) => parte.type === "text") };
}

/**
 * Responde un mensaje del alumno en streaming: lee el historial de la base, guarda el mensaje nuevo, le pasa
 * todo al modelo (con las tools del material) y, cuando la respuesta termina, la guarda.
 * El modelo decide qué tools usar según lo que pide el alumno: el controller no elige por él.
 */
export class ChatController {
  private readonly crearModelo: () => LanguageModel;
  private readonly material: () => MaterialCatedra;
  private readonly conversaciones: () => ConversacionesModel;
  private readonly ejercicios: () => EjerciciosModel;
  private readonly timeoutMs: number;
  private readonly pausaEntrePalabrasMs: number;

  // Recibe UN objeto y lo desestructura en el momento: cada propiedad con su valor por defecto (`= ...`).
  // `: Dependencias = {}` → el objeto entero es opcional: `new ChatController()` usa todo lo real.
  constructor({
    crearModelo = () => crearModeloOpenAI(),
    material = obtenerMaterialCatedra,
    conversaciones = () => conversacionesModel,
    ejercicios = () => ejerciciosModel,
    timeoutMs = 45_000,
    pausaEntrePalabrasMs = PAUSA_ENTRE_PALABRAS_MS,
  }: Dependencias = {}) {
    this.crearModelo = crearModelo;
    this.material = material;
    this.conversaciones = conversaciones;
    this.ejercicios = ejercicios;
    this.timeoutMs = timeoutMs;
    this.pausaEntrePalabrasMs = pausaEntrePalabrasMs;
  }

  /**
   * Devuelve la respuesta del tutor como stream (el formato que entiende useChat en el navegador).
   * Si algo falla antes de empezar (la conversación es de otro alumno, la base no responde) tira un ErrorDeChat;
   * si falla el modelo en el medio, el error llega dentro del stream con el mensaje para el alumno.
   */
  async responder(pedido: PedidoDeChat): Promise<Response> {
    const conversaciones = this.conversaciones();
    const { conversacionId, mensaje } = pedido;

    // 0) El modelo primero: si falta configuración (ej. OPENAI_API_KEY), se corta antes de guardar nada y el
    //    alumno ve el mensaje de siempre en vez de un 500 genérico.
    let modelo: LanguageModel;
    try {
      modelo = this.crearModelo();
    } catch (error) {
      throw traducirError(error);
    }

    // 1) La conversación: si es nueva, se crea con el primer mensaje como título.
    if (!(await conversaciones.obtener(conversacionId))) {
      // Si falla, el id ya existe pero es de otro alumno (RLS no se la deja ver).
      await conversaciones.crear(conversacionId, tituloDesde(pedido.texto)).catch((error: unknown) => {
        throw new ErrorDeChat("No encontramos esa conversación. Empezá una nueva.", 404, { cause: error });
      });
    }

    // 2) El historial (sin el mensaje nuevo, por si es un reintento y ya estaba guardado) y el mensaje nuevo.
    const historial = (await conversaciones.mensajes(conversacionId, MAX_MENSAJES_CONTEXTO)).filter(
      (anterior) => anterior.id !== mensaje.id
    );
    await conversaciones.agregarMensajes(conversacionId, [mensaje]);
    const mensajes = [...historial, mensaje];

    // 3) El modelo, en streaming.
    const tools = {
      ...crearToolsMaterial(this.material()),
      ...crearToolsDiagrama(),
      ...crearToolsFdp(),
      ...crearToolsEjercicio(this.ejercicios(), conversacionId),
    };
    const inicio = Date.now();
    const resultado = streamText({
      model: modelo,
      system: armarSystemPrompt(),
      messages: await convertToModelMessages(mensajes.map(soloTexto)),
      tools,
      toolChoice: "auto", // el modelo decide si usa tools y cuáles
      stopWhen: stepCountIs(MAXIMO_DE_PASOS),
      maxOutputTokens: 2000,
      maxRetries: 1,
      timeout: this.timeoutMs,
      // Palabra por palabra, con una pausa pareja entre cada una.
      experimental_transform: smoothStream({ delayInMs: this.pausaEntrePalabrasMs, chunking: "word" }),
      onFinish: ({ steps, totalUsage }) => {
        // Log en formato JSON con datos útiles de cada respuesta (demora, pasos, tokens, tools usadas).
        const herramientas = steps.flatMap((paso) =>
          paso.toolCalls.map((llamada) => ({ nombre: llamada.toolName, entrada: llamada.input }))
        );
        console.info(
          JSON.stringify({
            evento: "chat.respuesta",
            ms: Date.now() - inicio,
            pasos: steps.length,
            tokens: totalUsage.totalTokens,
            herramientas,
          })
        );
      },
    });

    // 4) El stream para el navegador. Al terminar (o si el alumno lo corta), se guarda la respuesta.
    const stream = resultado.toUIMessageStream({
      originalMessages: mensajes,
      generateMessageId: randomUUID,
      onFinish: async ({ responseMessage }) => {
        if (responseMessage.parts.length === 0) return;
        await conversaciones.agregarMensajes(conversacionId, [responseMessage]).catch((error: unknown) => {
          console.error("No se pudo guardar la respuesta del tutor:", error);
        });
      },
      // Cualquier error del modelo llega al alumno con un mensaje entendible, sin detalles técnicos.
      onError: (error) => traducirError(error).mensajeParaAlumno,
    });
    return createUIMessageStreamResponse({ stream: stream.pipeThrough(timeoutComoError()) });
  }
}

/**
 * Cuando se vence el timeout, el SDK corta el stream con un evento "abort", no "error": en el navegador se vería
 * como si el tutor se hubiera callado. Este paso lo convierte en un error con el mensaje de siempre.
 * (Si el que corta es el alumno con "Detener", el navegador ya cerró la conexión y este evento no le llega.)
 */
function timeoutComoError(): TransformStream<UIMessageChunk, UIMessageChunk> {
  return new TransformStream({
    transform(evento, salida) {
      if (evento.type === "abort" && /TimeoutError/.test(evento.reason ?? "")) {
        salida.enqueue({ type: "error", errorText: MENSAJE_TIMEOUT });
      } else {
        salida.enqueue(evento);
      }
    },
  });
}

/** Lo que ve el alumno cuando el modelo tarda demasiado. */
const MENSAJE_TIMEOUT = "El tutor tardó demasiado en responder. Probá de nuevo en unos segundos.";

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
    return new ErrorDeChat(MENSAJE_TIMEOUT, 504, {
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
