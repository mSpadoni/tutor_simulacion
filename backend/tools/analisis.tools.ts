import "server-only";
import { tool } from "ai";
import { AnalisisSchema, problemasDelAnalisis, type Analisis } from "@/backend/models/dominio/analisis";

// verificar_analisis: el modelo arma el análisis previo razonando sobre el enunciado y, antes de mostrarlo, lo
// verifica contra las reglas de la cátedra (como verificar_fdp con las f.d.p.). Si pasa, la vista lo muestra como
// tablas armadas desde estos datos validados; si no, el modelo recibe qué regla rompió para corregirlo.

/**
 * Revisiones que se rechazan como máximo en una misma respuesta. Después se muestra igual, con los avisos: un
 * modelo que no logra cumplir una regla no puede dejar al alumno sin respuesta ni gastar todos los pasos reintentando.
 */
export const RECHAZOS_POR_RESPUESTA = 2;

/**
 * Lo que devuelve la tool: el análisis y las reglas que no cumple. `ok` dice si se le muestra al alumno: cuando
 * cumple todas, o cuando se muestra igual (tope de rechazos) con `problemas` como avisos.
 */
export type AnalisisVerificado = { ok: boolean; problemas: string[]; analisis: Analisis };

/** Verifica el análisis contra las reglas de la cátedra. Con `rechazar: false`, lo acepta igual con avisos. */
export function verificarAnalisis(
  analisis: Analisis,
  { rechazar = true }: { rechazar?: boolean } = {}
): AnalisisVerificado {
  const problemas = problemasDelAnalisis(analisis);
  return { ok: problemas.length === 0 || !rechazar, problemas, analisis };
}

/** Lo que lee el modelo del resultado: si se muestra, que no repita las tablas; si no, qué corregir. */
export function resumenDelAnalisis(resultado: AnalisisVerificado): string {
  if (resultado.ok && resultado.problemas.length > 0) {
    return (
      "El alumno ya ve el análisis como tablas, con un aviso de las reglas que no cumple:\n" +
      resultado.problemas.map((problema) => `- ${problema}`).join("\n") +
      "\nNo lo vuelvas a verificar ni repitas las tablas: explicale en pocas líneas qué habría que revisar."
    );
  }
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

/** La tool para `streamText`. Se crea por pedido: cuenta los rechazos de esta respuesta. */
export function crearToolsAnalisis() {
  let rechazos = 0;
  return {
    verificar_analisis: tool({
      description:
        "Verifica el análisis previo de un ejercicio (metodología, variables, eventos, T.E.I. y T.E.F.) contra las " +
        "reglas de la cátedra y, si las cumple, se lo muestra al alumno como tablas. Usala SIEMPRE al resolver, antes " +
        "de mostrar el análisis: si devuelve problemas, corregilo y volvé a llamarla.",
      inputSchema: AnalisisSchema,
      execute: async (analisis) => {
        const resultado = verificarAnalisis(analisis, { rechazar: rechazos < RECHAZOS_POR_RESPUESTA });
        if (!resultado.ok) rechazos += 1;
        return resultado;
      },
      toModelOutput: ({ output }) => ({ type: "text", value: resumenDelAnalisis(output) }),
    }),
  };
}
