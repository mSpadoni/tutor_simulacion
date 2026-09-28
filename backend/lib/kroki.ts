// Cliente de Kroki (https://kroki.io): recibe el código Mermaid de un diagrama y devuelve la imagen en SVG.
// Es la API externa del tutor. No necesita API key. Se puede cambiar el servidor con KROKI_URL (ej. uno propio).

/** Servidor público de Kroki, el que se usa si KROKI_URL está vacía. */
export const URL_KROKI_POR_DEFECTO = "https://kroki.io";

/** Largo máximo del código Mermaid: un diagrama de la materia entra de sobra; más es un error del modelo. */
export const MAX_CARACTERES_MERMAID = 6000;
/** Tamaño máximo del SVG que se acepta (en caracteres): evita guardar o mostrar respuestas desmedidas. */
export const MAX_CARACTERES_SVG = 600_000;

/** Por qué no se pudo generar el diagrama (el modelo lo usa para decidir si corrige y reintenta). */
export type MotivoError =
  | "codigo_invalido" // no es Mermaid de un diagrama de flujo, o está vacío (no se llama a Kroki)
  | "demasiado_largo" // supera MAX_CARACTERES_MERMAID (no se llama a Kroki)
  | "sintaxis" // Kroki respondió 400: el Mermaid tiene un error; `detalle` dice dónde
  | "tiempo" // Kroki no respondió a tiempo
  | "limite" // Kroki respondió 429: demasiados pedidos
  | "servicio" // Kroki falló (5xx) o no se pudo conectar
  | "respuesta_invalida"; // respondió algo que no es un SVG o es demasiado grande

export type ResultadoKroki = { ok: true; svg: string } | { ok: false; motivo: MotivoError; detalle: string };

type Opciones = {
  /** Dirección completa del endpoint (por defecto `<KROKI_URL o el público>/mermaid/svg`). */
  endpoint?: string;
  /** Cuánto esperar cada intento (ms). */
  timeoutMs?: number;
  /** Reintentos ante timeout, 5xx o 429 (no ante errores de sintaxis: reintentar no los arregla). */
  reintentos?: number;
  /** Máximo que se espera por un Retry-After de un 429 (ms); si piden más, no se reintenta. */
  maxEsperaReintentoMs?: number;
};

const esperar = (ms: number) => new Promise((listo) => setTimeout(listo, ms));

/** Valida el Mermaid antes de llamar a Kroki: vacío, largo o que no sea un diagrama de flujo no viajan. */
export function validarMermaid(codigo: string): ResultadoKroki | null {
  const limpio = codigo.trim();
  if (!/^(flowchart|graph)\s+(TD|TB|LR|RL|BT)\b/.test(limpio)) {
    return {
      ok: false,
      motivo: "codigo_invalido",
      detalle: 'El código tiene que ser un diagrama de flujo de Mermaid: empezar con "flowchart TD".',
    };
  }
  if (limpio.length > MAX_CARACTERES_MERMAID) {
    return {
      ok: false,
      motivo: "demasiado_largo",
      detalle: `El diagrama tiene ${limpio.length} caracteres; el máximo es ${MAX_CARACTERES_MERMAID}. Simplificalo.`,
    };
  }
  return null;
}

/** Pide a Kroki el SVG de un diagrama Mermaid, con timeout, reintentos y validación de la respuesta. */
export async function renderizarMermaid(codigo: string, opciones: Opciones = {}): Promise<ResultadoKroki> {
  const {
    endpoint = `${(process.env.KROKI_URL || URL_KROKI_POR_DEFECTO).replace(/\/$/, "")}/mermaid/svg`,
    timeoutMs = 8000,
    reintentos = 1,
    maxEsperaReintentoMs = 3000,
  } = opciones;

  const invalido = validarMermaid(codigo);
  if (invalido) return invalido;

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
      const esperaMs = Number.isFinite(segundos) && segundos > 0 ? segundos * 1000 : 1000;
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
