import OpenAI from "openai";
import { describe, expect, it } from "vitest";
import { ErrorDeChat, traducirError } from "@/backend/controllers/chat.controller";

// Sin mocks: los errores se arman con OpenAI.APIError.generate, la misma función que usa la librería
// cuando recibe una respuesta de la API, con el cuerpo que manda OpenAI de verdad.

/** Error real de OpenAI para un status y un cuerpo `{ error: {...} }` como los de la API. */
function errorDeOpenAI(status: number, error: Record<string, unknown>) {
  return OpenAI.APIError.generate(status, { error }, undefined, new Headers());
}

describe("traducirError — 429 de OpenAI", () => {
  it("sin saldo (formato actual: credit_balance_exhausted) es un error de configuración, no «esperá un minuto»", () => {
    const traducido = traducirError(
      errorDeOpenAI(429, {
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
      errorDeOpenAI(429, {
        message: "You exceeded your current quota.",
        type: "insufficient_quota",
        code: "insufficient_quota",
      })
    );

    expect(traducido.status).toBe(502);
  });

  it("demasiadas consultas (rate limit) sigue pidiendo esperar un minuto", () => {
    const traducido = traducirError(
      errorDeOpenAI(429, { message: "Rate limit reached for requests.", type: "requests", code: "rate_limit_exceeded" })
    );

    expect(traducido.status).toBe(503);
    expect(traducido.mensajeParaAlumno).toContain("demasiadas consultas");
  });
});
