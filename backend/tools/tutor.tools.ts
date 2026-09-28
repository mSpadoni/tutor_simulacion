import "server-only";
import type { EjerciciosModel } from "@/backend/models/ejercicios.model";
import type { MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { crearToolsDiagrama } from "@/backend/tools/diagrama.tools";
import { crearToolsEjercicio } from "@/backend/tools/ejercicio.tools";
import { crearToolsFdp } from "@/backend/tools/fdp.tools";
import { crearToolsMaterial } from "@/backend/tools/material.tools";

/** Lo que necesitan las tools para un pedido: el material, dónde guardar ejercicios y en qué conversación. */
export type ContextoDeTools = {
  material: MaterialCatedra;
  ejercicios: EjerciciosModel;
  conversacionId: string;
};

/**
 * Todas las tools del tutor, en un solo lugar. De acá sale también el tipo de los mensajes que ve el navegador
 * (shared/chat.ts): si una tool cambia de nombre, de datos o de resultado, la vista deja de compilar.
 */
export function crearToolsTutor({ material, ejercicios, conversacionId }: ContextoDeTools) {
  return {
    ...crearToolsMaterial(material),
    ...crearToolsDiagrama(),
    ...crearToolsFdp(),
    ...crearToolsEjercicio(ejercicios, conversacionId),
  };
}

/** El tipo del conjunto de tools del tutor (para derivar el tipo de los mensajes). */
export type ToolsDelTutor = ReturnType<typeof crearToolsTutor>;
