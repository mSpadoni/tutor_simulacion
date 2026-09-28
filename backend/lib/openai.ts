import OpenAI from "openai";

// Cliente de OpenAI, configurado con variables de entorno:
//   OPENAI_API_KEY   clave de OpenAI
//   OPENAI_BASE_URL  URL de la API (por defecto la de OpenAI)
//   OPENAI_MODEL     modelo a usar (por defecto gpt-4o-mini)

/** URL de la API de OpenAI, la que se usa si OPENAI_BASE_URL está vacía. */
export const URL_API_OPENAI_POR_DEFECTO = "https://api.openai.com/v1";

/** Modelo del tutor; se puede cambiar con OPENAI_MODEL. */
export const MODELO_OPENAI = process.env.OPENAI_MODEL || "gpt-4o-mini";

/** Crea un cliente nuevo leyendo las variables de entorno en este momento. */
export function crearClienteOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno OPENAI_API_KEY (ver .env.example)");
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || URL_API_OPENAI_POR_DEFECTO,
    // 30 s y un reintento: si el modelo tarda más, es mejor avisarle al alumno que dejarlo esperando.
    timeout: 30_000,
    maxRetries: 1,
  });
}

// Se crea un solo cliente y se reutiliza (arranca en null hasta el primer uso).
let cliente: OpenAI | null = null;

/** Devuelve el cliente para hablar con el modelo. Lo crea la primera vez que se lo pide. */
export function obtenerClienteOpenAI(): OpenAI {
  cliente ??= crearClienteOpenAI();
  return cliente;
}
