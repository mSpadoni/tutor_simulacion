// Qué código Mermaid se acepta como diagrama de flujo. Lógica pura: se valida antes de llamar a Kroki, así lo que
// no es un diagrama (o es desmedido) no viaja por la red y el modelo recibe enseguida por qué corregirlo.

/** Largo máximo del código Mermaid: un diagrama de la materia entra de sobra; más es un error del modelo. */
export const MAX_CARACTERES_MERMAID = 6000;

/** Por qué un código no es un diagrama aceptable. */
export type ProblemaDeMermaid = { motivo: "codigo_invalido" | "demasiado_largo"; detalle: string };

/** Si el código no es un diagrama de flujo aceptable, qué le pasa; si está bien, null. */
export function problemaDeMermaid(codigo: string): ProblemaDeMermaid | null {
  const limpio = codigo.trim();
  if (!/^(flowchart|graph)\s+(TD|TB|LR|RL|BT)\b/.test(limpio)) {
    return {
      motivo: "codigo_invalido",
      detalle: 'El código tiene que ser un diagrama de flujo de Mermaid: empezar con "flowchart TD".',
    };
  }
  if (limpio.length > MAX_CARACTERES_MERMAID) {
    return {
      motivo: "demasiado_largo",
      detalle: `El diagrama tiene ${limpio.length} caracteres; el máximo es ${MAX_CARACTERES_MERMAID}. Simplificalo.`,
    };
  }
  return null;
}
