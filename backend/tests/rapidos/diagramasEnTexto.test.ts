import { describe, expect, it } from "vitest";
import { diagramaDeLaRespuesta } from "@/views/chat/DiagramaDeFlujo";
import { partirEnBloques } from "@/views/chat/diagramasEnTexto";

// Cuando el tutor escribe un diagrama como código en el texto (en vez de usar la tool), la vista lo muestra como
// imagen. Lógica pura: qué bloques son diagramas y cómo se lee la respuesta de POST /api/diagrama.

const DIAGRAMA = 'flowchart TD\n  CI[["C.I."]] --> D1{"TPLL ≤ TPS"}';

describe("partirEnBloques", () => {
  it("separa un bloque ```mermaid del texto de alrededor, en orden", () => {
    const texto = `Programa principal:\n\n\`\`\`mermaid\n${DIAGRAMA}\n\`\`\`\n\n¿Seguimos?`;

    expect(partirEnBloques(texto)).toEqual([
      { tipo: "texto", texto: "Programa principal:" },
      { tipo: "diagrama", mermaid: DIAGRAMA },
      { tipo: "texto", texto: "¿Seguimos?" },
    ]);
  });

  it("también toma un bloque sin lenguaje que empieza como diagrama de flujo", () => {
    expect(partirEnBloques(`\`\`\`\n${DIAGRAMA}\n\`\`\``)).toEqual([{ tipo: "diagrama", mermaid: DIAGRAMA }]);
  });

  it("varios diagramas en la misma respuesta salen como bloques separados", () => {
    const texto = `\`\`\`mermaid\n${DIAGRAMA}\n\`\`\`\nY la llegada:\n\`\`\`mermaid\nflowchart TD\n  L0{{"LLEGADA"}}\n\`\`\``;

    expect(partirEnBloques(texto).map((bloque) => bloque.tipo)).toEqual(["diagrama", "texto", "diagrama"]);
  });

  it("un bloque sin cerrar (la respuesta todavía está llegando) queda como texto: no se dibuja a medias", () => {
    const texto = `Programa principal:\n\`\`\`mermaid\n${DIAGRAMA}`;

    expect(partirEnBloques(texto)).toEqual([{ tipo: "texto", texto }]);
  });

  it("otro código (una fórmula, una tabla) no es un diagrama", () => {
    const texto = "```\nIA = 5 + 10 * R\n```";

    expect(partirEnBloques(texto)).toEqual([{ tipo: "texto", texto }]);
  });

  it("un texto sin código queda igual; uno vacío, sin bloques", () => {
    expect(partirEnBloques("Hola")).toEqual([{ tipo: "texto", texto: "Hola" }]);
    expect(partirEnBloques("")).toEqual([]);
  });
});

describe("diagramaDeLaRespuesta (lo que devuelve POST /api/diagrama)", () => {
  it("un diagrama generado se muestra como data URL con su SVG", () => {
    const svg = "<svg><text>C.I.</text></svg>";

    const diagrama = diagramaDeLaRespuesta({ ok: true, titulo: "Diagrama de flujo", mermaid: DIAGRAMA, svg });

    expect(diagrama).toMatchObject({ titulo: "Diagrama de flujo", mermaid: DIAGRAMA });
    expect(decodeURIComponent(diagrama!.src.split(",")[1])).toBe(svg);
  });

  it("si Kroki no lo pudo generar, o la respuesta no tiene la forma esperada, no hay imagen", () => {
    expect(diagramaDeLaRespuesta({ ok: false, motivo: "sintaxis", detalle: "Parse error" })).toBeNull();
    expect(diagramaDeLaRespuesta({ ok: true, mermaid: DIAGRAMA })).toBeNull();
    expect(diagramaDeLaRespuesta({ error: { codigo: "no_autenticado" } })).toBeNull();
    expect(diagramaDeLaRespuesta(null)).toBeNull();
  });
});
