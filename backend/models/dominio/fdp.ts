import { all, create, type EvalFunction } from "mathjs";

// Verificación numérica de una función de densidad de probabilidad (f.d.p.): lo que el modelo resuelve con álgebra
// (k, F(x), la inversa, el M del rechazo) se controla con cuentas numéricas, que no se equivocan.

// mathjs restringido: compila fórmulas, pero quien escribe la fórmula (el modelo) no puede importar ni crear
// funciones, ni evaluar texto arbitrario. Se guarda `compile` antes de bloquear el resto.
const math = create(all);
const compilar = math.compile;
math.import(
  Object.fromEntries(
    ["import", "createUnit", "evaluate", "parse", "simplify", "derivative", "resolve", "reviver"].map((nombre) => [
      nombre,
      () => {
        throw new Error(`La función ${nombre} no está permitida.`);
      },
    ])
  ),
  { override: true }
);

/** Lo que se le pasa para verificar (lo que resolvió el modelo). */
export type DatosFdp = {
  /** f(x) como fórmula en x, ej: "(x - 1)/18", "k*x^2", "x < 210 ? x/400 - 19/40 : -x/400 + 23/40". */
  fx: string;
  /** Desde dónde vale f(x). */
  a: number;
  /** Hasta dónde vale f(x). `Infinity` para "x ≥ a". */
  b: number;
  /** El valor de la constante k, si f(x) la usa. */
  k?: number;
  /** La fórmula de la inversa, x en función de R, ej: "6*sqrt(R) + 1". */
  inversa?: string;
  /** El M que calculó el modelo para el método del rechazo. */
  M?: number;
};

export type PruebaInversa = { R: number; x: number | null; F: number | null; ok: boolean };

export type ResultadoFdp =
  | {
      ok: true;
      /** true si el área da 1 y f ≥ 0 en todo el intervalo. */
      valida: boolean;
      area: number;
      minimo: number;
      /** El máximo de f en el intervalo: el M del método del rechazo. */
      maximo: { M: number; x: number };
      /** Si f(x) usa k (multiplicando a toda la función): la k que hace que el área dé 1. */
      kQueLaHaceValida?: number;
      /** F(x) en algunos puntos del intervalo, para comparar con la F que calculó el modelo. */
      F: { x: number; F: number }[];
      inversa?: { correcta: boolean; pruebas: PruebaInversa[] };
      /** Si el modelo pasó un M, si coincide con el máximo. */
      MCoincide?: boolean;
      /** Resumen en palabras para el modelo. */
      conclusiones: string[];
    }
  | { ok: false; error: string };

const redondear = (valor: number, decimales = 4) => Math.round(valor * 10 ** decimales) / 10 ** decimales;
const PUNTOS = 20_001; // Puntos de la grilla donde se evalúa f.
const TOLERANCIA_AREA = 1e-3;
const T_MAXIMO = 1 - 1e-6; // Con b = Infinity, x = a + t/(1−t) para t en [0, T_MAXIMO].

/**
 * f evaluada sobre una grilla fina y su integral acumulada (regla del trapecio): con esta tabla salen el área,
 * F(x) y los cuartiles sin volver a evaluar f.
 * La grilla es pareja en una variable t ∈ [0, 1]: x = a + t·(b − a), o con b = Infinity x = a + s/(1−s) (s = t·T_MAXIMO),
 * que cubre [a, ∞). Se integra en t (f(x)·dx/dt): con intervalos infinitos, integrar en x sobre puntos cada vez más
 * separados sobreestima el área de las colas largas (ej. 100/x²).
 */
type Tabla = { xs: Float64Array; ys: Float64Array; acumulada: Float64Array };

const DT = 1 / (PUNTOS - 1);

/** Integral en t, por trapecio, de valores ya multiplicados por dx/dt. */
function acumular(valores: Float64Array): Float64Array {
  const acumulada = new Float64Array(PUNTOS);
  for (let i = 1; i < PUNTOS; i++) acumulada[i] = acumulada[i - 1] + ((valores[i] + valores[i - 1]) / 2) * DT;
  return acumulada;
}

function armarTabla(f: (x: number) => number, a: number, b: number): Tabla {
  const xs = new Float64Array(PUNTOS);
  const ys = new Float64Array(PUNTOS);
  const dxdt = new Float64Array(PUNTOS);
  const integrando = new Float64Array(PUNTOS);
  for (let i = 0; i < PUNTOS; i++) {
    const t = i * DT;
    if (b === Infinity) {
      const s = t * T_MAXIMO;
      xs[i] = a + s / (1 - s);
      dxdt[i] = T_MAXIMO / (1 - s) ** 2;
    } else {
      xs[i] = a + t * (b - a);
      dxdt[i] = b - a;
    }
    ys[i] = f(xs[i]);
    integrando[i] = ys[i] * dxdt[i];
  }
  return { xs, ys, acumulada: acumular(integrando) };
}

/** Primer índice i con xs[i] ≥ x (búsqueda binaria). */
function indiceDe(xs: Float64Array, x: number): number {
  let bajo = 0;
  let alto = xs.length - 1;
  while (bajo < alto) {
    const medio = (bajo + alto) >> 1;
    if (xs[medio] < x) bajo = medio + 1;
    else alto = medio;
  }
  return bajo;
}

/** F(x) interpolando la integral acumulada. */
function Fen(tabla: Tabla, x: number): number {
  const { xs, acumulada } = tabla;
  if (x <= xs[0]) return 0;
  if (x >= xs[xs.length - 1]) return acumulada[acumulada.length - 1];
  const i = indiceDe(xs, x);
  const proporcion = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
  return acumulada[i - 1] + proporcion * (acumulada[i] - acumulada[i - 1]);
}

/** El x donde F(x) = p, interpolando la integral acumulada. */
function cuantil(tabla: Tabla, p: number): number {
  const { xs, acumulada } = tabla;
  const i = Math.max(1, indiceDe(acumulada, p));
  const tramo = acumulada[i] - acumulada[i - 1];
  const proporcion = tramo > 0 ? (p - acumulada[i - 1]) / tramo : 0;
  return xs[i - 1] + proporcion * (xs[i] - xs[i - 1]);
}

/** Verifica la f.d.p. que resolvió el modelo: área, signo, k, M, F(x) y la inversa. */
export function verificarFdp(datos: DatosFdp): ResultadoFdp {
  const { a, b } = datos;
  if (!Number.isFinite(a) || !(b > a)) return { ok: false, error: "El intervalo tiene que cumplir a < b." };

  let expresion: EvalFunction;
  try {
    expresion = compilar(datos.fx);
  } catch (error) {
    return { ok: false, error: `No pude interpretar f(x) = ${datos.fx}: ${(error as Error).message}` };
  }
  const f = (x: number, k = datos.k ?? 1): number => {
    const valor = Number(expresion.evaluate({ x, k }));
    if (!Number.isFinite(valor)) throw new Error(`f(${redondear(x)}) no da un número.`);
    return valor;
  };

  try {
    const conclusiones: string[] = [];
    const tabla = armarTabla((x) => f(x), a, b);
    const area = tabla.acumulada[PUNTOS - 1];

    // k: si f la usa y la multiplica entera (f con k=2 es el doble que con k=1), se calcula la que da área 1.
    let kQueLaHaceValida: number | undefined;
    if (/\bk\b/.test(datos.fx)) {
      const conK1 = armarTabla((x) => f(x, 1), a, b).acumulada[PUNTOS - 1];
      const muestra = b === Infinity ? a + 1 : (a + b) / 2;
      if (conK1 > 0 && Math.abs(f(muestra, 2) - 2 * f(muestra, 1)) < 1e-9) {
        kQueLaHaceValida = redondear(1 / conK1, 6);
      }
    }

    let minimo = Infinity;
    let iMaximo = 0;
    for (let i = 0; i < PUNTOS; i++) {
      if (tabla.ys[i] < minimo) minimo = tabla.ys[i];
      if (tabla.ys[i] > tabla.ys[iMaximo]) iMaximo = i;
    }
    const areaUno = Math.abs(area - 1) < TOLERANCIA_AREA;
    const noNegativa = minimo >= -1e-9;
    const valida = areaUno && noNegativa;

    conclusiones.push(
      areaUno ? `El área da 1 (${redondear(area)}): está libre de incógnitas.` : `El área da ${redondear(area)}, no 1.`
    );
    if (!noNegativa) conclusiones.push(`f(x) toma valores negativos (mínimo ${redondear(minimo)}): no es una f.d.p.`);
    if (!areaUno && kQueLaHaceValida !== undefined) {
      conclusiones.push(`Para que el área dé 1, k tiene que valer ${kQueLaHaceValida}.`);
    }

    // F(x) en los cuartiles, para comparar con la F que calculó el modelo.
    const F = valida
      ? [0.25, 0.5, 0.75].map((p) => {
          const x = cuantil(tabla, p);
          return { x: redondear(x), F: redondear(Fen(tabla, x)) };
        })
      : [];

    // La inversa: para varios R, x = G(R) tiene que cumplir F(x) = R.
    let inversa: { correcta: boolean; pruebas: PruebaInversa[] } | undefined;
    if (datos.inversa !== undefined) {
      let G: EvalFunction;
      try {
        G = compilar(datos.inversa);
      } catch (error) {
        return { ok: false, error: `No pude interpretar la inversa x = ${datos.inversa}: ${(error as Error).message}` };
      }
      const pruebas = [0.1, 0.3, 0.5, 0.7, 0.9].map((R): PruebaInversa => {
        const x = Number(G.evaluate({ R, k: datos.k ?? 1 }));
        if (!Number.isFinite(x) || x < a - 1e-9 || x > b + 1e-9) {
          return { R, x: Number.isFinite(x) ? redondear(x) : null, F: null, ok: false };
        }
        const Fx = Fen(tabla, x);
        return { R, x: redondear(x), F: redondear(Fx), ok: Math.abs(Fx - R) < 0.005 };
      });
      inversa = { correcta: valida && pruebas.every((prueba) => prueba.ok), pruebas };
      const primeraMal = pruebas.find((prueba) => !prueba.ok);
      conclusiones.push(
        inversa.correcta
          ? "La inversa es correcta: para cada R probado, F(x) vuelve a dar R."
          : !valida
            ? "La inversa no se puede verificar porque f(x) no es una f.d.p. válida."
            : primeraMal!.F === null
              ? `La inversa está mal: con R = ${primeraMal!.R} da x = ${primeraMal!.x ?? "un valor inválido"}, fuera del intervalo.`
              : `La inversa está mal: con R = ${primeraMal!.R} da x = ${primeraMal!.x}, pero F(${primeraMal!.x}) = ${primeraMal!.F}.`
      );
    }

    // El M del rechazo, si el modelo lo pasó.
    const M = tabla.ys[iMaximo];
    let MCoincide: boolean | undefined;
    if (datos.M !== undefined) {
      MCoincide = Math.abs(datos.M - M) <= Math.max(1e-3, 0.01 * M);
      conclusiones.push(
        MCoincide
          ? `M = ${datos.M} es correcto (el máximo de f es ${redondear(M)}).`
          : `M está mal: el máximo de f en el intervalo es ${redondear(M)} (en x = ${redondear(tabla.xs[iMaximo])}), no ${datos.M}.`
      );
    }

    return {
      ok: true,
      valida,
      area: redondear(area),
      minimo: redondear(minimo),
      maximo: { M: redondear(M), x: redondear(tabla.xs[iMaximo]) },
      ...(kQueLaHaceValida !== undefined && { kQueLaHaceValida }),
      F,
      ...(inversa && { inversa }),
      ...(MCoincide !== undefined && { MCoincide }),
      conclusiones,
    };
  } catch (error) {
    return { ok: false, error: `No pude verificar la f.d.p.: ${(error as Error).message}` };
  }
}
