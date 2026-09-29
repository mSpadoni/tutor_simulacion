import { z } from "zod";

// Qué es un ejercicio generado para el alumno. Lo usan la tool generar_ejercicio (lo que arma el LLM tiene que
// cumplirlo) y el repositorio de ejercicios (lo valida al guardarlo y al leerlo de la base).

/**
 * Un ejercicio: tema, dificultad y `payload`, el ejercicio completo (título, enunciado y consignas del "Se pide:").
 * Los límites coinciden con los de la tabla `ejercicios` de la base.
 */
export const EjercicioSchema = z.object({
  tema: z.string().trim().min(1).max(80),
  dificultad: z.enum(["facil", "media", "dificil"]),
  payload: z.object({
    titulo: z.string().trim().min(1).max(120),
    enunciado: z.string().trim().min(50),
    sePide: z.array(z.string().trim().min(1)).min(1),
  }),
});

export type NuevoEjercicio = z.infer<typeof EjercicioSchema>;
