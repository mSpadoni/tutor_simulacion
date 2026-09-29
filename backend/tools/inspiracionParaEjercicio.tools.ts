import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { enunciadoDe } from "@/backend/models/dominio/ficha";
import type { MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { resultadoConFichas, type ResultadoTool } from "./formatoMaterial";

// inspiracion_para_ejercicio: enunciados de la anexa y parciales para que el tutor cree un ejercicio NUEVO con la
// redacción y la complejidad de la cátedra, sin copiar ninguno.

/** Hasta `cantidad` elementos de la lista, elegidos al azar y sin repetir (mezcla de Fisher-Yates). */
function alAzar<T>(lista: readonly T[], cantidad: number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, cantidad);
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
  return resultadoConFichas(
    fichas,
    "Ejercicios de la cátedra SOLO como inspiración. Creá uno nuevo desde cero: otro dominio, otro título, otra " +
      "historia y otros datos. Tomá de acá el tipo de sistema, las complicaciones, la redacción y la complejidad.\n" +
      `No uses el dominio ni el título de ninguno de estos: ${prohibidos}.`,
    enunciadoDe
  );
}

/** La tool para el AI SDK. Recibe el material por parámetro para poder probarla con el real. */
export function crearToolInspiracionParaEjercicio(material: MaterialCatedra) {
  return {
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
