// Una ficha del material de la cátedra y cómo se lee de un archivo Markdown. Lógica pura: recibe el texto
// del archivo (quién lo lee del disco es MaterialCatedra).

/**
 * Para qué sirve una ficha. Cada archivo lo declara en una línea "> tipo: ..." debajo del título.
 * - modelo: modelos de la cátedra (guía oficial 1 a 8, clases). Sirven para explicar; no se dan como ejercicio.
 * - ejercicio: anexa, parciales, ejercicios resueltos, guía oficial 9 a 12. Son lo que se le da al alumno para
 *   practicar y la referencia de redacción y complejidad para inventar ejercicios nuevos.
 * - pendiente: material que todavía no se usa (Δt, guía oficial 13 en adelante). No se carga.
 */
export const TIPOS_DE_FICHA = ["modelo", "ejercicio", "pendiente"] as const;
export type TipoDeFicha = (typeof TIPOS_DE_FICHA)[number];

/** Un ejercicio o apunte del material de la cátedra (una sección "###" de los archivos de backend/knowledge). */
export type Ficha = {
  id: string;
  tipo: TipoDeFicha;
  fuente: string;
  categoria: string;
  titulo: string;
  contenido: string;
  tokensAprox: number;
};

/** Dónde empieza la resolución de la cátedra en una ficha ("Metodología:" o "- **Datos:**"), o -1 si no tiene. */
function inicioDeResolucion(ficha: Ficha): number {
  return ficha.contenido.search(/^(Metodolog[ií]a:|- \*\*Datos:\*\*)/m);
}

/** El enunciado de una ficha, sin la resolución de la cátedra. */
export function enunciadoDe(ficha: Ficha): string {
  const inicio = inicioDeResolucion(ficha);
  return (inicio === -1 ? ficha.contenido : ficha.contenido.slice(0, inicio)).trim();
}

/**
 * La resolución de la cátedra de una ficha, o "" si no tiene. Puede tener errores: el tutor la usa como
 * referencia, verificándola con la base de conocimiento y los modelos.
 */
export function resolucionDe(ficha: Ficha): string {
  const inicio = inicioDeResolucion(ficha);
  return inicio === -1 ? "" : ficha.contenido.slice(inicio).trim();
}

/** Estimación rápida de cuántos tokens ocupa un texto (~3,5 caracteres por token en español). Math.ceil redondea para arriba. */
function aproximarTokens(texto: string): number {
  return Math.ceil(texto.length / 3.5);
}

/** Lee la línea "> tipo: ..." del archivo. Sin esa línea el archivo está mal armado: mejor fallar al cargar. */
function leerTipo(nombreArchivo: string, texto: string): TipoDeFicha {
  const tipo = texto.match(/^> tipo: *(\S+) *$/m)?.[1];
  if (!TIPOS_DE_FICHA.includes(tipo as TipoDeFicha)) {
    throw new Error(`${nombreArchivo}: falta la línea "> tipo: modelo | ejercicio | pendiente" debajo del título`);
  }
  return tipo as TipoDeFicha;
}

/** Parte un archivo Markdown en fichas: "# fuente", "## categoría", "### ficha". */
export function leerFichas(nombreArchivo: string, texto: string): Ficha[] {
  const tipo = leerTipo(nombreArchivo, texto);
  // Busca la primera línea "# ..." y toma lo que sigue (grupo [1] de la expresión regular).
  // Si no hay (`?.` da undefined), `??` usa el nombre del archivo como fuente.
  const fuente = texto.match(/^# (.+)$/m)?.[1].trim() ?? nombreArchivo;
  const fichas: Ficha[] = [];
  let categoria = "";
  // La ficha que se está leyendo ahora (título + líneas juntadas hasta el momento), o null si no hay ninguna abierta.
  let actual: { titulo: string; lineas: string[] } | null = null;

  // Función flecha guardada en una constante: termina la ficha abierta y la agrega a la lista.
  const cerrar = () => {
    if (!actual) return;
    const contenido = actual.lineas.join("\n").trim();
    fichas.push({
      id: `${nombreArchivo}#${fichas.length + 1}`,
      tipo,
      fuente,
      categoria,
      titulo: actual.titulo,
      contenido,
      tokensAprox: aproximarTokens(contenido),
    });
    actual = null;
  };

  // Recorre el archivo línea por línea (`\r?\n` cubre los saltos de línea de Windows y de Linux).
  for (const linea of texto.split(/\r?\n/)) {
    if (linea.startsWith("### ")) {
      cerrar();
      actual = { titulo: linea.slice(4).trim(), lineas: [] };
    } else if (linea.startsWith("## ")) {
      cerrar();
      categoria = linea.slice(3).trim();
    } else if (actual) {
      actual.lineas.push(linea);
    }
  }
  cerrar(); // La última ficha del archivo no tiene un "###" después que la cierre.
  return fichas;
}
