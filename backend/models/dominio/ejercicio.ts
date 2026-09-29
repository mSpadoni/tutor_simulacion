import { z } from "zod";

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

/** Un dato aleatorio del enunciado: su sigla y su f.d.p. como la escribe el enunciado. */
export type DatoAleatorio = { sigla: string; fdp: string };

/** Lo que se revisa de un ejercicio nuevo antes de guardarlo y mostrarlo. */
export type EjercicioARevisar = { enunciado: string; datosAleatorios: DatoAleatorio[] };

/** Lo que nunca va en un enunciado: la metodología o el vocabulario de la resolución (lo descubre el alumno). */
const REVELA_LA_RESOLUCION =
  /evento a evento|\bEaE\b|intervalos? constantes?|Δt|\bTPLL\b|\bTPS\b|\bNS\b|\bTEF\b|\bTEI\b/i;

/** Para comparar textos sin que importen los espacios ni las mayúsculas. */
const normalizado = (texto: string) => texto.replace(/\s+/g, " ").trim().toLowerCase();

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
  for (const { sigla, fdp } of datosAleatorios) {
    if (!enunciado.includes(`(${sigla})`)) {
      problemas.push(`El dato ${sigla} no aparece en el enunciado con su sigla entre paréntesis, ej: "(${sigla})".`);
    }
    // Lo que se revisa es lo que lee el alumno: la f.d.p. tiene que estar tal cual en el enunciado.
    if (!normalizado(enunciado).includes(normalizado(fdp))) {
      problemas.push(`La f.d.p. de ${sigla} («${fdp}») no aparece tal cual en el enunciado.`);
    }
    if (/lineal/i.test(fdp) && !/f\s*\(/i.test(fdp)) {
      problemas.push(
        `La f.d.p. de ${sigla} es lineal pero no dice qué recta es: agregá la relación, ej. "donde f(30) = 2·f(10)", ` +
          "o la f(x) explícita. Sin eso no se puede resolver."
      );
    }
    if (/exponencial/i.test(fdp) && !/media|promedio|λ|lambda|tasa/i.test(fdp)) {
      problemas.push(
        `La f.d.p. de ${sigla} es exponencial pero no dice su media (o su λ): sin eso no se puede resolver.`
      );
    }
  }
  if (!/determinar|decidir|conviene|conveniente/i.test(enunciado)) {
    problemas.push(
      "El enunciado no dice qué se busca decidir (la variable de control, sin llamarla así), ej: " +
        '"Se desea determinar la cantidad N de puestos…".'
    );
  }
  return problemas;
}
