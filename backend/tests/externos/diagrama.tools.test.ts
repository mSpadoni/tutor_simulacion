import { describe, expect, it } from "vitest";
import { generarDiagramaFlujo } from "@/backend/tools/diagrama.tools";

// La tool generar_diagrama_flujo de punta a punta con el Kroki real (necesita internet). Qué hace con cada
// resultado se prueba sin red en integracion/diagrama.tools.test.ts.

describe("generarDiagramaFlujo con Kroki real", () => {
  it("devuelve el título, el Mermaid y el SVG del diagrama", async () => {
    const mermaid = 'flowchart TD\n  A(["Inicio"]) --> B["T = TPLL"]';

    const diagrama = await generarDiagramaFlujo("Llegada", mermaid);

    expect(diagrama).toMatchObject({ ok: true, titulo: "Llegada", mermaid });
    expect(diagrama.ok && diagrama.svg).toContain("<svg");
  });
});
