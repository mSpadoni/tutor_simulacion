import OpenAI from "openai";
import { MODELO_OPENAI, obtenerClienteOpenAI } from "@/backend/lib/openai";
import { armarSystemPrompt } from "@/backend/lib/prompts/systemPrompt";
import type { Conversacion } from "@/backend/models/conversacion.model";
import { obtenerMaterialCatedra, type Ficha } from "@/backend/models/materialCatedra.model";

/** Error con un mensaje pensado para mostrarle al alumno (qué pasó y qué hacer) y su código HTTP. */
// `extends Error`: hereda de Error, así se puede `throw` y atrapar con `catch` como cualquier error.
export class ErrorDeChat extends Error {
  // `options?`: parámetro opcional. `cause` guarda el error original (el de OpenAI) para poder verlo en los logs.
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
  crearClienteOpenAI?: () => OpenAI;
  modelo?: string;
  armarPrompt?: (fichas: readonly Ficha[]) => string;
  buscarMaterial?: (consulta: string) => Ficha[];
};

/** Arma la consulta al modelo (instrucciones + material de la cátedra + conversación) y devuelve la respuesta del tutor. */
export class ChatController {
  private readonly crearClienteOpenAI: () => OpenAI;
  private readonly modelo: string;
  private readonly armarPrompt: (fichas: readonly Ficha[]) => string;
  private readonly buscarMaterial: (consulta: string) => Ficha[];

  // Recibe UN objeto y lo desestructura en el momento: cada propiedad con su valor por defecto (`= ...`).
  // `: Dependencias = {}` → el objeto entero es opcional: `new ChatController()` usa todo lo real.
  constructor({
    crearClienteOpenAI = obtenerClienteOpenAI,
    modelo = MODELO_OPENAI,
    armarPrompt = armarSystemPrompt,
    buscarMaterial = (consulta) => obtenerMaterialCatedra().buscarModelosYEjercicios(consulta),
  }: Dependencias = {}) {
    this.crearClienteOpenAI = crearClienteOpenAI;
    this.modelo = modelo;
    this.armarPrompt = armarPrompt;
    this.buscarMaterial = buscarMaterial;
  }

  /** Le pasa la conversación al modelo y devuelve la respuesta del tutor (Markdown). */
  async responder(conversacion: Conversacion): Promise<string> {
    const fichas = this.buscarMaterial(conversacion.textoParaBuscarMaterial());
    const inicio = Date.now();
    // Se declara afuera del try para poder usarla después. Puede quedar vacía si el modelo no devuelve texto.
    let texto: string | null | undefined;
    try {
      const completion = await this.crearClienteOpenAI().chat.completions.create({
        model: this.modelo,
        messages: conversacion.paraOpenAI(this.armarPrompt(fichas)),
        max_completion_tokens: 2000,
      });
      // El modelo puede devolver varias opciones (`choices`); se usa la primera. Los `?.` evitan errores si falta algo.
      texto = completion.choices[0]?.message?.content;
      // Log en formato JSON con datos útiles de cada respuesta (modelo, demora, tokens, fichas usadas).
      console.info(
        JSON.stringify({
          evento: "chat.respuesta",
          modelo: this.modelo,
          ms: Date.now() - inicio,
          tokens: completion.usage?.total_tokens,
          material: fichas.map((ficha) => ficha.titulo),
        })
      );
    } catch (error) {
      // Cualquier error del proveedor se convierte en un ErrorDeChat con un mensaje entendible para el alumno.
      throw traducirError(error);
    }

    // `!texto?.trim()`: true si texto es null/undefined o solo tiene espacios.
    if (!texto?.trim()) {
      throw new ErrorDeChat("El tutor no generó una respuesta. Probá reformular tu mensaje.", 502);
    }
    return texto.trim();
  }
}

/**
 * Traduce un error técnico del proveedor a un ErrorDeChat con un mensaje para el alumno y un código HTTP.
 * `error instanceof OpenAI.X` pregunta "¿este error es de la clase X?" (cada tipo de falla tiene su clase).
 */
export function traducirError(error: unknown): ErrorDeChat {
  console.error("Error al consultar a OpenAI:", error);

  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return new ErrorDeChat("El tutor tardó demasiado en responder. Probá de nuevo en unos segundos.", 504, {
      cause: error,
    });
  }
  // OpenAI manda "sin saldo" con el mismo 429 que "demasiadas consultas", pero esperar no lo arregla:
  // es un problema de la cuenta, así que cae abajo, en el error de configuración.
  // Hoy llega como type "insufficient_quota" + code "credit_balance_exhausted"; antes el code era "insufficient_quota".
  const sinSaldo =
    error instanceof OpenAI.RateLimitError &&
    (error.type === "insufficient_quota" ||
      error.code === "insufficient_quota" ||
      error.code === "credit_balance_exhausted");
  if (error instanceof OpenAI.RateLimitError && !sinSaldo) {
    return new ErrorDeChat("El tutor está recibiendo demasiadas consultas. Esperá un minuto y volvé a intentar.", 503, {
      cause: error,
    });
  }
  // 5xx: el proveedor está caído o saturado ("high demand"). Es pasajero, no de configuración.
  if (error instanceof OpenAI.InternalServerError) {
    return new ErrorDeChat("El tutor está saturado en este momento. Esperá un minuto y volvé a intentar.", 503, {
      cause: error,
    });
  }
  // Clave inválida, modelo inexistente, sin crédito, variable faltante: es un problema de configuración, no del alumno.
  return new ErrorDeChat(
    "El tutor no está disponible en este momento. Probá de nuevo más tarde; si sigue pasando, avisale a quien administra la app.",
    502,
    { cause: error }
  );
}

/** Instancia única lista para usar desde la ruta /api/chat. */
export const chatController = new ChatController();
