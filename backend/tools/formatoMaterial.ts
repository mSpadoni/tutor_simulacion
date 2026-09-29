import "server-only";
import type { Ficha } from "@/backend/models/dominio/ficha";

// Lo que comparten las tres tools del material de la cátedra (consultar_modelos, buscar_ejercicio,
// inspiracion_para_ejercicio): cómo se le muestran las fichas al modelo.

/** Resultado de una tool del material: el texto que lee el modelo y los títulos usados (para el log). */
export type ResultadoTool = { texto: string; fichas: string[] };

/** Las fichas con un encabezado (la instrucción para el modelo) y lo que se muestra de cada una. */
export function resultadoConFichas(
  fichas: readonly Ficha[],
  encabezado: string,
  contenido: (ficha: Ficha) => string
): ResultadoTool {
  const cuerpo = fichas
    .map((ficha) => `### ${ficha.titulo}\nFuente: ${ficha.fuente}\n\n${contenido(ficha)}`)
    .join("\n\n");
  return { texto: `${encabezado}\n\n${cuerpo}`, fichas: fichas.map((ficha) => ficha.titulo) };
}
