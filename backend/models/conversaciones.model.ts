import "server-only";
import type { UIMessage } from "ai";
import type { TutorUIMessage } from "@/shared/chat";
import { crearClienteServidor, type ClienteSupabase } from "@/backend/lib/supabase/server";
import type { Database, Json } from "@/backend/types/database";

type FilaConversacion = Database["public"]["Tables"]["conversaciones"]["Row"];

/** Una conversación del alumno, para listarla (sin mensajes). */
export type ConversacionGuardada = Pick<FilaConversacion, "id" | "titulo" | "creado_en" | "actualizado_en">;

/** Largo máximo del título (el mismo límite que pone la base). */
export const MAX_CARACTERES_TITULO = 120;

/**
 * Acceso a las tablas conversaciones y mensajes.
 * No filtra por usuario a mano: las políticas RLS ya limitan todo al alumno logueado.
 * Los mensajes se guardan con el formato del Vercel AI SDK (UIMessage): rol + partes.
 */
export class ConversacionesModel {
  // El cliente de Supabase entra por el constructor: la app usa el del request; los tests, uno de prueba.
  constructor(private readonly crearCliente: () => Promise<ClienteSupabase> = crearClienteServidor) {}

  /** Crea una conversación del alumno logueado con el id que generó el navegador. */
  async crear(id: string, titulo: string): Promise<ConversacionGuardada> {
    const supabase = await this.crearCliente();
    const { data, error } = await supabase
      .from("conversaciones")
      .insert({ id, titulo: titulo.slice(0, MAX_CARACTERES_TITULO) })
      .select("id, titulo, creado_en, actualizado_en")
      .single();
    if (error) throw new Error(`No se pudo crear la conversación: ${error.message}`);
    return data;
  }

  /** La conversación con ese id, o null si no existe o es de otro alumno (RLS la oculta). */
  async obtener(id: string): Promise<ConversacionGuardada | null> {
    const supabase = await this.crearCliente();
    const { data, error } = await supabase
      .from("conversaciones")
      .select("id, titulo, creado_en, actualizado_en")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`No se pudo leer la conversación: ${error.message}`);
    return data;
  }

  /** Las conversaciones del alumno, la más reciente arriba. */
  async listar(limite = 30): Promise<ConversacionGuardada[]> {
    const supabase = await this.crearCliente();
    const { data, error } = await supabase
      .from("conversaciones")
      .select("id, titulo, creado_en, actualizado_en")
      .order("actualizado_en", { ascending: false })
      .limit(limite);
    if (error) throw new Error(`No se pudieron leer las conversaciones: ${error.message}`);
    return data;
  }

  /**
   * Los últimos `limite` mensajes de la conversación, en orden (el más viejo primero),
   * en el formato del AI SDK: "alumno" → user y "tutor" → assistant.
   */
  async mensajes(conversacionId: string, limite = 200): Promise<TutorUIMessage[]> {
    const supabase = await this.crearCliente();
    // Se piden los más nuevos primero (para quedarse con los últimos) y después se da vuelta la lista.
    const { data, error } = await supabase
      .from("mensajes")
      .select("id, rol, partes")
      .eq("conversacion_id", conversacionId)
      .order("creado_en", { ascending: false })
      .limit(limite);
    if (error) throw new Error(`No se pudieron leer los mensajes: ${error.message}`);
    return data.reverse().map((fila): TutorUIMessage => ({
      id: fila.id,
      role: fila.rol === "alumno" ? "user" : "assistant",
      // jsonb sin tipo: se confía en lo que guardó el propio servidor (los mensajes que arma el AI SDK).
      parts: fila.partes as unknown as TutorUIMessage["parts"],
    }));
  }

  /** Guarda mensajes en la conversación y la marca como la más reciente. */
  async agregarMensajes(conversacionId: string, mensajes: readonly UIMessage[]): Promise<void> {
    if (mensajes.length === 0) return;
    const supabase = await this.crearCliente();
    // Cada mensaje con 1 ms de diferencia: así el orden queda fijo aunque se guarden en el mismo insert.
    const ahora = Date.now();
    // upsert con ignoreDuplicates = "insertá, y si ya existe ese id, no hagas nada": al reintentar después de un
    // error, el navegador vuelve a mandar el mismo mensaje del alumno y no tiene que quedar dos veces.
    const { error } = await supabase.from("mensajes").upsert(
      mensajes.map((mensaje, i) => ({
        id: mensaje.id,
        conversacion_id: conversacionId,
        rol: mensaje.role === "user" ? "alumno" : "tutor",
        partes: mensaje.parts as unknown as NonNullable<Json>,
        creado_en: new Date(ahora + i).toISOString(),
      })),
      { onConflict: "conversacion_id,id", ignoreDuplicates: true }
    );
    if (error) throw new Error(`No se pudieron guardar los mensajes: ${error.message}`);

    const { error: errorFecha } = await supabase
      .from("conversaciones")
      .update({ actualizado_en: new Date().toISOString() })
      .eq("id", conversacionId);
    if (errorFecha) throw new Error(`No se pudo actualizar la conversación: ${errorFecha.message}`);
  }

  /** Borra la conversación (y sus mensajes, en cascada). Devuelve false si no existía o era de otro alumno. */
  async borrar(id: string): Promise<boolean> {
    const supabase = await this.crearCliente();
    const { data, error } = await supabase.from("conversaciones").delete().eq("id", id).select("id");
    if (error) throw new Error(`No se pudo borrar la conversación: ${error.message}`);
    return data.length > 0;
  }
}

/** Instancia lista para usar desde la app (con el cliente del request). */
export const conversacionesModel = new ConversacionesModel();
