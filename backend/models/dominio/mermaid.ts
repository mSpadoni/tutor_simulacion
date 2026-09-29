// Qué código Mermaid se acepta como diagrama de flujo. Lógica pura: se valida antes de llamar a Kroki, así lo que
// no es un diagrama (o es desmedido) no viaja por la red y el modelo recibe enseguida por qué corregirlo.

/** Largo máximo del código Mermaid: un diagrama de la materia entra de sobra; más es un error del modelo. */
export const MAX_CARACTERES_MERMAID = 6000;

/** Estilo de los conectores de la cátedra (círculo azul con letra): el modelo solo marca el nodo con `:::conector`. */
const ESTILO_CONECTOR = "classDef conector fill:#2563eb,stroke:#1e40af,color:#ffffff";

/** Agrega el estilo de los conectores debajo de la primera línea (`flowchart TD`), si el código no lo define ya. */
export function conEstilosDeLaCatedra(codigo: string): string {
  if (/classDef\s+conector\b/.test(codigo)) return codigo;
  const [primera, ...resto] = codigo.trim().split("\n");
  return [primera, `  ${ESTILO_CONECTOR}`, ...resto].join("\n");
}

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
