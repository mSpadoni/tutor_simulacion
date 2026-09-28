import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { EjercicioSchema, type EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";

/** Los datos del ejercicio que arma el modelo (validados con Zod antes de guardarlos). */
export const DatosEjercicioSchema = z.object({
  tema: EjercicioSchema.shape.tema.describe("Tipo de sistema, ej: 'colas con arrepentimiento', 'stock con reposición'"),
  dificultad: EjercicioSchema.shape.dificultad.describe("facil, media o dificil (tipo parcial = media o dificil)"),
  titulo: EjercicioSchema.shape.payload.shape.titulo.describe(
    "Título corto con el dominio, ej: 'Taller de bicicletas'"
  ),
  enunciado: EjercicioSchema.shape.payload.shape.enunciado.describe(
    "El sistema contado en prosa, con los datos como f.d.p. y lo que se desea determinar (sin el «Se pide»)"
  ),
  sePide: EjercicioSchema.shape.payload.shape.sePide.describe("Cada consigna del «Se pide:», en orden"),
});

export type DatosEjercicio = z.infer<typeof DatosEjercicioSchema>;

/** Lo que devuelve la tool: si se guardó (con su id) o por qué no. */
export type EjercicioGenerado = { ok: true; id: string } | { ok: false; error: string };

/** Guarda el ejercicio en "Mis ejercicios" del alumno, asociado a la conversación donde se generó. */
export async function guardarEjercicio(
  ejercicios: EjerciciosModel,
  conversacionId: string,
  { tema, dificultad, titulo, enunciado, sePide }: DatosEjercicio
): Promise<EjercicioGenerado> {
  try {
    const guardado = await ejercicios.guardar(
      { tema, dificultad, payload: { titulo, enunciado, sePide } },
      conversacionId
    );
    return { ok: true, id: guardado.id };
  } catch (error) {
    return { ok: false, error: `No se pudo guardar el ejercicio: ${(error as Error).message}` };
  }
}

/** La tool para `streamText`. Se crea por pedido: guarda con la sesión del alumno y en su conversación. */
export function crearToolsEjercicio(ejercicios: EjerciciosModel, conversacionId: string) {
  return {
    generar_ejercicio: tool({
      description:
        "Guarda el ejercicio nuevo que creaste en «Mis ejercicios» del alumno, con sus datos estructurados " +
        "(título, enunciado y consignas). Llamala SIEMPRE que le des un ejercicio nuevo, después de crearlo.",
      inputSchema: DatosEjercicioSchema,
      execute: (datos) => guardarEjercicio(ejercicios, conversacionId, datos),
    }),
  };
}
