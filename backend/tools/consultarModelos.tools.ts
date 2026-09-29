import "server-only";
import { tool } from "ai";
import { z } from "zod";
import type { MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { resultadoConFichas, type ResultadoTool } from "./formatoMaterial";

// consultar_modelos: la teoría de la cátedra (guía oficial 1 a 8, clases, TP 4) para explicar, resolver y corregir.
// El modelo decide cuándo usarla según lo que pide el alumno (interpretación de intención).

/** Modelos de la cátedra sobre un tema, completos. */
export function consultarModelos(material: MaterialCatedra, tema: string): ResultadoTool {
  const fichas = material.buscar(tema, { tipo: "modelo", limite: 3, presupuestoTokens: 5000 });
  if (fichas.length === 0) {
    return {
      texto: `No hay modelos de la cátedra sobre "${tema}". Explicalo con la base de conocimiento.`,
      fichas: [],
    };
  }
  return resultadoConFichas(
    fichas,
    "Modelos de la cátedra (teoría: usalos para explicar, resolver y corregir; no los des como ejercicio):",
    (ficha) => ficha.contenido
  );
}

/** La tool para el AI SDK. Recibe el material por parámetro para poder probarla con el real. */
export function crearToolConsultarModelos(material: MaterialCatedra) {
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
  };
}
