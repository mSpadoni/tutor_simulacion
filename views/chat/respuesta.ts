import { textoDe, type TutorUIMessage } from "@/shared/chat";
import { tituloDesde } from "@/shared/conversaciones";

// Qué hace la vista cuando termina una respuesta del tutor. Funciones puras: las usa useChatDelTutor.

/** Lo que lee el lector de pantalla cuando el tutor termina de responder (la respuesta entera, una sola vez). */
export function anuncioDeRespuesta(respuesta: TutorUIMessage): string {
  return `El tutor respondió: ${textoDe(respuesta)}`;
}

/**
 * El título de la conversación para el sidebar: el mismo que le pone el servidor al crearla (a partir del primer
 * mensaje del alumno), así el sidebar lo muestra sin volver a consultar la base.
 */
export function tituloDeLaConversacion(mensajes: TutorUIMessage[]): string {
  const primero = mensajes.find((mensaje) => mensaje.role === "user");
  return tituloDesde(primero ? textoDe(primero) : "");
}

/**
 * Atajos siempre visibles debajo del campo: el alumno puede cambiar de tarea en cualquier momento (heurística #6,
 * reconocer antes que recordar).
 */
export const ATAJOS = [
  { titulo: "Dame un ejercicio tipo parcial", mensaje: "Dame un ejercicio nuevo para practicar, tipo parcial." },
  { titulo: "Corregí mi resolución", mensaje: "Corregime esta resolución: " },
  { titulo: "Resolvé esta f.d.p.", mensaje: "Resolveme esta f.d.p.: " },
  { titulo: "Tengo una duda teórica", mensaje: "Tengo una duda teórica: " },
] as const;

/** Un atajo completo (termina en ".") se manda directo; uno que termina en ":" espera que el alumno lo complete. */
export function atajoEstaCompleto(mensaje: string): boolean {
  return mensaje.trimEnd().endsWith(".");
}
