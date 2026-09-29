import { describe, expect, it } from "vitest";
import { MAX_CARACTERES_MERMAID, problemaDeMermaid } from "@/backend/models/dominio/mermaid";

// Qué código Mermaid se acepta antes de mandarlo a Kroki. Lógica pura: sin red.

const DIAGRAMA = 'flowchart TD\n  A(["Inicio"]) --> B{"¿TPLL ≤ TPS?"}';

describe("problemaDeMermaid", () => {
  it("un diagrama de flujo de Mermaid no tiene problemas (con cualquier orientación)", () => {
    expect(problemaDeMermaid(DIAGRAMA)).toBeNull();
    expect(problemaDeMermaid('graph LR\n  A["x"] --> B["y"]')).toBeNull();
  });

  it("lo que no es un diagrama de flujo, o está vacío, es «codigo_invalido»", () => {
    for (const codigo of ["hola", "sequenceDiagram\n A->>B: hola", "   ", ""]) {
      expect(problemaDeMermaid(codigo)?.motivo, codigo).toBe("codigo_invalido");
    }
  });

  it(`más de ${MAX_CARACTERES_MERMAID} caracteres es «demasiado_largo», y el detalle dice el límite`, () => {
    const largo = `flowchart TD\n${'  A["x"] --> B["y"]\n'.repeat(400)}`;

    expect(problemaDeMermaid(largo)).toEqual({
      motivo: "demasiado_largo",
      detalle: expect.stringContaining(String(MAX_CARACTERES_MERMAID)),
    });
  });
});
