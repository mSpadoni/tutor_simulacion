import { APICallError, RetryError, type UIMessageChunk } from "ai";
import { describe, expect, it } from "vitest";
import { ErrorDeChat, MENSAJE_TIMEOUT, timeoutComoError, traducirError } from "@/backend/tutor/errores";

// Sin mocks: los errores son instancias reales de las clases del AI SDK, con el cuerpo que manda OpenAI de verdad.

/** Error real de la API (como el que arma el SDK al recibir una respuesta con error). */
function errorDeApi(statusCode: number, error: Record<string, unknown>) {
  return new APICallError({
    message: String(error.message),
    url: "https://api.openai.com/v1/chat/completions",
    requestBodyValues: {},
    statusCode,
    responseBody: JSON.stringify({ error }),
    isRetryable: statusCode === 429 || statusCode >= 500,
  });
}

describe("traducirError — 429 de OpenAI", () => {
  it("sin saldo (formato actual: credit_balance_exhausted) es un error de configuración, no «esperá un minuto»", () => {
    const traducido = traducirError(
      errorDeApi(429, {
        message: "You have no credits remaining. Add credits to continue using the API.",
        type: "insufficient_quota",
        code: "credit_balance_exhausted",
        param: null,
      })
    );

    expect(traducido).toBeInstanceOf(ErrorDeChat);
    expect(traducido.status).toBe(502);
    expect(traducido.mensajeParaAlumno).toContain("El tutor no está disponible");
    expect(traducido.mensajeParaAlumno).not.toMatch(/esperá un minuto|credits|billing/i);
  });

  it("sin saldo (formato anterior: code insufficient_quota) también es error de configuración", () => {
    const traducido = traducirError(
      errorDeApi(429, {
        message: "You exceeded your current quota.",
        type: "insufficient_quota",
        code: "insufficient_quota",
      })
    );

    expect(traducido.status).toBe(502);
  });

  it("demasiadas consultas (rate limit) pide esperar un minuto", () => {
    const traducido = traducirError(
      errorDeApi(429, { message: "Rate limit reached for requests.", type: "requests", code: "rate_limit_exceeded" })
    );

    expect(traducido.status).toBe(503);
    expect(traducido.mensajeParaAlumno).toContain("demasiadas consultas");
  });
});

describe("traducirError — otros errores", () => {
  it("un 5xx del proveedor es pasajero: «está saturado»", () => {
    expect(traducirError(errorDeApi(503, { message: "overloaded" })).status).toBe(503);
  });

  it("una clave sin permisos (401 missing_scope) es un error de configuración", () => {
    const traducido = traducirError(
      errorDeApi(401, { message: "Missing scopes: model.request", code: "missing_scope" })
    );

    expect(traducido.status).toBe(502);
    expect(traducido.mensajeParaAlumno).not.toMatch(/scope|401/i);
  });

  it("si se agotaron los reintentos, se traduce el último error (acá, un rate limit)", () => {
    const reintentos = new RetryError({
      message: "Failed after 2 attempts",
      reason: "maxRetriesExceeded",
      errors: [errorDeApi(503, { message: "overloaded" }), errorDeApi(429, { message: "Rate limit", code: "x" })],
    });

    expect(traducirError(reintentos).mensajeParaAlumno).toContain("demasiadas consultas");
  });

  it("el timeout del SDK (DOMException «TimeoutError») es un 504", () => {
    const timeout = new DOMException("Step timeout of 1ms exceeded", "TimeoutError");

    expect(traducirError(timeout).status).toBe(504);
  });
});

describe("timeoutComoError (el corte por timeout llega al alumno como error)", () => {
  /** Pasa los eventos por el paso real, con un stream real, y devuelve lo que sale. */
  async function pasarPor(eventos: UIMessageChunk[]): Promise<UIMessageChunk[]> {
    const salida: UIMessageChunk[] = [];
    const stream = new ReadableStream<UIMessageChunk>({
      start(controlador) {
        eventos.forEach((evento) => controlador.enqueue(evento));
        controlador.close();
      },
    }).pipeThrough(timeoutComoError());
    const lector = stream.getReader();
    for (let leido = await lector.read(); !leido.done; leido = await lector.read()) salida.push(leido.value);
    return salida;
  }

  it("un abort por TimeoutError se convierte en error con el mensaje de siempre", async () => {
    expect(await pasarPor([{ type: "abort", reason: "TimeoutError: Step timeout exceeded" }])).toEqual([
      { type: "error", errorText: MENSAJE_TIMEOUT },
    ]);
  });

  it("el resto de los eventos (texto, un abort del alumno) pasan igual", async () => {
    const eventos: UIMessageChunk[] = [
      { type: "text-delta", id: "1", delta: "Hola" },
      { type: "abort", reason: "AbortError" },
    ];

    expect(await pasarPor(eventos)).toEqual(eventos);
  });
});
