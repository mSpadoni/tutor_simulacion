import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { BuscadorBM25, soloLetras } from "@/backend/models/dominio/buscadorBM25";
import { leerFichas, type Ficha, type TipoDeFicha } from "@/backend/models/dominio/ficha";

const DIRECTORIO_CONOCIMIENTO = path.join(process.cwd(), "backend", "knowledge");
/** La base de conocimiento va siempre entera en el system prompt: no se busca en ella. */
const ARCHIVO_BASE = "base-conocimiento-simulacion.md";

/** Opciones de buscar(). El `?` las hace opcionales: si no se pasan, se usan los valores por defecto. */
type OpcionesBusqueda = { limite?: number; presupuestoTokens?: number; tipo?: TipoDeFicha };

/**
 * El material de la cátedra (ejercicios resueltos, guía de TP, parciales), leído de backend/knowledge.
 * Todo junto son ~60.000 tokens: no entra en cada consulta, así que se mandan solo las fichas más parecidas.
 * Cómo se lee cada archivo está en dominio/ficha.ts; cómo se puntúa cada ficha, en dominio/buscadorBM25.ts.
 */
export class MaterialCatedra {
  private readonly buscador: BuscadorBM25;

  constructor(readonly fichas: readonly Ficha[]) {
    this.buscador = new BuscadorBM25(fichas);
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

    const resultados = this.buscador.buscar(consulta, esDelTipo);
    const mejor = resultados[0]?.puntaje ?? 0;
    // Solo las que se parecen de verdad: al menos el 40% del puntaje de la mejor.
    for (const { ficha, puntaje } of resultados) {
      if (puntaje < mejor * 0.4) break;
      if (!candidatas.includes(ficha)) candidatas.push(ficha);
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
