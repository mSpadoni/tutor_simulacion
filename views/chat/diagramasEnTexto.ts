// A veces el tutor escribe un diagrama como código Mermaid en el texto en vez de usar la tool que lo dibuja.
// Esto separa esos bloques del resto del texto para que la vista los muestre como imagen. Lógica pura.

/** Un pedazo de la respuesta del tutor: texto Markdown, o un diagrama que escribió como código. */
export type BloqueDeRespuesta = { tipo: "texto"; texto: string } | { tipo: "diagrama"; mermaid: string };

/**
 * Un bloque de código completo (con su cierre): con el lenguaje "mermaid", o sin lenguaje pero empezando con
 * "flowchart"/"graph". Un bloque sin cerrar (la respuesta todavía está llegando) no se toma: se dibujaría a medias.
 */
const BLOQUE_DE_CODIGO = /^[ \t]*```[ \t]*([\w-]*)[ \t]*\n([\s\S]*?)\n[ \t]*```[ \t]*$/gm;
const EMPIEZA_COMO_DIAGRAMA = /^\s*(flowchart|graph)\s+(TD|TB|LR|RL|BT)\b/;

/** Parte el texto en bloques de texto y diagramas, en el orden en que aparecen. */
export function partirEnBloques(texto: string): BloqueDeRespuesta[] {
  const bloques: BloqueDeRespuesta[] = [];
  let desde = 0;
  for (const coincidencia of texto.matchAll(BLOQUE_DE_CODIGO)) {
    const [bloque, lenguaje, codigo] = coincidencia;
    const esDiagrama = lenguaje === "mermaid" || (lenguaje === "" && EMPIEZA_COMO_DIAGRAMA.test(codigo));
    if (!esDiagrama || !EMPIEZA_COMO_DIAGRAMA.test(codigo)) continue;
    const antes = texto.slice(desde, coincidencia.index).trim();
    if (antes) bloques.push({ tipo: "texto", texto: antes });
    bloques.push({ tipo: "diagrama", mermaid: codigo.trim() });
    desde = coincidencia.index + bloque.length;
  }
  const resto = texto.slice(desde).trim();
  if (resto) bloques.push({ tipo: "texto", texto: resto });
  return bloques;
}
