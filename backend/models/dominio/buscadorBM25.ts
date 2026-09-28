import type { Ficha } from "./ficha";

// El buscador del material: BM25, la fórmula clásica de los buscadores. Lógica pura: recibe las fichas ya leídas.

// Palabras que no ayudan a distinguir una ficha de otra.
// Un Set es una colección sin repetidos que responde muy rápido "¿está esta palabra?" con .has(palabra).
// El texto largo se parte por espacios (.split(" ")) para armar la lista de palabras.
const PALABRAS_VACIAS = new Set(
  (
    "a al algo ante antes como con contra cual cuando de del desde donde dos el ella en entre era es esa ese eso esta este esto " +
    "estos fue ha hay hasta la las le les lo los mas me mi mis muy no nos o otra otro para pero por que quien se sea segun ser si " +
    "sin sobre su sus tambien te tiene tu un una uno unos y ya yo vos sos podes quiero dame dar tengo hola gracias favor " +
    "ejercicio ejercicios cada cual cuales dado dada dados dadas responde conocida conocido f.d.p fdp"
  ).split(" ")
);

/**
 * Convierte un texto en la lista de palabras "útiles" para comparar, todas en el mismo formato.
 * Ej: "¿Cómo armo las Colas?" → ["armo", "cola"].
 */
export function normalizar(texto: string): string[] {
  return (
    texto
      .toLowerCase()
      // normalize("NFD") separa las tildes de las letras ("ó" → "o" + tilde) y el replace siguiente borra las tildes.
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      // Corta en todo lo que no sea letra o número (espacios, signos de puntuación...).
      .split(/[^a-z0-9ñ]+/)
      // Descarta palabras de 1 letra y las "vacías"; después pasa cada una a su raíz.
      .filter((palabra) => palabra.length >= 2 && !PALABRAS_VACIAS.has(palabra))
      .map(raiz)
  );
}

/** Raíz muy simple para que "colas" y "cola", o "pedidos" y "pedido", cuenten igual. */
function raiz(palabra: string): string {
  // slice(0, -2) = el texto sin los 2 últimos caracteres.
  if (palabra.length > 5 && palabra.endsWith("es")) return palabra.slice(0, -2);
  if (palabra.length > 3 && palabra.endsWith("s")) return palabra.slice(0, -1);
  return palabra;
}

/** Texto en minúsculas, sin tildes ni signos, con un espacio entre palabras. Para comparar títulos. */
export function soloLetras(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

/**
 * Una ficha preparada para buscar rápido: cuántas veces aparece cada palabra (`Map` palabra → cantidad)
 * y cuántas palabras tiene en total.
 */
type FichaIndexada = { ficha: Ficha; frecuencias: Map<string, number>; largo: number };

/** Una ficha con su puntaje para una consulta. */
export type Resultado = { ficha: Ficha; puntaje: number };

/**
 * Índice BM25 sobre las fichas: una ficha puntúa más si repite las palabras de la consulta, sobre todo las
 * palabras raras (que aparecen en pocas fichas). Se arma una sola vez, al crear el objeto.
 */
export class BuscadorBM25 {
  private readonly indice: FichaIndexada[];
  private readonly idf = new Map<string, number>();
  private readonly largoPromedio: number;

  constructor(fichas: readonly Ficha[]) {
    this.indice = fichas.map((ficha) => {
      // El título y la categoría pesan más que el cuerpo: repetirlos es la forma simple de darles peso en BM25.
      // `...lista` (spread) "desparrama" los elementos de cada lista dentro de una lista nueva.
      const palabras = [
        ...normalizar(`${ficha.titulo} `.repeat(3)),
        ...normalizar(`${ficha.categoria} `.repeat(2)),
        ...normalizar(ficha.contenido),
      ];
      // Cuenta cuántas veces aparece cada palabra. `?? 0`: si todavía no estaba en el Map, arranca en 0.
      const frecuencias = new Map<string, number>();
      for (const palabra of palabras) frecuencias.set(palabra, (frecuencias.get(palabra) ?? 0) + 1);
      return { ficha, frecuencias, largo: palabras.length };
    });

    // IDF ("rareza" de cada palabra): primero se cuenta en cuántas fichas aparece cada una...
    const documentosConPalabra = new Map<string, number>();
    for (const { frecuencias } of this.indice) {
      for (const palabra of frecuencias.keys()) {
        documentosConPalabra.set(palabra, (documentosConPalabra.get(palabra) ?? 0) + 1);
      }
    }
    // ...y después se calcula: cuantas menos fichas la tienen, más alto el valor (más distingue).
    const total = this.indice.length;
    for (const [palabra, cantidad] of documentosConPalabra) {
      this.idf.set(palabra, Math.log(1 + (total - cantidad + 0.5) / (cantidad + 0.5)));
    }
    // reduce recorre la lista acumulando un valor (acá, la suma de largos). Math.max(total, 1) evita dividir por 0.
    this.largoPromedio = this.indice.reduce((suma, doc) => suma + doc.largo, 0) / Math.max(total, 1);
  }

  /**
   * Las fichas que tienen algo que ver con la consulta (puntaje > 0), de la más parecida a la menos.
   * `filtro` deja afuera las que no interesan (ej. solo las de tipo "ejercicio").
   */
  buscar(consulta: string, filtro: (ficha: Ficha) => boolean = () => true): Resultado[] {
    // `[...new Set(lista)]`: truco para sacar repetidos (Set no admite duplicados y el spread lo vuelve lista).
    const palabras = [...new Set(normalizar(consulta))];
    if (palabras.length === 0) return [];
    // Puntúa todas las fichas, descarta las de puntaje 0 y ordena de mayor a menor (b - a = descendente).
    return this.indice
      .filter((doc) => filtro(doc.ficha))
      .map((doc) => ({ ficha: doc.ficha, puntaje: this.puntuar(doc, palabras) }))
      .filter(({ puntaje }) => puntaje > 0)
      .sort((a, b) => b.puntaje - a.puntaje);
  }

  /**
   * Puntaje BM25 de una ficha para las palabras de la consulta.
   * k1 limita cuánto suma repetir una palabra muchas veces; b compensa que las fichas largas tienen más palabras.
   */
  private puntuar(doc: FichaIndexada, palabras: string[]): number {
    const k1 = 1.2;
    const b = 0.75;
    let puntaje = 0;
    for (const palabra of palabras) {
      const frecuencia = doc.frecuencias.get(palabra);
      if (!frecuencia) continue;
      const idf = this.idf.get(palabra) ?? 0;
      puntaje += (idf * frecuencia * (k1 + 1)) / (frecuencia + k1 * (1 - b + (b * doc.largo) / this.largoPromedio));
    }
    return puntaje;
  }
}
