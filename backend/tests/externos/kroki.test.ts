import { describe, expect, it } from "vitest";
import { clienteKroki } from "@/backend/lib/kroki";

// El contrato con el Kroki real (kroki.io): que siga devolviendo un SVG para un diagrama válido y un error de
// sintaxis para uno roto. Cómo manejamos cada respuesta (reintentos, 429, timeouts...) se prueba sin internet
// en integracion/kroki.test.ts.

const DIAGRAMA = `flowchart TD
  A(["Inicio"]) --> B{"¿TPLL ≤ TPS?"}
  B -- "SÍ" --> C["T = TPLL"]
  B -- "NO" --> D["T = TPS"]`;

describe("Kroki real", () => {
  it("un diagrama válido devuelve un SVG con el texto del diagrama", async () => {
    const resultado = await clienteKroki.renderizar(DIAGRAMA);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.svg).toMatch(/^\s*(<\?xml[^>]*>\s*)?<svg/);
      expect(resultado.svg).toContain("TPLL");
    }
  });

  it("un Mermaid con error de sintaxis devuelve «sintaxis» con el detalle del servicio", async () => {
    const resultado = await clienteKroki.renderizar('flowchart TD\n  A["Inicio"] --> ((');

    expect(resultado).toMatchObject({ ok: false, motivo: "sintaxis" });
    expect(resultado.ok || resultado.detalle.length).toBeGreaterThan(0);
  });
});
