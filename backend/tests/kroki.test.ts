import { describe, expect, it } from "vitest";
import { MAX_CARACTERES_MERMAID, renderizarMermaid, validarMermaid } from "@/backend/lib/kroki";

// Sin mocks: contra Kroki real (kroki.io) y, para los errores HTTP, contra httpbin.org, un servicio público real
// que responde el código que se le pide (/status/500, /status/429...). Necesitan internet.

const DIAGRAMA = `flowchart TD
  A(["Inicio"]) --> B{"¿TPLL ≤ TPS?"}
  B -- "SÍ" --> C["T = TPLL"]
  B -- "NO" --> D["T = TPS"]`;

describe("validarMermaid (antes de llamar a Kroki)", () => {
  it("acepta un diagrama de flujo de Mermaid", () => {
    expect(validarMermaid(DIAGRAMA)).toBeNull();
  });

  it("rechaza lo que no es un diagrama de flujo o está vacío", () => {
    expect(validarMermaid("hola")).toMatchObject({ ok: false, motivo: "codigo_invalido" });
    expect(validarMermaid("sequenceDiagram\n A->>B: hola")).toMatchObject({ motivo: "codigo_invalido" });
    expect(validarMermaid("   ")).toMatchObject({ motivo: "codigo_invalido" });
  });

  it(`rechaza diagramas de más de ${MAX_CARACTERES_MERMAID} caracteres, diciendo el límite`, () => {
    const largo = `flowchart TD\n${'  A["x"] --> B["y"]\n'.repeat(400)}`;

    const resultado = validarMermaid(largo);

    expect(resultado).toMatchObject({ ok: false, motivo: "demasiado_largo" });
    expect(resultado && !resultado.ok && resultado.detalle).toContain(String(MAX_CARACTERES_MERMAID));
  });
});

describe("renderizarMermaid — con Kroki real", () => {
  it("un diagrama válido devuelve el SVG", async () => {
    const resultado = await renderizarMermaid(DIAGRAMA);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.svg).toMatch(/^\s*(<\?xml[^>]*>\s*)?<svg/);
      expect(resultado.svg).toContain("TPLL");
    }
  });

  it("un Mermaid con error de sintaxis devuelve el error de Kroki (para que el modelo lo corrija)", async () => {
    const resultado = await renderizarMermaid('flowchart TD\n  A["Inicio"] --> ((');

    expect(resultado).toMatchObject({ ok: false, motivo: "sintaxis" });
    expect(resultado.ok || resultado.detalle).toMatch(/error/i);
  });

  it("lo inválido se rechaza sin llamar a Kroki (responde al instante)", async () => {
    const inicio = Date.now();

    const resultado = await renderizarMermaid("esto no es un diagrama");

    expect(resultado).toMatchObject({ ok: false, motivo: "codigo_invalido" });
    expect(Date.now() - inicio).toBeLessThan(50);
  });

  it("si Kroki no responde a tiempo, avisa que tardó", async () => {
    const resultado = await renderizarMermaid(DIAGRAMA, { timeoutMs: 1, reintentos: 0 });

    expect(resultado).toMatchObject({ ok: false, motivo: "tiempo" });
  });
});

describe("renderizarMermaid — errores HTTP (con httpbin.org real)", () => {
  it("un 5xx se reintenta y, si sigue fallando, avisa que el servicio falló", async () => {
    const resultado = await renderizarMermaid(DIAGRAMA, { endpoint: "https://httpbin.org/status/500" });

    expect(resultado).toMatchObject({ ok: false, motivo: "servicio" });
    expect(resultado.ok || resultado.detalle).toContain("500");
  });

  it("un 429 espera, reintenta y, si sigue, avisa que hay demasiados pedidos", async () => {
    const inicio = Date.now();

    const resultado = await renderizarMermaid(DIAGRAMA, { endpoint: "https://httpbin.org/status/429" });

    expect(resultado).toMatchObject({ ok: false, motivo: "limite" });
    // Sin Retry-After espera 1 s antes de reintentar.
    expect(Date.now() - inicio).toBeGreaterThanOrEqual(1000);
  });

  it("una respuesta 200 que no es SVG no se acepta", async () => {
    const resultado = await renderizarMermaid(DIAGRAMA, { endpoint: "https://httpbin.org/post" });

    expect(resultado).toMatchObject({ ok: false, motivo: "respuesta_invalida" });
  });
});
