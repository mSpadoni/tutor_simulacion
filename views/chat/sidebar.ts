import type { TutorUIMessage } from "@/shared/chat";

// Estado del sidebar (conversaciones y "Mis ejercicios") y cómo cambia con lo que pasa en el chat.
// Funciones puras: el sidebar se actualiza con lo que el navegador ya sabe (el mensaje que mandó, lo que respondió
// el tutor), sin volver a consultar la base. La página lo lee de la base una vez, al abrir cada conversación.

/** Lo que el costado necesita de cada conversación. */
export type ItemConversacion = { id: string; titulo: string };

/** Un ejercicio de "Mis ejercicios": al tocarlo se vuelve a la conversación donde se generó (si todavía existe). */
export type ItemEjercicio = { id: string; titulo: string; conversacionId: string | null };

export type EstadoSidebar = { conversaciones: ItemConversacion[]; ejercicios: ItemEjercicio[] };

/** Cuántos ejercicios muestra "Mis ejercicios" (Ley de Miller; el mismo límite que usa la página). */
export const MAX_EJERCICIOS_EN_SIDEBAR = 7;

/** Hubo actividad en una conversación: pasa a estar arriba (si es nueva, se agrega con su título). */
export function conActividad(estado: EstadoSidebar, conversacion: ItemConversacion): EstadoSidebar {
  const existente = estado.conversaciones.find((item) => item.id === conversacion.id);
  const resto = estado.conversaciones.filter((item) => item.id !== conversacion.id);
  return { ...estado, conversaciones: [existente ?? conversacion, ...resto] };
}

/** Ejercicios nuevos arriba de "Mis ejercicios", sin repetir y respetando el máximo. */
export function conEjercicios(estado: EstadoSidebar, nuevos: ItemEjercicio[]): EstadoSidebar {
  if (nuevos.length === 0) return estado;
  const ids = new Set(nuevos.map((ejercicio) => ejercicio.id));
  const ejercicios = [...nuevos, ...estado.ejercicios.filter((ejercicio) => !ids.has(ejercicio.id))];
  return { ...estado, ejercicios: ejercicios.slice(0, MAX_EJERCICIOS_EN_SIDEBAR) };
}

/**
 * Se borró una conversación: sale de la lista y sus ejercicios quedan en "Mis ejercicios" sin enlace
 * (igual que en la base: on delete set null).
 */
export function sinConversacion(estado: EstadoSidebar, id: string): EstadoSidebar {
  return {
    conversaciones: estado.conversaciones.filter((conversacion) => conversacion.id !== id),
    ejercicios: estado.ejercicios.map((ejercicio) =>
      ejercicio.conversacionId === id ? { ...ejercicio, conversacionId: null } : ejercicio
    ),
  };
}

/**
 * Los ejercicios que el tutor guardó en este mensaje: partes de generar_ejercicio que terminaron bien
 * (el resultado trae el id; el título viene en lo que el modelo le pasó a la tool).
 */
export function ejerciciosGuardadosEn(mensaje: TutorUIMessage, conversacionId: string): ItemEjercicio[] {
  return mensaje.parts.flatMap((parte) => {
    // Con el tipo del mensaje, al preguntar por type y state TypeScript ya sabe qué forma tienen input y output.
    if (parte.type !== "tool-generar_ejercicio" || parte.state !== "output-available" || !parte.output.ok) return [];
    return [{ id: parte.output.id, titulo: parte.input.titulo, conversacionId }];
  });
}
