import "server-only";
import { tool } from "ai";
import { AnalisisSchema, problemasDelAnalisis, type Analisis } from "@/backend/models/dominio/analisis";

// verificar_analisis: el modelo arma el análisis previo razonando sobre el enunciado y, antes de mostrarlo, lo
// verifica contra las reglas de la cátedra (como verificar_fdp con las f.d.p.). Si pasa, la vista lo muestra como
// tablas armadas desde estos datos validados; si no, el modelo recibe qué regla rompió para corregirlo.

/** Lo que devuelve la tool: el análisis y las reglas que no cumple (vacío = cumple todas). */
export type AnalisisVerificado = { ok: boolean; problemas: string[]; analisis: Analisis };

/** Verifica el análisis contra las reglas de la cátedra. */
export function verificarAnalisis(analisis: Analisis): AnalisisVerificado {
  const problemas = problemasDelAnalisis(analisis);
  return { ok: problemas.length === 0, problemas, analisis };
}

/** Lo que lee el modelo del resultado: si pasó, que no repita las tablas; si no, qué corregir. */
export function resumenDelAnalisis(resultado: AnalisisVerificado): string {
  if (resultado.ok) {
    return (
      "El análisis cumple las reglas de la cátedra y ya se le muestra al alumno como tablas (metodología, variables, " +
      "T.E.I. y T.E.F.). No las repitas en texto: comentá lo importante en dos o tres líneas."
    );
  }
  return (
    "El análisis no cumple estas reglas de la cátedra (el alumno todavía no lo ve):\n" +
    resultado.problemas.map((problema) => `- ${problema}`).join("\n") +
    "\nCorregilo y volvé a llamar a verificar_analisis."
  );
}

/** La tool para `streamText`. */
export function crearToolsAnalisis() {
  return {
    verificar_analisis: tool({
      description:
        "Verifica el análisis previo de un ejercicio (metodología, variables, eventos, T.E.I. y T.E.F.) contra las " +
        "reglas de la cátedra y, si las cumple, se lo muestra al alumno como tablas. Usala SIEMPRE al resolver, antes " +
        "de mostrar el análisis: si devuelve problemas, corregilo y volvé a llamarla.",
      inputSchema: AnalisisSchema,
      execute: async (analisis) => verificarAnalisis(analisis),
      toModelOutput: ({ output }) => ({ type: "text", value: resumenDelAnalisis(output) }),
    }),
  };
}
