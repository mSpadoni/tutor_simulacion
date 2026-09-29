// Cuántos mensajes puede mandar un alumno al tutor. Cada mensaje gasta crédito de OpenAI: sin límite, un alumno
// (o un script con su sesión) podría agotarlo. Lógica pura: los conteos los trae el repositorio de conversaciones.

export type LimitesDeUso = { porMinuto: number; porDia: number };

/** Holgados para estudiar (una consulta cada 6 s sostenida es mucho), cortos para un abuso. */
export const LIMITES_DE_USO: LimitesDeUso = { porMinuto: 10, porDia: 150 };

/** Cuántos mensajes mandó el alumno en el último minuto y en las últimas 24 horas. */
export type UsoReciente = { ultimoMinuto: number; ultimoDia: number };

/** Si el alumno ya llegó a un límite, el mensaje para mostrarle; si puede seguir, null. */
export function motivoDeLimite(uso: UsoReciente, limites: LimitesDeUso = LIMITES_DE_USO): string | null {
  if (uso.ultimoDia >= limites.porDia) {
    return `Llegaste al máximo de ${limites.porDia} mensajes por día. Mañana podés seguir practicando.`;
  }
  if (uso.ultimoMinuto >= limites.porMinuto) {
    return "Mandaste muchos mensajes seguidos. Esperá un minuto y seguí.";
  }
  return null;
}
