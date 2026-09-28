import "server-only";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// Modelo de OpenAI para el Vercel AI SDK, configurado con variables de entorno:
//   OPENAI_API_KEY   clave de OpenAI
//   OPENAI_BASE_URL  URL de la API (por defecto la de OpenAI)
//   OPENAI_MODEL     modelo a usar (por defecto gpt-4o-mini)

/** URL de la API de OpenAI, la que se usa si OPENAI_BASE_URL está vacía. */
export const URL_API_OPENAI_POR_DEFECTO = "https://api.openai.com/v1";

/** Modelo del tutor; se puede cambiar con OPENAI_MODEL. */
export const MODELO_OPENAI = process.env.OPENAI_MODEL || "gpt-4o-mini";

/** Lee la clave y la URL de las variables de entorno en este momento. Sin clave, corta con un error claro. */
export function leerConfigOpenAI(): { apiKey: string; baseURL: string } {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno OPENAI_API_KEY (ver .env.example)");
  }
  return { apiKey, baseURL: process.env.OPENAI_BASE_URL || URL_API_OPENAI_POR_DEFECTO };
}

/**
 * El modelo listo para `generateText`. Usa la API de chat completions (`.chat`), que también entienden
 * los servicios compatibles con OpenAI si algún día cambia OPENAI_BASE_URL.
 */
export function crearModeloOpenAI(modelo: string = MODELO_OPENAI): LanguageModel {
  return createOpenAI(leerConfigOpenAI()).chat(modelo);
}
