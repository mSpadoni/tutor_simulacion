import { z } from "zod";
import { problemasDelAnalisis, type Analisis } from "./analisis";

// Qué es un ejercicio generado para el alumno. Lo usan la tool generar_ejercicio (lo que arma el LLM tiene que
// cumplirlo) y el repositorio de ejercicios (lo valida al guardarlo y al leerlo de la base).

/**
 * Un ejercicio: tema, dificultad y `payload`, el ejercicio completo (título, enunciado y consignas del "Se pide:").
 * Los límites coinciden con los de la tabla `ejercicios` de la base.
 */
export const EjercicioSchema = z.object({
  tema: z.string().trim().min(1).max(80),
  dificultad: z.enum(["facil", "media", "dificil"]),
  payload: z.object({
    titulo: z.string().trim().min(1).max(120),
    enunciado: z.string().trim().min(50),
    sePide: z.array(z.string().trim().min(1)).min(1),
  }),
});

export type NuevoEjercicio = z.infer<typeof EjercicioSchema>;

/**
 * Cómo aparece un dato en el enunciado, como en la cátedra: responde a una f.d.p. (explícita), a una f.d.p.
 * conocida, sale de otro dato ("el doble de…") o toma distintos valores según probabilidades ("el 60% tarda 40…").
 */
export const FORMAS_DE_DATO = ["fdp", "fdp_conocida", "derivado", "probabilidades"] as const;

/** Un dato aleatorio: su sigla (solo para el análisis: el enunciado no la dice) y cómo aparece en el enunciado. */
export type DatoAleatorio = { sigla: string; forma: (typeof FORMAS_DE_DATO)[number] };

/** Lo que tiene que decir el enunciado para cada forma de dato. */
const SE_RECONOCE: Record<DatoAleatorio["forma"], { patron: RegExp; ejemplo: string }> = {
  fdp: {
    patron: /f\.?\s?d\.?\s?p|funci[oó]n de densidad/i,
    ejemplo: "«responde a una f.d.p. uniforme entre 5 y 15 minutos»",
  },
  fdp_conocida: { patron: /f\.?\s?d\.?\s?p\.?\s+conocida/i, ejemplo: "«responde a una f.d.p. conocida»" },
  derivado: {
    patron: /\b(doble|triple|cu[aá]druple|mitad|tercio|veces)\b/i,
    ejemplo: "«el tiempo de los camiones grandes es el doble que el de los chicos»",
  },
  probabilidades: {
    patron: /\d+\s*%|probabilidad/i,
    ejemplo: "«el 60% de los clientes tarda 40 minutos y el resto 20»",
  },
};

/** Lo que se revisa de un ejercicio nuevo antes de guardarlo y mostrarlo. */
export type EjercicioARevisar = { enunciado: string; datosAleatorios: DatoAleatorio[] };

/**
 * Largo mínimo de un enunciado de parcial: los de la Guía Anexa tienen una mediana de ~1100 caracteres y los más
 * cortos rondan los 800; los ejemplos de clase, ~500. Menos que esto es un ejercicio de clase.
 */
export const LARGO_MINIMO_DE_PARCIAL = 800;

/** Lo que nunca va en un enunciado: la metodología o el vocabulario de la resolución (lo descubre el alumno). */
const REVELA_LA_RESOLUCION =
  /evento a evento|\bEaE\b|intervalos? constantes?|Δt|\bTPLL\b|\bTPS\b|\bNS\b|\bTEF\b|\bTEI\b/i;

/**
 * Las reglas de la cátedra para un ejercicio nuevo (sección 8 de la base) que el enunciado no cumple, explicadas
 * para que el modelo lo corrija. Vacío si cumple todas. Solo se revisa lo que se puede comprobar sin interpretar el
 * sistema: que sea coherente lo decide el modelo razonando.
 */
export function problemasDelEjercicio({ enunciado, datosAleatorios }: EjercicioARevisar): string[] {
  const problemas: string[] = [];
  const revela = enunciado.match(REVELA_LA_RESOLUCION);
  if (revela) {
    problemas.push(
      `El enunciado dice «${revela[0]}»: no puede nombrar la metodología ni variables o tablas de la resolución.`
    );
  }
  if (datosAleatorios.length === 0) {
    problemas.push("El ejercicio no tiene datos aleatorios: cada dato del sistema responde a una f.d.p.");
  }
  for (const { sigla, forma } of datosAleatorios) {
    // El nombre de la variable lo deduce el alumno: el enunciado cuenta el dato, no lo nombra.
    if (new RegExp(`\\b${sigla.replace(/[^\w]/g, "")}\\b`).test(enunciado)) {
      problemas.push(
        `El enunciado nombra la variable ${sigla}: contá el dato sin su sigla, así el alumno deduce qué variable es.`
      );
    }
    const { patron, ejemplo } = SE_RECONOCE[forma];
    if (!patron.test(enunciado)) {
      problemas.push(`El dato ${sigla} tiene que aparecer en el enunciado como en la cátedra, ej: ${ejemplo}.`);
    }
  }
  if (enunciado.length < LARGO_MINIMO_DE_PARCIAL) {
    problemas.push(
      `El enunciado tiene ${enunciado.length} caracteres: los de la Guía Anexa rondan los 1100 (los más cortos, ` +
        `${LARGO_MINIMO_DE_PARCIAL}). Es un ejercicio de clase, no de parcial: combiná más complicaciones y datos.`
    );
  }
  if (!/determinar|decidir|conviene|conveniente/i.test(enunciado)) {
    problemas.push(
      "El enunciado no dice qué se busca decidir (la variable de control, sin llamarla así), ej: " +
        '"Se desea determinar la cantidad N de puestos…".'
    );
  }
  return problemas;
}

/**
 * Lo que el análisis que armó el modelo de su propio ejercicio dice sobre el enunciado. Si el ejercicio no se puede
 * analizar con la metodología (su T.E.I. no cumple las reglas, sus datos no son los del enunciado, no hay nada que
 * decidir), está mal planteado: el modelo lo tiene que rehacer antes de dárselo al alumno.
 */
export function problemasDelAnalisisDelEjercicio({
  datosAleatorios,
  seDecide,
  analisis,
}: {
  datosAleatorios: DatoAleatorio[];
  seDecide: string;
  analisis: Analisis;
}): string[] {
  const problemas = problemasDelAnalisis(analisis).map((problema) => `En el análisis de tu ejercicio: ${problema}`);
  const datosDelAnalisis = new Set(analisis.variables.datos.map((dato) => dato.nombre.trim().toUpperCase()));
  for (const { sigla } of datosAleatorios) {
    if (!datosDelAnalisis.has(sigla.trim().toUpperCase())) {
      problemas.push(`El dato ${sigla} del enunciado no está entre los datos del análisis de tu ejercicio.`);
    }
  }
  if (analisis.variables.control.length === 0) {
    problemas.push(
      `El enunciado busca decidir «${seDecide}», pero el análisis de tu ejercicio no tiene variable de control: ` +
        "lo que se decide es una variable de control (y queda fija durante la corrida)."
    );
  }
  return problemas;
}
