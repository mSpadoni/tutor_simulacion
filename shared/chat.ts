import type { InferUITools, UIDataTypes, UIMessage } from "ai";
import type { ToolsDelTutor } from "@/backend/tools/tutor.tools";

// El contrato entre el navegador y /api/chat: límites y el tipo de los mensajes, en un solo lugar.
// El tipo de los mensajes se deriva de las tools del servidor (`import type`: no arrastra código al navegador),
// así la vista sabe exactamente qué datos y qué resultado tiene cada tool.

/** Largo máximo de un mensaje del alumno (lo valida el servidor y lo avisa el campo de texto). */
export const MAX_CARACTERES_MENSAJE = 6000;

/** Mensajes previos que se le pasan al modelo como contexto. */
export const MAX_MENSAJES_CONTEXTO = 20;

/** Cada tool del tutor con el tipo de sus datos (input) y de su resultado (output). */
export type HerramientasDelTutor = InferUITools<ToolsDelTutor>;

/** Los nombres de las tools del tutor ("consultar_modelos", "generar_diagrama_flujo"…). */
export type NombreDeHerramienta = keyof HerramientasDelTutor;

/**
 * Datos de cada respuesta del tutor para el panel de debug. Los manda el servidor mientras responde (el modelo al
 * empezar, los pasos a medida que pasan, los tokens y la demora al final). No se guardan en la base: al reabrir
 * una conversación, las respuestas viejas muestran sus tools pero no estos datos.
 */
export type MetadatosDeRespuesta = {
  modelo?: string;
  /** Rondas con el modelo: cada tool usada suma una, más la respuesta final. */
  pasos?: number;
  /** Demora total, desde el pedido hasta el último token (ms). */
  ms?: number;
  tokens?: { entrada?: number; salida?: number; total?: number };
  /** Por qué terminó: "stop" (normal), "length" (llegó al máximo de tokens), "tool-calls"... */
  motivoDeFin?: string;
};

/** Un mensaje del chat del tutor, con sus partes tipadas (texto, y cada tool con sus datos y resultado). */
export type TutorUIMessage = UIMessage<MetadatosDeRespuesta, UIDataTypes, HerramientasDelTutor>;

/** Una parte de un mensaje del tutor. */
export type ParteDelTutor = TutorUIMessage["parts"][number];
