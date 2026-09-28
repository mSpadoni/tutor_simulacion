import { tool } from "ai";
import { z } from "zod";
import { enunciadoDe, type Ficha, type MaterialCatedra } from "@/backend/models/materialCatedra.model";

// Tools con las que el modelo consulta el material de la cátedra. El modelo decide cuál usar según lo que pide
// el alumno (eso es la interpretación de intención): el código no elige por él.
// Las resoluciones de la cátedra nunca se devuelven: pueden tener errores, así que el tutor resuelve y corrige
// con la teoría (base de conocimiento + modelos).

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

/** Un ejercicio que el alumno nombra o describe: solo su enunciado, sin la resolución de la cátedra. */
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
    "Enunciados encontrados (solo el enunciado; resolvé o corregí con la base de conocimiento y los modelos). " +
      "Si ninguno es el que menciona el alumno, pedile el enunciado:",
    enunciadoDe
  );
}

/** Enunciados de anexa y parciales como inspiración para crear un ejercicio nuevo desde cero. */
export function inspiracionParaEjercicio(material: MaterialCatedra, tema: string): ResultadoTool {
  const fichas = material.buscar(tema, { tipo: "ejercicio", limite: 3, presupuestoTokens: 3000 });
  if (fichas.length === 0) {
    return { texto: "No hay ejercicios parecidos: armalo desde cero con la sección 8 de la base.", fichas: [] };
  }
  return resultado(
    fichas,
    "Ejercicios de la cátedra SOLO como inspiración. Creá uno nuevo desde cero: otro dominio, otro título, otra " +
      "historia y otros datos. Tomá de acá el tipo de sistema, las complicaciones, la redacción y la complejidad:",
    enunciadoDe
  );
}

/** Las tres tools para `generateText`. Reciben el material por parámetro para poder probarlas con el real. */
export function crearToolsMaterial(material: MaterialCatedra) {
  return {
    consultar_modelos: tool({
      description:
        "Trae los modelos de la cátedra (teoría y casos modelo) sobre un tema. Usala para explicar un concepto o " +
        "cómo se hace algo, y siempre que tengas que resolver o corregir un ejercicio.",
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
        "guía oficial). Usala cuando el alumno pide resolver o corregir un ejercicio. Devuelve solo el enunciado.",
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
