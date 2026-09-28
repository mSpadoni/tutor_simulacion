import { tool } from "ai";
import { z } from "zod";
import { enunciadoDe, resolucionDe, type Ficha, type MaterialCatedra } from "@/backend/models/materialCatedra.model";

// Tools con las que el modelo consulta el material de la cátedra. El modelo decide cuál usar según lo que pide
// el alumno (eso es la interpretación de intención): el código no elige por él.
// Las resoluciones de la cátedra pueden tener errores: buscar_ejercicio las devuelve marcadas como referencia,
// para que el tutor las contraste con la teoría (base de conocimiento + modelos) y no las tome como verdad.

/** Resultado de una tool: el texto que lee el modelo y los títulos usados (para el log y, más adelante, el panel). */
export type ResultadoTool = { texto: string; fichas: string[] };

function formatear(fichas: readonly Ficha[], contenido: (ficha: Ficha) => string): string {
  return fichas.map((ficha) => `### ${ficha.titulo}\nFuente: ${ficha.fuente}\n\n${contenido(ficha)}`).join("\n\n");
}

function resultado(fichas: readonly Ficha[], encabezado: string, contenido: (ficha: Ficha) => string): ResultadoTool {
  return { texto: `${encabezado}\n\n${formatear(fichas, contenido)}`, fichas: fichas.map((ficha) => ficha.titulo) };
}

/** Modelos de la cátedra (guía oficial 1 a 8, clases, TP 4) sobre un tema, completos. */
export function consultarModelos(material: MaterialCatedra, tema: string): ResultadoTool {
  const fichas = material.buscar(tema, { tipo: "modelo", limite: 3, presupuestoTokens: 5000 });
  if (fichas.length === 0) {
    return {
      texto: `No hay modelos de la cátedra sobre "${tema}". Explicalo con la base de conocimiento.`,
      fichas: [],
    };
  }
  return resultado(
    fichas,
    "Modelos de la cátedra (teoría: usalos para explicar, resolver y corregir; no los des como ejercicio):",
    (ficha) => ficha.contenido
  );
}

/** Enunciado y, si la hay, la resolución de la cátedra marcada como referencia a verificar. */
function enunciadoConResolucion(ficha: Ficha): string {
  const resolucion = resolucionDe(ficha);
  if (!resolucion) return `${enunciadoDe(ficha)}\n\n(La cátedra no publicó resolución de este ejercicio.)`;
  return (
    `${enunciadoDe(ficha)}\n\n` +
    "#### Resolución de la cátedra (REFERENCIA: puede tener errores; verificala con la base de conocimiento " +
    `y los modelos antes de usarla)\n\n${resolucion}`
  );
}

/** Un ejercicio que el alumno nombra o describe: su enunciado y la resolución de la cátedra como referencia. */
export function buscarEjercicio(material: MaterialCatedra, nombreODescripcion: string): ResultadoTool {
  const fichas = material.buscarPorNombre(nombreODescripcion);
  if (fichas.length === 0) {
    return {
      texto: `No encontré un ejercicio de la cátedra que coincida con "${nombreODescripcion}". Pedile al alumno el enunciado.`,
      fichas: [],
    };
  }
  return resultado(
    fichas,
    "Ejercicios encontrados. La resolución de la cátedra es una referencia más, no la verdad: contrastala con la " +
      "base de conocimiento y los modelos, y si no coinciden, manda la teoría (y avisale al alumno de la diferencia). " +
      "Si ninguno es el ejercicio que menciona el alumno, pedile el enunciado:",
    enunciadoConResolucion
  );
}

/** Enunciados de anexa y parciales como inspiración para crear un ejercicio nuevo desde cero. */
export function inspiracionParaEjercicio(material: MaterialCatedra, tema: string): ResultadoTool {
  // Para que cada pedido se inspire en ejercicios distintos: 3 al azar entre los 8 más parecidos.
  const candidatos = material.buscar(tema, { tipo: "ejercicio", limite: 8, presupuestoTokens: 12000 });
  const fichas = alAzar(candidatos, 3);
  if (fichas.length === 0) {
    return { texto: "No hay ejercicios parecidos: armalo desde cero con la sección 8 de la base.", fichas: [] };
  }
  const prohibidos = fichas.map((ficha) => `«${ficha.titulo}»`).join(", ");
  return resultado(
    fichas,
    "Ejercicios de la cátedra SOLO como inspiración. Creá uno nuevo desde cero: otro dominio, otro título, otra " +
      "historia y otros datos. Tomá de acá el tipo de sistema, las complicaciones, la redacción y la complejidad.\n" +
      `No uses el dominio ni el título de ninguno de estos: ${prohibidos}.`,
    enunciadoDe
  );
}

/** Hasta `cantidad` elementos de la lista, elegidos al azar y sin repetir (mezcla de Fisher-Yates). */
function alAzar<T>(lista: readonly T[], cantidad: number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, cantidad);
}

/** Las tres tools para `generateText`. Reciben el material por parámetro para poder probarlas con el real. */
export function crearToolsMaterial(material: MaterialCatedra) {
  return {
    consultar_modelos: tool({
      description:
        "Trae los modelos de la cátedra (teoría y casos modelo) sobre un tema. Llamala SIEMPRE antes de explicar " +
        "cómo se hace algo (la cátedra tiene su propia convención) y siempre que tengas que resolver o corregir.",
      inputSchema: z.object({
        tema: z
          .string()
          .min(2)
          .describe("Tema o tipo de sistema, ej: 'tiempo comprometido PTO', 'colas con prioridad'"),
      }),
      execute: async ({ tema }) => consultarModelos(material, tema).texto,
    }),
    buscar_ejercicio: tool({
      description:
        "Busca el enunciado de un ejercicio de la cátedra que el alumno nombra o describe (Guía Anexa, parciales, " +
        "guía oficial). Usala cuando el alumno pide resolver o corregir un ejercicio. Devuelve el enunciado y, si existe, la resolución de la cátedra como referencia (puede tener errores).",
      inputSchema: z.object({
        nombreODescripcion: z
          .string()
          .min(2)
          .describe("Nombre del ejercicio ('Clínica', 'ejercicio 10 de la guía') o una descripción del sistema"),
      }),
      execute: async ({ nombreODescripcion }) => buscarEjercicio(material, nombreODescripcion).texto,
    }),
    inspiracion_para_ejercicio: tool({
      description:
        "Trae enunciados de la Guía Anexa y parciales como inspiración para crear un ejercicio NUEVO. Usala cuando " +
        "el alumno pide un ejercicio para practicar. No los copies: creá uno desde cero.",
      inputSchema: z.object({
        tema: z.string().min(2).describe("Tipo de sistema o tema pedido, ej: 'colas con arrepentimiento', 'stock'"),
      }),
      execute: async ({ tema }) => inspiracionParaEjercicio(material, tema).texto,
    }),
  };
}
