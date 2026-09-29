import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { EjercicioSchema, problemasDelEjercicio } from "@/backend/models/dominio/ejercicio";
import type { EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";

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
  // No se guardan: obligan a pensar el ejercicio antes de escribirlo y permiten revisarlo.
  datosAleatorios: z
    .array(
      z.object({
        sigla: z.string().trim().min(1).max(10).describe("La sigla del dato, ej: 'IA'"),
        fdp: z
          .string()
          .trim()
          .min(5)
          .max(200)
          .describe(
            "Su f.d.p. copiada tal cual del enunciado, ej: 'lineal entre 10 y 30 minutos, donde f(30) = 2·f(10)'"
          ),
      })
    )
    .describe("Cada dato aleatorio del enunciado con su f.d.p."),
  seDecide: z
    .string()
    .trim()
    .min(5)
    .max(200)
    .describe("Qué se busca decidir (la variable de control), ej: 'la cantidad N de cajas'. Queda fija en la corrida."),
  complicaciones: z
    .array(z.string().trim().min(3).max(120))
    .min(2, "Un ejercicio de parcial combina al menos dos complicaciones.")
    .max(4)
    .describe(
      "Las complicaciones que combinás (dos o tres), ej: ['N puestos con N colas', 'arrepentimiento por tramos', " +
        "'dos tipos de cliente con distinto tiempo de atención']"
    ),
});

export type DatosEjercicio = z.infer<typeof DatosEjercicioSchema>;

/** El ejercicio como se guardó (lo muestra la vista). */
export type EjercicioGuardado = { titulo: string; enunciado: string; sePide: string[] };

/**
 * Revisiones que se rechazan como máximo en una misma respuesta. Después se guarda igual (con los avisos): un modelo
 * que no logra cumplir una regla no puede dejar al alumno sin ejercicio ni gastar todos los pasos reintentando.
 */
export const RECHAZOS_POR_RESPUESTA = 2;

/**
 * Lo que devuelve la tool: el ejercicio guardado (con los avisos de lo que no cumple, si se guardó igual); las
 * reglas de la cátedra que no cumple (no se guarda, el modelo lo corrige); o por qué no se pudo guardar.
 */
export type EjercicioGenerado =
  | { ok: true; id: string; ejercicio: EjercicioGuardado; avisos: string[] }
  | { ok: false; problemas: string[] }
  | { ok: false; error: string };

/**
 * Revisa el ejercicio y lo guarda en "Mis ejercicios" del alumno, asociado a la conversación donde se generó.
 * Si no cumple las reglas, no lo guarda y devuelve los problemas; con `rechazar: false`, lo guarda igual con avisos.
 */
export async function guardarEjercicio(
  ejercicios: EjerciciosModel,
  conversacionId: string,
  { tema, dificultad, titulo, enunciado, sePide, datosAleatorios }: DatosEjercicio,
  { rechazar = true }: { rechazar?: boolean } = {}
): Promise<EjercicioGenerado> {
  const problemas = problemasDelEjercicio({ enunciado, datosAleatorios });
  if (problemas.length > 0 && rechazar) return { ok: false, problemas };
  try {
    const guardado = await ejercicios.guardar(
      { tema, dificultad, payload: { titulo, enunciado, sePide } },
      conversacionId
    );
    return { ok: true, id: guardado.id, ejercicio: { titulo, enunciado, sePide }, avisos: problemas };
  } catch (error) {
    return { ok: false, error: `No se pudo guardar el ejercicio: ${(error as Error).message}` };
  }
}

/** Lo que lee el modelo del resultado: si se guardó, que no lo repita; si no, qué corregir. */
export function resumenDelEjercicio(resultado: EjercicioGenerado): string {
  if (resultado.ok && resultado.avisos.length > 0) {
    return (
      "Ejercicio guardado y mostrado al alumno, pero no cumple:\n" +
      resultado.avisos.map((aviso) => `- ${aviso}`).join("\n") +
      "\nNo lo repitas ni lo vuelvas a generar: avisale al alumno en una línea qué le falta al enunciado."
    );
  }
  if (resultado.ok) {
    return "Ejercicio guardado en «Mis ejercicios» y mostrado al alumno. No lo repitas en texto: deseale suerte en una línea.";
  }
  if ("problemas" in resultado) {
    return (
      "El ejercicio no cumple estas reglas de la cátedra (no se guardó y el alumno todavía no lo ve):\n" +
      resultado.problemas.map((problema) => `- ${problema}`).join("\n") +
      "\nCorregilo y volvé a llamar a generar_ejercicio."
    );
  }
  return `${resultado.error}. Mostrale el ejercicio en texto y avisale que no se pudo guardar.`;
}

/** La tool para `streamText`. Se crea por pedido: guarda con la sesión del alumno y en su conversación. */
export function crearToolsEjercicio(ejercicios: EjerciciosModel, conversacionId: string) {
  // Cuántas revisiones se rechazaron en esta respuesta (las tools se crean por pedido).
  let rechazos = 0;
  return {
    generar_ejercicio: tool({
      description:
        "Revisa el ejercicio nuevo que creaste con las reglas de la cátedra y, si las cumple, lo guarda en «Mis " +
        "ejercicios» y se lo muestra al alumno. Llamala SIEMPRE para dar un ejercicio nuevo, en vez de escribirlo en " +
        "el mensaje: si devuelve problemas, corregilo y volvé a llamarla.",
      inputSchema: DatosEjercicioSchema,
      execute: async (datos) => {
        const resultado = await guardarEjercicio(ejercicios, conversacionId, datos, {
          rechazar: rechazos < RECHAZOS_POR_RESPUESTA,
        });
        if (!resultado.ok && "problemas" in resultado) rechazos += 1;
        return resultado;
      },
      toModelOutput: ({ output }) => ({ type: "text", value: resumenDelEjercicio(output) }),
    }),
  };
}
