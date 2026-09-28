import OpenAI from "openai";

// Cliente de OpenAI, configurado con variables de entorno:
//   OPENAI_API_KEY   clave de OpenAI
//   OPENAI_MODEL     modelo a usar (por defecto gpt-4o-mini)

/** URL de la API de OpenAI. Va fija para que el tutor siempre le hable a OpenAI. */
export const URL_API_OPENAI = "https://api.openai.com/v1";

/** Modelo del tutor; se puede cambiar con OPENAI_MODEL. */
export const MODELO_OPENAI = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Se crea un solo cliente y se reutiliza (arranca en null hasta el primer uso).
let cliente: OpenAI | null = null;

/** Devuelve el cliente para hablar con el modelo. Lo crea la primera vez que se lo pide. */
export function obtenerClienteOpenAI(): OpenAI {
  if (cliente) return cliente; // Ya estaba creado: se devuelve el mismo.

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno OPENAI_API_KEY (ver .env.example)");
  }

  cliente = new OpenAI({
    apiKey,
    // Explícita: si no, la librería usaría la variable OPENAI_BASE_URL cuando existe.
    baseURL: URL_API_OPENAI,
    // 30 s y un reintento: si el modelo tarda más, es mejor avisarle al alumno que dejarlo esperando.
    timeout: 30_000,
    maxRetries: 1,
  });
  return cliente;
}
