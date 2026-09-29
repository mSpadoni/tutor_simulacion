import "server-only";
import { envKroki } from "@/backend/lib/env";
import { problemaDeMermaid } from "@/backend/models/dominio/mermaid";
// Cliente de Kroki (https://kroki.io): recibe el código Mermaid de un diagrama y devuelve la imagen en SVG.
// Es la API externa del tutor. No necesita API key. Se puede cambiar el servidor con KROKI_URL (ej. uno propio).

/** Tamaño máximo del SVG que se acepta (en caracteres): evita guardar o mostrar respuestas desmedidas. */
export const MAX_CARACTERES_SVG = 600_000;

/** Por qué no se pudo generar el diagrama (el modelo lo usa para decidir si corrige y reintenta). */
export type MotivoError =
  | "codigo_invalido" // no es Mermaid de un diagrama de flujo, o está vacío (no se llama a Kroki)
  | "demasiado_largo" // supera MAX_CARACTERES_MERMAID de models/dominio/mermaid.ts (no se llama a Kroki)
  | "sintaxis" // Kroki respondió 400: el Mermaid tiene un error; `detalle` dice dónde
  | "tiempo" // Kroki no respondió a tiempo
  | "limite" // Kroki respondió 429: demasiados pedidos
  | "servicio" // Kroki falló (5xx) o no se pudo conectar
  | "respuesta_invalida"; // respondió algo que no es un SVG o es demasiado grande

export type ResultadoKroki = { ok: true; svg: string } | { ok: false; motivo: MotivoError; detalle: string };

/** La configuración del cliente. Todo es opcional: sin nada, usa Kroki (KROKI_URL o el público) con 8 s y 1 reintento. */
export type OpcionesKroki = {
  /** Dirección completa del endpoint (por defecto `<KROKI_URL o el público>/mermaid/svg`). */
  endpoint?: string;
  /** Cuánto esperar cada intento (ms). */
  timeoutMs?: number;
  /** Reintentos ante timeout, 5xx o 429 (no ante errores de sintaxis: reintentar no los arregla). */
  reintentos?: number;
  /** Máximo que se espera por un Retry-After de un 429 (ms); si piden más, no se reintenta. */
  maxEsperaReintentoMs?: number;
  /** Cuánto esperar antes de reintentar un 429 que no dice cuánto (sin Retry-After), en ms. */
  esperaSinRetryAfterMs?: number;
};

const esperar = (ms: number) => new Promise((listo) => setTimeout(listo, ms));

/**
 * Cliente de Kroki: se configura una vez (servidor, timeout, reintentos) y renderiza muchos diagramas.
 * Es una clase porque esa configuración la comparten todos los pedidos; los tests crean uno con otro servidor o
 * timeout sin tocar el que usa la app.
 */
export class ClienteKroki {
  private readonly endpointConfigurado: string | undefined;
  private readonly timeoutMs: number;
  private readonly reintentos: number;
  private readonly maxEsperaReintentoMs: number;
  private readonly esperaSinRetryAfterMs: number;

  constructor({
    endpoint,
    timeoutMs = 8000,
    reintentos = 1,
    maxEsperaReintentoMs = 3000,
    esperaSinRetryAfterMs = 1000,
  }: OpcionesKroki = {}) {
    this.endpointConfigurado = endpoint;
    this.timeoutMs = timeoutMs;
    this.reintentos = reintentos;
    this.maxEsperaReintentoMs = maxEsperaReintentoMs;
    this.esperaSinRetryAfterMs = esperaSinRetryAfterMs;
  }

  /** El endpoint configurado o el de KROKI_URL. Se lee al usarlo (no al crear el cliente), como el resto de env. */
  private get endpoint(): string {
    return this.endpointConfigurado ?? `${envKroki().url}/mermaid/svg`;
  }

  /** Pide a Kroki el SVG de un diagrama Mermaid, con timeout, reintentos y validación de la respuesta. */
  async renderizar(codigo: string): Promise<ResultadoKroki> {
    const { endpoint, timeoutMs, reintentos, maxEsperaReintentoMs, esperaSinRetryAfterMs } = this;

    // Lo que no es un diagrama aceptable no viaja a Kroki (ver models/dominio/mermaid.ts).
    const problema = problemaDeMermaid(codigo);
    if (problema) return { ok: false, ...problema };

    let ultimoError: ResultadoKroki = { ok: false, motivo: "servicio", detalle: "Kroki no respondió." };
    for (let intento = 0; intento <= reintentos; intento++) {
      let respuesta: Response;
      try {
        respuesta = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
          body: codigo.trim(),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        // AbortSignal.timeout corta con un error de nombre "TimeoutError"; cualquier otro es de conexión.
        const porTiempo = error instanceof Error && error.name === "TimeoutError";
        ultimoError = porTiempo
          ? { ok: false, motivo: "tiempo", detalle: `Kroki no respondió en ${timeoutMs / 1000} s.` }
          : { ok: false, motivo: "servicio", detalle: "No se pudo conectar con Kroki." };
        continue;
      }

      // 400: error de sintaxis en el Mermaid. Reintentar igual no sirve: se devuelve para que el modelo lo corrija.
      if (respuesta.status === 400) {
        const texto = (await respuesta.text()).trim();
        return { ok: false, motivo: "sintaxis", detalle: texto.slice(0, 500) || "Error de sintaxis en el Mermaid." };
      }

      // 429: demasiados pedidos. Si Retry-After pide una espera corta, se espera y se reintenta.
      if (respuesta.status === 429) {
        const segundos = Number(respuesta.headers.get("retry-after"));
        ultimoError = { ok: false, motivo: "limite", detalle: "Kroki está recibiendo demasiados pedidos." };
        const esperaMs = Number.isFinite(segundos) && segundos > 0 ? segundos * 1000 : esperaSinRetryAfterMs;
        if (intento < reintentos && esperaMs <= maxEsperaReintentoMs) await esperar(esperaMs);
        else if (esperaMs > maxEsperaReintentoMs) break;
        continue;
      }

      // 5xx: Kroki caído o saturado. Se reintenta.
      if (respuesta.status >= 500) {
        ultimoError = { ok: false, motivo: "servicio", detalle: `Kroki falló (HTTP ${respuesta.status}).` };
        continue;
      }

      if (!respuesta.ok) {
        return { ok: false, motivo: "respuesta_invalida", detalle: `Kroki respondió HTTP ${respuesta.status}.` };
      }

      // 200: se valida que sea un SVG de tamaño razonable antes de mostrarlo.
      const svg = await respuesta.text();
      const tipo = respuesta.headers.get("content-type") ?? "";
      if (!tipo.includes("svg") || !/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/.test(svg)) {
        return { ok: false, motivo: "respuesta_invalida", detalle: "Kroki no devolvió una imagen SVG." };
      }
      if (svg.length > MAX_CARACTERES_SVG) {
        return { ok: false, motivo: "respuesta_invalida", detalle: "El diagrama generado es demasiado grande." };
      }
      return { ok: true, svg };
    }
    return ultimoError;
  }
}

/** El cliente que usa la app (Kroki de KROKI_URL o el público, 8 s, 1 reintento). */
export const clienteKroki = new ClienteKroki();
