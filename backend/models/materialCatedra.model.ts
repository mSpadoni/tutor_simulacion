import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DIRECTORIO_CONOCIMIENTO = path.join(process.cwd(), "backend", "knowledge");
/** La base de conocimiento va siempre entera en el system prompt: no se busca en ella. */
const ARCHIVO_BASE = "base-conocimiento-simulacion.md";

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

/** Opciones de buscar(). El `?` las hace opcionales: si no se pasan, se usan los valores por defecto. */
type OpcionesBusqueda = { limite?: number; presupuestoTokens?: number; tipo?: TipoDeFicha };

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
function normalizar(texto: string): string[] {
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
function soloLetras(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

/**
 * El enunciado de una ficha, sin la resolución de la cátedra (que puede tener errores: el tutor resuelve y
 * corrige con la teoría). En las fichas resueltas, la resolución empieza en "Metodología:" o "- **Datos:**".
 */
export function enunciadoDe(ficha: Ficha): string {
  const inicioResolucion = ficha.contenido.search(/^(Metodolog[ií]a:|- \*\*Datos:\*\*)/m);
  return (inicioResolucion === -1 ? ficha.contenido : ficha.contenido.slice(0, inicioResolucion)).trim();
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

/**
 * Una ficha preparada para buscar rápido: cuántas veces aparece cada palabra (`Map` palabra → cantidad)
 * y cuántas palabras tiene en total.
 */
type FichaIndexada = { ficha: Ficha; frecuencias: Map<string, number>; largo: number };

/**
 * El material de la cátedra (ejercicios resueltos, guía de TP, parciales) y un buscador BM25 sobre él.
 * Todo junto son ~60.000 tokens: no entra en cada consulta, así que se mandan solo las fichas más parecidas.
 */
export class MaterialCatedra {
  private readonly indice: FichaIndexada[];
  private readonly idf = new Map<string, number>();
  private readonly largoPromedio: number;

  /**
   * Arma el índice de búsqueda una sola vez, al crear el objeto.
   * BM25 es la fórmula clásica de los buscadores: una ficha puntúa más si repite las palabras de la consulta,
   * sobre todo las palabras raras (que aparecen en pocas fichas).
   */
  constructor(readonly fichas: readonly Ficha[]) {
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
   * Lee todos los .md de backend/knowledge (menos la base de conocimiento) y arma el MaterialCatedra.
   * `static`: se llama sobre la clase: `MaterialCatedra.cargar()`.
   */
  static cargar(directorio = DIRECTORIO_CONOCIMIENTO): MaterialCatedra {
    // flatMap: cada archivo da una lista de fichas; flatMap las junta en una sola lista (en vez de una lista de listas).
    const fichas = readdirSync(directorio)
      .filter((archivo) => archivo.endsWith(".md") && archivo !== ARCHIVO_BASE)
      .sort()
      .flatMap((archivo) => leerFichas(archivo, readFileSync(path.join(directorio, archivo), "utf8")))
      // Lo pendiente (Δt, guía oficial 13 en adelante) todavía no se usa.
      .filter((ficha) => ficha.tipo !== "pendiente");
    return new MaterialCatedra(fichas);
  }

  /**
   * Un ejercicio que el alumno nombra ("Clínica", "el 10 de la guía") o describe ("clínica con dos consultorios").
   * Primero busca por número de la guía o por título; si no encuentra, por parecido entre los ejercicios.
   * Devuelve hasta 2 candidatos: el modelo decide si alguno es el que menciona el alumno.
   */
  buscarPorNombre(nombreODescripcion: string): Ficha[] {
    const buscado = soloLetras(nombreODescripcion);
    if (!buscado) return [];

    const deLaGuia = this.ejercicioDeLaGuiaNombrado(nombreODescripcion);
    if (deLaGuia) return [deLaGuia];

    // Por título: igual al buscado, o contenido en él ("resolveme Clínica de la anexa" contiene "clinica").
    const porTitulo = this.fichas.filter((ficha) => {
      const titulo = soloLetras(ficha.titulo);
      return titulo.length >= 4 && (titulo === buscado || buscado.includes(titulo) || titulo.includes(buscado));
    });
    if (porTitulo.length > 0) return porTitulo.slice(0, 2);

    return this.buscar(nombreODescripcion, { tipo: "ejercicio", limite: 2 });
  }

  /**
   * Las fichas más relacionadas con la consulta, sin pasarse del presupuesto de tokens.
   * Si el alumno nombra "el ejercicio N de la guía", ese enunciado va primero.
   * Con `tipo`, solo se buscan fichas de ese tipo (modelo o ejercicio); sin `tipo`, entre todas.
   * `{ limite = 3, presupuestoTokens = 6000 }: OpcionesBusqueda = {}`: el segundo parámetro es un objeto opcional
   * que se desestructura en el momento, con valores por defecto para cada propiedad. Ej: buscar("colas", { limite: 5 }).
   */
  buscar(consulta: string, { limite = 3, presupuestoTokens = 6000, tipo }: OpcionesBusqueda = {}): Ficha[] {
    const candidatas: Ficha[] = [];
    const esDelTipo = (ficha: Ficha) => tipo === undefined || ficha.tipo === tipo;

    const deLaGuia = this.ejercicioDeLaGuiaNombrado(consulta);
    if (deLaGuia && esDelTipo(deLaGuia)) candidatas.push(deLaGuia);

    // `[...new Set(lista)]`: truco para sacar repetidos (Set no admite duplicados y el spread lo vuelve lista).
    const palabras = [...new Set(normalizar(consulta))];
    if (palabras.length > 0) {
      // Puntúa todas las fichas, descarta las de puntaje 0 y ordena de mayor a menor (b - a = descendente).
      const puntajes = this.indice
        .filter((doc) => esDelTipo(doc.ficha))
        .map((doc) => ({ ficha: doc.ficha, puntaje: this.puntuar(doc, palabras) }))
        .filter(({ puntaje }) => puntaje > 0)
        .sort((a, b) => b.puntaje - a.puntaje);
      const mejor = puntajes[0]?.puntaje ?? 0;
      // Solo las que se parecen de verdad: al menos el 40% del puntaje de la mejor.
      for (const { ficha, puntaje } of puntajes) {
        if (puntaje < mejor * 0.4) break;
        if (!candidatas.includes(ficha)) candidatas.push(ficha);
      }
    }

    // Se queda con las primeras candidatas hasta llenar el límite, salteando las que no entran en el presupuesto de tokens.
    // `break` corta el for; `continue` saltea solo esta vuelta y sigue con la próxima ficha.
    const elegidas: Ficha[] = [];
    let tokens = 0;
    for (const ficha of candidatas) {
      if (elegidas.length >= limite) break;
      if (tokens + ficha.tokensAprox > presupuestoTokens) continue;
      elegidas.push(ficha);
      tokens += ficha.tokensAprox;
    }
    return elegidas;
  }

  /** Si el texto nombra "el ejercicio N de la guía" (o del TP), esa ficha; si no, undefined. */
  private ejercicioDeLaGuiaNombrado(texto: string): Ficha | undefined {
    // Detecta "ejercicio 5", "ejercicio nro 5", "ejercicio n° 5"... El número queda en numero[1].
    const numero = texto.match(/ejercicio\s*(?:n(?:ro|°|º|\.)?\s*)?(\d{1,2})\b/i);
    if (!numero || !/gu[ií]a|tp|trabajo/i.test(texto)) return undefined;
    return this.fichas.find(
      (ficha) =>
        ficha.fuente.includes("Trabajos Prácticos") && ficha.titulo.startsWith(`Ejercicio ${Number(numero[1])} `)
    );
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

let materialEnCache: MaterialCatedra | null = null;

/**
 * Devuelve el material ya cargado. La primera vez lee los archivos; las siguientes reusa el mismo objeto.
 * `??=` asigna solo si la variable todavía es null.
 */
export function obtenerMaterialCatedra(): MaterialCatedra {
  materialEnCache ??= MaterialCatedra.cargar();
  return materialEnCache;
}
