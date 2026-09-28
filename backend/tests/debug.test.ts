import { describe, expect, it } from "vitest";
import { generarDiagramaFlujo } from "@/backend/tools/diagrama.tools";
import type { ParteDelTutor, TutorUIMessage } from "@/shared/chat";
import { comoTextoDeDebug, respuestasParaDebug, totalesDeDebug } from "@/views/chat/debug";

// Sin mocks: mensajes con el mismo tipo que arma useChat, y un diagrama real de Kroki (necesita internet).

const alumno = (id: string, texto: string): TutorUIMessage => ({
  id,
  role: "user",
  parts: [{ type: "text", text: texto }],
});
const tutor = (id: string, parts: ParteDelTutor[], metadata?: TutorUIMessage["metadata"]): TutorUIMessage => ({
  id,
  role: "assistant",
  parts,
  metadata,
});

describe("comoTextoDeDebug", () => {
  it("muestra JSON legible y recorta lo muy largo avisando cuánto falta", () => {
    expect(comoTextoDeDebug({ tema: "colas" })).toBe('{\n  "tema": "colas"\n}');
    expect(comoTextoDeDebug("a".repeat(30), 10)).toBe(`${"a".repeat(10)}… (20 caracteres más)`);
  });

  it("no vuelca el SVG de un diagrama: lo resume", async () => {
    const diagrama = await generarDiagramaFlujo("Llegada", 'flowchart TD\n  A(["Inicio"]) --> B["T = TPLL"]');

    const texto = comoTextoDeDebug(diagrama);

    expect(texto).toMatch(/\[SVG de \d+ caracteres\]/);
    expect(texto).not.toContain("<svg");
  });
});

describe("respuestasParaDebug", () => {
  const mensajes: TutorUIMessage[] = [
    alumno("u1", "Hola"),
    tutor("a1", [{ type: "text", text: "¡Hola!" }]), // de una sesión anterior: sin metadatos
    alumno("u2", "¿Cómo se hace el tiempo comprometido?"),
    tutor(
      "a2",
      [
        {
          type: "tool-consultar_modelos",
          toolCallId: "t1",
          state: "output-available",
          input: { tema: "tiempo comprometido" },
          output: "Modelo: ...",
        },
        {
          type: "tool-verificar_fdp",
          toolCallId: "t2",
          state: "output-error",
          input: { fx: "x", a: 0, b: 1 },
          errorText: "f(x) no es válida",
        },
        {
          type: "tool-buscar_ejercicio",
          toolCallId: "t3",
          state: "input-available",
          input: { nombreODescripcion: "Clínica" },
        },
        { type: "text", text: "Se hace así..." },
      ],
      { modelo: "gpt-4o-mini", pasos: 3, ms: 4200, tokens: { entrada: 900, salida: 300, total: 1200 } }
    ),
  ];

  it("arma una entrada por respuesta, con el pedido del alumno, sus tools y los datos del modelo", () => {
    const [primera, segunda] = respuestasParaDebug(mensajes);

    expect(primera).toMatchObject({ numero: 1, pedido: "Hola", llamadas: [], metadatos: undefined });
    expect(segunda).toMatchObject({ numero: 2, pedido: "¿Cómo se hace el tiempo comprometido?" });
    expect(segunda.metadatos?.tokens?.total).toBe(1200);
    expect(segunda.llamadas.map(({ herramienta, estado, salida }) => ({ herramienta, estado, salida }))).toEqual([
      { herramienta: "consultar_modelos", estado: "lista", salida: "Modelo: ..." },
      { herramienta: "verificar_fdp", estado: "con error", salida: "f(x) no es válida" },
      { herramienta: "buscar_ejercicio", estado: "en curso", salida: null },
    ]);
    expect(segunda.llamadas[0].descripcion).toBe("Consultó los modelos de la cátedra");
  });

  it("los totales suman tools, tokens y demora de las respuestas que los tienen", () => {
    expect(totalesDeDebug(respuestasParaDebug(mensajes))).toEqual({ tokens: 1200, ms: 4200, llamadas: 3 });
  });
});
