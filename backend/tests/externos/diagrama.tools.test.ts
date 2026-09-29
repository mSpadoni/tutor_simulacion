import { describe, expect, it } from "vitest";
import { ClienteKroki } from "@/backend/lib/kroki";
import {
  crearToolsDiagrama,
  generarDiagramaFlujo,
  resumenParaElModelo,
  type DiagramaGenerado,
} from "@/backend/tools/diagrama.tools";
import type { ParteDelTutor } from "@/shared/chat";
import { diagramaDe, herramientaFallo } from "@/views/chat/tipos";

// Sin mocks: la tool llama a Kroki real (necesita internet).

const MERMAID = 'flowchart TD\n  A(["Inicio"]) --> B["T = TPLL"]';

describe("generarDiagramaFlujo", () => {
  it("devuelve el título, el Mermaid y el SVG de Kroki", async () => {
    const diagrama = await generarDiagramaFlujo("Llegada", MERMAID);

    expect(diagrama).toMatchObject({ ok: true, titulo: "Llegada", mermaid: MERMAID });
    expect(diagrama.ok && diagrama.svg).toContain("<svg");
  });
});

describe("resumenParaElModelo (lo único que lee el modelo del resultado)", () => {
  it("si salió, le dice que ya se mostró y que no lo repita, sin mandarle el SVG", async () => {
    const resumen = resumenParaElModelo(await generarDiagramaFlujo("Llegada", MERMAID));

    expect(resumen).toContain("No lo repitas en texto");
    expect(resumen).not.toContain("<svg");
  });

  it("si es un error de sintaxis, le pasa el detalle y le pide corregir y reintentar una vez", async () => {
    const resumen = resumenParaElModelo(await generarDiagramaFlujo("Roto", 'flowchart TD\n  A["x"] --> (('));

    expect(resumen).toContain("Corregí el Mermaid y volvé a llamar a la herramienta (una vez)");
  });

  it("si falló el servicio, le pide no reintentar y describir el diagrama en texto", async () => {
    const resumen = resumenParaElModelo(
      await generarDiagramaFlujo(
        "Llegada",
        MERMAID,
        new ClienteKroki({ endpoint: "https://httpbin.org/status/503", reintentos: 0 })
      )
    );

    expect(resumen).toContain("No reintentes");
    expect(resumen).toContain("lista numerada");
  });
});

describe("la tool generar_diagrama_flujo", () => {
  const { generar_diagrama_flujo: herramienta } = crearToolsDiagrama();

  it("dice en su descripción que nunca se usa al dar un ejercicio nuevo", () => {
    expect(herramienta.description).toContain("NUNCA al dar un ejercicio nuevo");
  });

  it("al modelo le llega el resumen en texto, no el SVG", async () => {
    const salida = await generarDiagramaFlujo("Llegada", MERMAID);

    const paraElModelo = await herramienta.toModelOutput!({
      toolCallId: "prueba",
      input: { titulo: "Llegada", mermaid: MERMAID },
      output: salida,
    });

    expect(paraElModelo).toEqual({ type: "text", value: resumenParaElModelo(salida) });
  });
});

describe("en la vista: diagramaDe y herramientaFallo", () => {
  // Partes con el mismo tipo que recibe la vista (si la tool cambia de nombre o de datos, esto no compila).
  const conSalida = (titulo: string, mermaid: string, output: DiagramaGenerado): ParteDelTutor => ({
    type: "tool-generar_diagrama_flujo",
    toolCallId: "t1",
    state: "output-available",
    input: { titulo, mermaid },
    output,
  });

  it("un diagrama generado se muestra como data URL con su SVG", async () => {
    const salida = await generarDiagramaFlujo("Llegada", MERMAID);
    const parte = conSalida("Llegada", MERMAID, salida);

    const diagrama = diagramaDe(parte);

    expect(diagrama).toMatchObject({ titulo: "Llegada", mermaid: MERMAID });
    expect(decodeURIComponent(diagrama!.src.split(",")[1])).toBe(salida.ok && salida.svg);
    expect(herramientaFallo(parte)).toBe(false);
  });

  it("mientras se genera, o si falló, no hay imagen; si falló, se marca como error", async () => {
    const fallida = await generarDiagramaFlujo("Roto", "no es mermaid");
    const enCurso: ParteDelTutor = {
      type: "tool-generar_diagrama_flujo",
      toolCallId: "t2",
      state: "input-available",
      input: { titulo: "Roto", mermaid: "no es mermaid" },
    };
    const conError = conSalida("Roto", "no es mermaid", fallida);

    expect(diagramaDe(enCurso)).toBeNull();
    expect(diagramaDe(conError)).toBeNull();
    expect(herramientaFallo(conError)).toBe(true);
    expect(herramientaFallo(enCurso)).toBe(false);
  });

  it("otras tools no son diagramas", () => {
    const parte: ParteDelTutor = {
      type: "tool-consultar_modelos",
      toolCallId: "t3",
      state: "output-available",
      input: { tema: "colas" },
      output: "texto",
    };
    expect(diagramaDe(parte)).toBeNull();
  });
});
