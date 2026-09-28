import "server-only";
import { APICallError, RetryError, type UIMessageChunk } from "ai";

// Qué ve el alumno cuando algo falla con el modelo: cada error técnico se traduce a un mensaje entendible
// y a un código HTTP. Lo usan el controller (antes de empezar el stream) y el agente (en el medio del stream).

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

/** Lo que ve el alumno cuando el modelo tarda demasiado. */
export const MENSAJE_TIMEOUT = "El tutor tardó demasiado en responder. Probá de nuevo en unos segundos.";

/**
 * Cuando se vence el timeout, el SDK corta el stream con un evento "abort", no "error": en el navegador se vería
 * como si el tutor se hubiera callado. Este paso lo convierte en un error con el mensaje de siempre.
 * (Si el que corta es el alumno con "Detener", el navegador ya cerró la conexión y este evento no le llega.)
 */
export function timeoutComoError(): TransformStream<UIMessageChunk, UIMessageChunk> {
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
