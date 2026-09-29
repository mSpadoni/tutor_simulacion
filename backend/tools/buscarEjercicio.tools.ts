import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { enunciadoDe, resolucionDe, type Ficha } from "@/backend/models/dominio/ficha";
import type { MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { consultarModelos } from "./consultarModelos.tools";
import { resultadoConFichas, type ResultadoTool } from "./formatoMaterial";

// buscar_ejercicio: el enunciado de un ejercicio que el alumno nombra o describe, para resolverlo o corregirlo.
// La resolución de la cátedra puede tener errores: se devuelve marcada como referencia, para que el tutor la
// contraste con la teoría (base de conocimiento + modelos) y no la tome como verdad.

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

/**
 * Un ejercicio que el alumno nombra o describe: su enunciado, la resolución de la cátedra como referencia y los
 * modelos de la cátedra más parecidos a ese enunciado. La teoría viene junto con el ejercicio porque para resolver
 * o corregir hacen falta las dos: así no depende de que el modelo se acuerde de pedirla aparte.
 */
export function buscarEjercicio(material: MaterialCatedra, nombreODescripcion: string): ResultadoTool {
  const fichas = material.buscarPorNombre(nombreODescripcion);
  if (fichas.length === 0) {
    return {
      texto: `No encontré un ejercicio de la cátedra que coincida con "${nombreODescripcion}". Pedile al alumno el enunciado.`,
      fichas: [],
    };
  }
  const ejercicios = resultadoConFichas(
    fichas,
    "Ejercicios encontrados. La resolución de la cátedra es una referencia más, no la verdad: contrastala con la " +
      "base de conocimiento y los modelos, y si no coinciden, manda la teoría (y avisale al alumno de la diferencia). " +
      "Si ninguno es el ejercicio que menciona el alumno, pedile el enunciado:",
    enunciadoConResolucion
  );
  // Los modelos se buscan con el enunciado del mejor resultado: describe el sistema mejor que lo que escribió el alumno.
  const teoria = consultarModelos(material, enunciadoDe(fichas[0]));
  return {
    texto: `${ejercicios.texto}\n\n---\n\n## Teoría de la cátedra para este tipo de sistema\n\n${teoria.texto}`,
    fichas: ejercicios.fichas,
  };
}

/** La tool para el AI SDK. Recibe el material por parámetro para poder probarla con el real. */
export function crearToolBuscarEjercicio(material: MaterialCatedra) {
  return {
    buscar_ejercicio: tool({
      description:
        "Busca el enunciado de un ejercicio de la cátedra que el alumno nombra o describe (Guía Anexa, parciales, " +
        "guía oficial). Usala cuando el alumno pide resolver o corregir un ejercicio. Devuelve el enunciado, la resolución de la cátedra como referencia (puede tener errores) y los modelos de la cátedra de ese tipo de sistema.",
      inputSchema: z.object({
        nombreODescripcion: z
          .string()
          .min(2)
          .describe("Nombre del ejercicio ('Clínica', 'ejercicio 10 de la guía') o una descripción del sistema"),
      }),
      execute: async ({ nombreODescripcion }) => buscarEjercicio(material, nombreODescripcion).texto,
    }),
  };
}
