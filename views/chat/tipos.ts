/**
 * Mismo formato que espera POST /api/chat.
 * `"alumno" | "tutor"`: el rol solo puede ser uno de esos dos textos exactos (tipo unión de literales).
 */
export type MensajeChat = {
  rol: "alumno" | "tutor";
  contenido: string;
};

/** Límites de /api/chat: el navegador manda solo los últimos mensajes y avisa antes de pasarse de largo. */
export const MAX_MENSAJES_CONTEXTO = 20;
export const MAX_CARACTERES_MENSAJE = 6000;
