import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { clienteKroki, type ClienteKroki, type ResultadoKroki } from "@/backend/lib/kroki";
import { conEstilosDeLaCatedra } from "@/backend/models/dominio/mermaid";

/** Lo que devuelve la tool: el SVG va a la vista (se muestra como imagen); el modelo solo recibe un resumen. */
export type DiagramaGenerado = { titulo: string; mermaid: string } & ResultadoKroki;

/** Genera el diagrama con Kroki. `kroki` permite probar con otro servidor o timeout. */
export async function generarDiagramaFlujo(
  titulo: string,
  mermaid: string,
  kroki: ClienteKroki = clienteKroki
): Promise<DiagramaGenerado> {
  const codigo = conEstilosDeLaCatedra(mermaid);
  return { titulo, mermaid: codigo, ...(await kroki.renderizar(codigo)) };
}

/** Lo que lee el modelo del resultado: si salió, que no lo repita en texto; si no, qué pasó y si puede corregirlo. */
export function resumenParaElModelo(diagrama: DiagramaGenerado): string {
  if (diagrama.ok) {
    return "Diagrama generado y mostrado al alumno como imagen (renderizado con Kroki). No lo repitas en texto.";
  }
  if (
    diagrama.motivo === "sintaxis" ||
    diagrama.motivo === "codigo_invalido" ||
    diagrama.motivo === "demasiado_largo"
  ) {
    return `No se pudo generar el diagrama: ${diagrama.detalle}\nCorregí el Mermaid y volvé a llamar a la herramienta (una vez).`;
  }
  return `No se pudo generar el diagrama (${diagrama.detalle}). No reintentes: describile el diagrama al alumno como lista numerada y avisale que el servicio de diagramas no respondió.`;
}

/** La tool para `streamText`. */
export function crearToolsDiagrama() {
  return {
    generar_diagrama_flujo: tool({
      description:
        "Dibuja una parte de un diagrama de flujo (Mermaid → imagen con Kroki) y se la muestra al alumno: una llamada por parte " +
        "(programa principal, cada rutina). Usala SIEMPRE al resolver un ejercicio (como último paso), al corregir un " +
        "diagrama o cuando el alumno pide ver uno. NUNCA al dar un ejercicio nuevo.",
      inputSchema: z.object({
        titulo: z
          .string()
          .min(2)
          .max(120)
          .describe("Qué parte es, ej: 'Clínica — programa principal' o 'Clínica — LLEGADA'"),
        mermaid: z
          .string()
          .min(10)
          .describe('Código Mermaid, empezando con "flowchart TD". Textos de los nodos entre comillas dobles.'),
      }),
      execute: ({ titulo, mermaid }) => generarDiagramaFlujo(titulo, mermaid),
      // El SVG pesa decenas de KB: al modelo solo le llega el resumen (el SVG queda en el resultado para la vista).
      toModelOutput: ({ output }) => ({ type: "text", value: resumenParaElModelo(output) }),
    }),
  };
}
