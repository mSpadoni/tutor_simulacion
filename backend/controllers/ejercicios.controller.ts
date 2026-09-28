import { ejerciciosModel, type EjerciciosModel } from "@/backend/models/ejercicios.model";

/** Un ejercicio para la lista "Mis ejercicios": su título y la conversación donde se generó (si todavía existe). */
export type ItemEjercicio = { id: string; titulo: string; conversacionId: string | null };

/** Casos de uso de los ejercicios generados para el alumno. RLS limita todo a los suyos. */
export class EjerciciosController {
  constructor(private readonly ejercicios: () => EjerciciosModel = () => ejerciciosModel) {}

  /** Los últimos ejercicios del alumno para el costado (7, Ley de Miller), el más reciente arriba. */
  async listar(limite = 7): Promise<ItemEjercicio[]> {
    const ejercicios = await this.ejercicios().listarRecientes(limite);
    return ejercicios.map((ejercicio) => ({
      id: ejercicio.id,
      titulo: ejercicio.payload.titulo,
      conversacionId: ejercicio.conversacion_id,
    }));
  }
}

/** Instancia lista para usar desde las páginas. */
export const ejerciciosController = new EjerciciosController();
