import { describe, expect, it } from "vitest";
import {
  conConvencionDeLaCatedra,
  conEstilosDeLaCatedra,
  MAX_CARACTERES_MERMAID,
  problemaDeMermaid,
  sinPreguntasEnLasDecisiones,
} from "@/backend/models/dominio/mermaid";

// Qué código Mermaid se acepta antes de mandarlo a Kroki. Lógica pura: sin red.

const DIAGRAMA = 'flowchart TD\n  CI[["C.I."]] --> B{"TPLL ≤ TPS"}';

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

describe("conEstilosDeLaCatedra", () => {
  it("define el estilo de los conectores debajo de flowchart TD, sin tocar el resto", () => {
    const codigo = 'flowchart TD\n  A1(("A")):::conector --> B["T = TPLL"]';

    const conEstilo = conEstilosDeLaCatedra(codigo).split("\n");

    expect(conEstilo[0]).toBe("flowchart TD");
    expect(conEstilo[1]).toMatch(/^\s*classDef conector /);
    expect(conEstilo.slice(2).join("\n")).toBe('  A1(("A")):::conector --> B["T = TPLL"]');
  });

  it("si el código ya define el estilo, lo deja como está", () => {
    const codigo = "flowchart TD\n  classDef conector fill:#000\n  A --> B";

    expect(conEstilosDeLaCatedra(codigo)).toBe(codigo);
  });
});

describe("sinPreguntasEnLasDecisiones", () => {
  it("saca los signos de pregunta de los rombos, con o sin comillas", () => {
    const codigo = 'flowchart TD\n  F{"T < TF?"} -- "SI" --> A\n  D{"¿TPLL ≤ TPS?"}\n  N{NS = 1?}';

    expect(sinPreguntasEnLasDecisiones(codigo)).toBe(
      'flowchart TD\n  F{"T < TF"} -- "SI" --> A\n  D{"TPLL ≤ TPS"}\n  N{NS = 1}'
    );
  });

  it("no toca hexágonos, puntos de unión ni otros nodos", () => {
    const codigo = 'flowchart TD\n  G{{"¿IA?"}} --- J1@{ shape: f-circ }\n  R["¿Qué pasa?"]';

    expect(sinPreguntasEnLasDecisiones(codigo)).toBe(codigo);
  });
});

describe("conConvencionDeLaCatedra", () => {
  it("aplica las dos cosas: decisiones sin «?» y el estilo de los conectores", () => {
    const resultado = conConvencionDeLaCatedra('flowchart TD\n  F{"T < TF?"} -- "SI" --> A2(("A")):::conector');

    expect(resultado).toContain('F{"T < TF"}');
    expect(resultado).toMatch(/classDef conector /);
  });
});
