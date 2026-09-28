import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { renderizarMermaid, type ResultadoKroki } from "@/backend/lib/kroki";

/** Lo que devuelve la tool: el SVG va a la vista (se muestra como imagen); el modelo solo recibe un resumen. */
export type DiagramaGenerado = { titulo: string; mermaid: string } & ResultadoKroki;

/** Genera el diagrama con Kroki. `opciones` permite probar con otro servidor o timeout. */
export async function generarDiagramaFlujo(
  titulo: string,
  mermaid: string,
  opciones?: Parameters<typeof renderizarMermaid>[1]
): Promise<DiagramaGenerado> {
  return { titulo, mermaid, ...(await renderizarMermaid(mermaid, opciones)) };
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
        "Dibuja un diagrama de flujo (Mermaid → imagen con Kroki) y se lo muestra al alumno. Usala cuando resolvés o " +
        "corregís el diagrama de un ejercicio, o cuando el alumno pide ver uno. NUNCA al dar un ejercicio nuevo.",
      inputSchema: z.object({
        titulo: z.string().min(2).max(120).describe("De qué es el diagrama, ej: 'Clínica — diagrama completo'"),
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
