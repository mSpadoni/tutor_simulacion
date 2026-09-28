/** Límite de /api/chat: el navegador avisa antes de mandar un mensaje más largo. */
export const MAX_CARACTERES_MENSAJE = 6000;

/**
 * El mensaje de error para mostrarle al alumno.
 * - Si falló antes de empezar (401, 400, 404), useChat recibe el cuerpo JSON de la ruta: `{ "error": "..." }`.
 * - Si falló en el medio del stream, recibe directamente el texto que armó el servidor para el alumno.
 */
export function mensajeDeError(error: Error | undefined): string {
  const generico = "No pudimos contactar al tutor. Revisá tu conexión y probá de nuevo.";
  if (!error?.message) return generico;
  try {
    const cuerpo: unknown = JSON.parse(error.message);
    if (cuerpo && typeof cuerpo === "object" && "error" in cuerpo && typeof cuerpo.error === "string") {
      return cuerpo.error;
    }
    return generico;
  } catch {
    // No era JSON: es el texto del error del stream (ya pensado para el alumno), salvo errores de red del navegador.
    return /failed to fetch|network|load failed/i.test(error.message) ? generico : error.message;
  }
}

/**
 * ¿El alumno está mirando el final de la conversación? (a menos de `margen` píxeles del fondo)
 * Si está ahí, el chat lo acompaña mientras llega la respuesta; si subió a leer algo, no se lo mueve.
 */
export function estaCercaDelFinal(
  { scrollTop, scrollHeight, clientHeight }: { scrollTop: number; scrollHeight: number; clientHeight: number },
  margen = 80
): boolean {
  return scrollHeight - scrollTop - clientHeight <= margen;
}

/**
 * Un cuadro de la animación que acompaña al texto: avanza una parte de lo que falta hasta el final (al principio
 * más rápido, cerca del final más despacio) y al menos 1 px, para que siempre termine de llegar.
 * `fraccion` controla la velocidad: 0.06 ≈ un deslizamiento suave, sin saltos.
 */
export function siguienteScroll(actual: number, objetivo: number, fraccion = 0.06): number {
  const falta = objetivo - actual;
  if (falta <= 1) return objetivo;
  return actual + Math.max(1, falta * fraccion);
}

/** Qué le mostramos al alumno mientras el tutor usa cada tool, y cuando ya la usó (heurística #1). */
export const TEXTOS_DE_HERRAMIENTAS: Record<string, { usando: string; usada: string }> = {
  consultar_modelos: {
    usando: "Consultando los modelos de la cátedra…",
    usada: "Consultó los modelos de la cátedra",
  },
  buscar_ejercicio: {
    usando: "Buscando el ejercicio en el material de la cátedra…",
    usada: "Buscó el ejercicio en el material de la cátedra",
  },
  inspiracion_para_ejercicio: {
    usando: "Buscando ejercicios de la cátedra para inspirarse…",
    usada: "Se inspiró en ejercicios de la cátedra",
  },
  generar_diagrama_flujo: {
    usando: "Dibujando el diagrama de flujo…",
    usada: "Dibujó el diagrama de flujo",
  },
  verificar_fdp: {
    usando: "Verificando la f.d.p. con cálculo numérico…",
    usada: "Verificó la f.d.p. con cálculo numérico",
  },
};

/** Un diagrama listo para mostrar: el SVG va como data URL en un <img> (así el navegador no ejecuta nada de adentro). */
export type DiagramaParaMostrar = { titulo: string; mermaid: string; src: string };

/**
 * Si la parte del mensaje es un diagrama que Kroki generó bien, sus datos para mostrarlo; si no, null
 * (todavía se está generando, o falló: eso lo muestra el aviso de la tool).
 */
export function diagramaDe(parte: { type: string; state?: string; output?: unknown }): DiagramaParaMostrar | null {
  if (parte.type !== "tool-generar_diagrama_flujo" || parte.state !== "output-available") return null;
  const salida = parte.output as { ok?: boolean; svg?: unknown; titulo?: unknown; mermaid?: unknown } | undefined;
  if (!salida?.ok || typeof salida.svg !== "string") return null;
  return {
    titulo: String(salida.titulo ?? "Diagrama de flujo"),
    mermaid: String(salida.mermaid ?? ""),
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(salida.svg)}`,
  };
}

/** ¿La tool terminó pero falló? (ej. el diagrama no se pudo generar) — para mostrar el aviso con ⚠. */
export function herramientaFallo(parte: { state?: string; output?: unknown }): boolean {
  if (parte.state === "output-error") return true;
  return parte.state === "output-available" && (parte.output as { ok?: boolean } | undefined)?.ok === false;
}
