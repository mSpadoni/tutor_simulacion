import "server-only";
import { datosOError } from "@/backend/lib/supabase/consultas";
import { crearClienteServidor, type ClienteSupabase } from "@/backend/lib/supabase/server";
import { EjercicioSchema, type NuevoEjercicio } from "@/backend/models/dominio/ejercicio";
import type { Database } from "@/backend/types/database";

type FilaEjercicio = Database["public"]["Tables"]["ejercicios"]["Row"];

/** Un ejercicio tal como está en la base, con su payload ya validado (ver models/dominio/ejercicio.ts). */
export type EjercicioGuardado = Omit<FilaEjercicio, "payload"> & { payload: NuevoEjercicio["payload"] };

/**
 * La fila con su payload validado. payload es jsonb (la base no conoce su forma): una fila mal formada (guardada a
 * mano, o con una versión vieja del esquema) da null en vez de romper el sidebar con un campo que falta.
 */
function conPayloadValido(fila: FilaEjercicio): EjercicioGuardado | null {
  const payload = EjercicioSchema.shape.payload.safeParse(fila.payload);
  if (!payload.success) {
    console.warn(`Ejercicio ${fila.id} con payload inválido: se omite.`, payload.error.issues[0]?.message);
    return null;
  }
  return { ...fila, payload: payload.data };
}

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
    const guardado = datosOError(
      await supabase
        .from("ejercicios")
        .insert({ ...ejercicio, conversacion_id: conversacionId })
        .select()
        .single(),
      "No se pudo guardar el ejercicio"
    );
    // El payload que se devuelve es el que se validó y se guardó recién.
    return { ...guardado, payload: ejercicio.payload };
  }

  /** Los últimos ejercicios del alumno, el más reciente primero. Por defecto 7 (Ley de Miller). */
  async listarRecientes(limite = 7): Promise<EjercicioGuardado[]> {
    const supabase = await this.crearCliente();
    const ejercicios = datosOError(
      await supabase.from("ejercicios").select("*").order("creado_en", { ascending: false }).limit(limite),
      "No se pudieron leer los ejercicios"
    );
    return ejercicios.flatMap((fila) => conPayloadValido(fila) ?? []);
  }
}

/** Instancia lista para usar desde la app (con el cliente del request). */
export const ejerciciosModel = new EjerciciosModel();
