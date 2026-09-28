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
};
