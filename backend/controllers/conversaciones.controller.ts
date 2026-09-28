import "server-only";
import type { UIMessage } from "ai";
import { z } from "zod";
import {
  conversacionesModel,
  type ConversacionesModel,
  type ConversacionGuardada,
} from "@/backend/models/conversaciones.model";

/** Una conversación abierta: sus datos (null si todavía no se guardó ningún mensaje) y su historial. */
export type ConversacionAbierta = { conversacion: ConversacionGuardada | null; mensajes: UIMessage[] };

/** ¿Es un id válido de conversación? (los genera el servidor con crypto.randomUUID) */
export function esIdDeConversacion(id: string): boolean {
  return z.uuid().safeParse(id).success;
}

/**
 * Casos de uso de las conversaciones del alumno: la lista del costado, abrir una y borrarla.
 * Todo pasa por el model con la sesión del alumno, así que RLS limita a sus propias conversaciones.
 */
export class ConversacionesController {
  constructor(private readonly conversaciones: () => ConversacionesModel = () => conversacionesModel) {}

  /** Las conversaciones del alumno para el costado, la más reciente arriba. */
  listar(): Promise<ConversacionGuardada[]> {
    return this.conversaciones().listar();
  }

  /**
   * Abre una conversación. Si no existe (es nueva, o es de otro alumno y RLS la oculta) devuelve
   * `conversacion: null` y sin mensajes: el chat arranca vacío y se guarda con el primer mensaje.
   */
  async abrir(id: string): Promise<ConversacionAbierta> {
    const conversacion = await this.conversaciones().obtener(id);
    if (!conversacion) return { conversacion: null, mensajes: [] };
    return { conversacion, mensajes: await this.conversaciones().mensajes(id) };
  }

  /** Borra una conversación del alumno. Devuelve false si no existía o no era suya. */
  borrar(id: string): Promise<boolean> {
    if (!esIdDeConversacion(id)) return Promise.resolve(false);
    return this.conversaciones().borrar(id);
  }
}

/** Instancia lista para usar desde las páginas y server actions. */
export const conversacionesController = new ConversacionesController();
