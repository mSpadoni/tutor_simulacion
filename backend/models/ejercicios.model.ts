import { z } from "zod";
import { crearClienteServidor, type ClienteSupabase } from "@/backend/lib/supabase/server";
import type { Database } from "@/backend/types/database";

type FilaEjercicio = Database["public"]["Tables"]["ejercicios"]["Row"];

/**
 * Un ejercicio generado para el alumno, validado con Zod antes de guardarlo.
 * `payload` es el ejercicio completo: título, enunciado y consignas ("Se pide:").
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
export type EjercicioGuardado = Omit<FilaEjercicio, "payload"> & { payload: NuevoEjercicio["payload"] };

/**
 * Acceso a la tabla ejercicios.
 * No filtra por usuario a mano: las políticas RLS ya limitan todo al alumno logueado.
 */
export class EjerciciosModel {
  constructor(private readonly crearCliente: () => Promise<ClienteSupabase> = crearClienteServidor) {}

  /**
   * Valida el ejercicio y lo guarda a nombre del alumno logueado.
   * `conversacionId`: la conversación donde se generó (para volver a ella desde "Mis ejercicios").
   */
  async guardar(datos: NuevoEjercicio, conversacionId: string | null = null): Promise<EjercicioGuardado> {
    const ejercicio = EjercicioSchema.parse(datos);
    const supabase = await this.crearCliente();
    const { data, error } = await supabase
      .from("ejercicios")
      .insert({ ...ejercicio, conversacion_id: conversacionId })
      .select()
      .single();
    if (error) throw new Error(`No se pudo guardar el ejercicio: ${error.message}`);
    return data as EjercicioGuardado;
  }

  /** Los últimos ejercicios del alumno, el más reciente primero. Por defecto 7 (Ley de Miller). */
  async listarRecientes(limite = 7): Promise<EjercicioGuardado[]> {
    const supabase = await this.crearCliente();
    const { data, error } = await supabase
      .from("ejercicios")
      .select("*")
      .order("creado_en", { ascending: false })
      .limit(limite);
    if (error) throw new Error(`No se pudieron leer los ejercicios: ${error.message}`);
    return data as EjercicioGuardado[];
  }
}

/** Instancia lista para usar desde la app (con el cliente del request). */
export const ejerciciosModel = new EjerciciosModel();
