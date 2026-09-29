import "server-only";
import type { EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";
import type { MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { crearToolsAnalisis } from "@/backend/tools/analisis.tools";
import { crearToolsDiagrama } from "@/backend/tools/diagrama.tools";
import { crearToolsEjercicio } from "@/backend/tools/ejercicio.tools";
import { crearToolsFdp } from "@/backend/tools/fdp.tools";
import { crearToolBuscarEjercicio } from "@/backend/tools/buscarEjercicio.tools";
import { crearToolConsultarModelos } from "@/backend/tools/consultarModelos.tools";
import { crearToolInspiracionParaEjercicio } from "@/backend/tools/inspiracionParaEjercicio.tools";
import { crearToolResueltosParecidos } from "@/backend/tools/resueltosParecidos.tools";

/**
 * Lo que necesitan las tools para un pedido: el material, dónde guardar ejercicios, en qué conversación y el
 * mensaje del alumno (para no guardar como ejercicio nuevo el enunciado que pegó para resolver).
 */
export type ContextoDeTools = {
  material: MaterialCatedra;
  ejercicios: EjerciciosModel;
  conversacionId: string;
  mensajeDelAlumno?: string;
};

/**
 * Todas las tools del tutor, en un solo lugar. De acá sale también el tipo de los mensajes que ve el navegador
 * (shared/chat.ts): si una tool cambia de nombre, de datos o de resultado, la vista deja de compilar.
 */
export function crearToolsTutor({ material, ejercicios, conversacionId, mensajeDelAlumno = "" }: ContextoDeTools) {
  return {
    ...crearToolConsultarModelos(material),
    ...crearToolBuscarEjercicio(material),
    ...crearToolInspiracionParaEjercicio(material),
    ...crearToolResueltosParecidos(material),
    ...crearToolsAnalisis(),
    ...crearToolsDiagrama(),
    ...crearToolsFdp(),
    ...crearToolsEjercicio(ejercicios, conversacionId, mensajeDelAlumno),
  };
}

/** El tipo del conjunto de tools del tutor (para derivar el tipo de los mensajes). */
export type ToolsDelTutor = ReturnType<typeof crearToolsTutor>;
