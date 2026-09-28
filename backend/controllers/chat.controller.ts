import "server-only";
import { createUIMessageStreamResponse, type LanguageModel } from "ai";
import { crearModeloOpenAI } from "@/backend/lib/openai";
import { conversacionesModel, type ConversacionesModel } from "@/backend/models/conversaciones.model";
import { ejerciciosModel, type EjerciciosModel } from "@/backend/models/ejercicios.model";
import { obtenerMaterialCatedra, type MaterialCatedra } from "@/backend/models/materialCatedra.model";
import type { PedidoDeChat } from "@/backend/models/pedidoDeChat.model";
import { crearToolsTutor } from "@/backend/tools/tutor.tools";
import { PAUSA_ENTRE_PALABRAS_MS, responderComoTutor } from "@/backend/tutor/agente";
import { ErrorDeChat, traducirError } from "@/backend/tutor/errores";
import { MAX_MENSAJES_CONTEXTO } from "@/shared/chat";
import { tituloDesde } from "@/shared/conversaciones";

/**
 * Lo que se le puede pasar al ChatController para reemplazar sus piezas (útil en los tests).
 * Todas llevan `?`: son opcionales y, si no se pasan, se usan las reales.
 */
type Dependencias = {
  crearModelo?: () => LanguageModel;
  material?: () => MaterialCatedra;
  conversaciones?: () => ConversacionesModel;
  ejercicios?: () => EjerciciosModel;
  timeoutMs?: number;
  /** Pausa entre palabras al mostrar la respuesta (ms). 0 = tan rápido como llega del modelo. */
  pausaEntrePalabrasMs?: number;
};

/**
 * Responde un mensaje del alumno en streaming: lee el historial de la base, guarda el mensaje nuevo, le pasa
 * todo al agente (backend/tutor/agente.ts) y, cuando la respuesta termina, la guarda.
 * Lo del LLM (prompt, tools, streaming) está en el agente; lo que ve el alumno si falla, en backend/tutor/errores.ts.
 */
export class ChatController {
  private readonly crearModelo: () => LanguageModel;
  private readonly material: () => MaterialCatedra;
  private readonly conversaciones: () => ConversacionesModel;
  private readonly ejercicios: () => EjerciciosModel;
  private readonly timeoutMs: number;
  private readonly pausaEntrePalabrasMs: number;

  // Recibe UN objeto y lo desestructura en el momento: cada propiedad con su valor por defecto (`= ...`).
  // `: Dependencias = {}` → el objeto entero es opcional: `new ChatController()` usa todo lo real.
  constructor({
    crearModelo = () => crearModeloOpenAI(),
    material = obtenerMaterialCatedra,
    conversaciones = () => conversacionesModel,
    ejercicios = () => ejerciciosModel,
    timeoutMs = 45_000,
    pausaEntrePalabrasMs = PAUSA_ENTRE_PALABRAS_MS,
  }: Dependencias = {}) {
    this.crearModelo = crearModelo;
    this.material = material;
    this.conversaciones = conversaciones;
    this.ejercicios = ejercicios;
    this.timeoutMs = timeoutMs;
    this.pausaEntrePalabrasMs = pausaEntrePalabrasMs;
  }

  /**
   * Devuelve la respuesta del tutor como stream (el formato que entiende useChat en el navegador).
   * Si algo falla antes de empezar (la conversación es de otro alumno, la base no responde) tira un ErrorDeChat;
   * si falla el modelo en el medio, el error llega dentro del stream con el mensaje para el alumno.
   */
  async responder(pedido: PedidoDeChat): Promise<Response> {
    const conversaciones = this.conversaciones();
    const { conversacionId, mensaje } = pedido;

    // 0) El modelo primero: si falta configuración (ej. OPENAI_API_KEY), se corta antes de guardar nada y el
    //    alumno ve el mensaje de siempre en vez de un 500 genérico.
    let modelo: LanguageModel;
    try {
      modelo = this.crearModelo();
    } catch (error) {
      throw traducirError(error);
    }

    // 1) La conversación: si es nueva, se crea con el primer mensaje como título.
    if (!(await conversaciones.obtener(conversacionId))) {
      // Si falla, el id ya existe pero es de otro alumno (RLS no se la deja ver).
      await conversaciones.crear(conversacionId, tituloDesde(pedido.texto)).catch((error: unknown) => {
        throw new ErrorDeChat("No encontramos esa conversación. Empezá una nueva.", 404, { cause: error });
      });
    }

    // 2) El historial (sin el mensaje nuevo, por si es un reintento y ya estaba guardado) y el mensaje nuevo.
    const historial = (await conversaciones.mensajes(conversacionId, MAX_MENSAJES_CONTEXTO)).filter(
      (anterior) => anterior.id !== mensaje.id
    );
    await conversaciones.agregarMensajes(conversacionId, [mensaje]);

    // 3) La respuesta del agente, en streaming. Al terminar (o si el alumno la corta), se guarda.
    const stream = await responderComoTutor({
      modelo,
      mensajes: [...historial, mensaje],
      tools: crearToolsTutor({ material: this.material(), ejercicios: this.ejercicios(), conversacionId }),
      timeoutMs: this.timeoutMs,
      pausaEntrePalabrasMs: this.pausaEntrePalabrasMs,
      alTerminar: (respuesta) =>
        conversaciones.agregarMensajes(conversacionId, [respuesta]).catch((error: unknown) => {
          console.error("No se pudo guardar la respuesta del tutor:", error);
        }),
    });
    return createUIMessageStreamResponse({ stream });
  }
}

/** Instancia única lista para usar desde la ruta /api/chat. */
export const chatController = new ChatController();
