import { describe, expect, it } from "vitest";
import { DiagramaController } from "@/backend/controllers/diagrama.controller";
import { ClienteKroki } from "@/backend/lib/kroki";
import {
  crearToolsDiagrama,
  generarDiagramaFlujo,
  resumenParaElModelo,
  type DiagramaGenerado,
} from "@/backend/tools/diagrama.tools";
import type { ParteDelTutor } from "@/shared/chat";
import { diagramaDe, herramientaFallo } from "@/views/chat/tipos";
import { levantarServidor } from "../helpers/servidorHttpLocal";

// La tool generar_diagrama_flujo con la vista: qué lee el modelo del resultado y qué muestra el chat.
// Los resultados son datos fijos con el tipo real (DiagramaGenerado): no hace falta llamar a Kroki para armarlos.
// Cómo se maneja cada respuesta de Kroki se prueba en integracion/kroki.test.ts.

const MERMAID = 'flowchart TD\n  CI[["C.I."]] --> B["T = TPLL"]';
const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><text>T = TPLL</text></svg>';

const generado: DiagramaGenerado = { ok: true, titulo: "Llegada", mermaid: MERMAID, svg: SVG };
const conSintaxisRota: DiagramaGenerado = {
  ok: false,
  titulo: "Roto",
  mermaid: 'flowchart TD\n  A["x"] --> ((',
  motivo: "sintaxis",
  detalle: "Parse error on line 2",
};
const conServicioCaido: DiagramaGenerado = {
  ok: false,
  titulo: "Llegada",
  mermaid: MERMAID,
  motivo: "servicio",
  detalle: "Kroki falló (HTTP 503).",
};

describe("generarDiagramaFlujo", () => {
  it("dibuja los conectores de la cátedra en azul: agrega su estilo al código que manda a Kroki y muestra", async () => {
    const servidor = await levantarServidor(() => ({
      status: 200,
      headers: { "content-type": "image/svg+xml" },
      cuerpo: SVG,
    }));
    const kroki = new ClienteKroki({ endpoint: servidor.url });
    const conConector = 'flowchart TD\n  A1(("A")):::conector --> B["T = TPLL"]';

    try {
      const diagrama = await generarDiagramaFlujo("Principal", conConector, kroki);

      expect(diagrama).toMatchObject({ ok: true, titulo: "Principal", svg: SVG });
      expect(diagrama.mermaid).toMatch(/^flowchart TD\n\s*classDef conector /);
      expect(diagrama.mermaid).toContain('A1(("A")):::conector --> B["T = TPLL"]');
    } finally {
      await servidor.cerrar();
    }
  });
});

describe("DiagramaController.dibujar (POST /api/diagrama: el Mermaid que el tutor escribió en el texto)", () => {
  it("un pedido válido se dibuja igual que con la tool: con Kroki y con el estilo de la cátedra", async () => {
    const servidor = await levantarServidor(() => ({
      status: 200,
      headers: { "content-type": "image/svg+xml" },
      cuerpo: SVG,
    }));
    const controller = new DiagramaController(new ClienteKroki({ endpoint: servidor.url }));

    try {
      const diagrama = await controller.dibujar({ mermaid: MERMAID });

      expect(diagrama).toMatchObject({ ok: true, svg: SVG });
      expect(diagrama.mermaid).toMatch(/classDef conector /);
      expect(servidor.pedidos()).toBe(1);
    } finally {
      await servidor.cerrar();
    }
  });

  it("un pedido inválido se corta con «pedido_invalido» sin llamar a Kroki", async () => {
    const servidor = await levantarServidor(() => ({ status: 200, cuerpo: SVG }));
    const controller = new DiagramaController(new ClienteKroki({ endpoint: servidor.url }));

    try {
      await expect(controller.dibujar({ mermaid: "" })).rejects.toMatchObject({ codigo: "pedido_invalido" });
      expect(servidor.pedidos()).toBe(0);
    } finally {
      await servidor.cerrar();
    }
  });
});

describe("resumenParaElModelo (lo único que lee el modelo del resultado)", () => {
  it("si salió, le dice que ya se mostró y que no lo repita, sin mandarle el SVG", () => {
    const resumen = resumenParaElModelo(generado);

    expect(resumen).toContain("No lo repitas en texto");
    expect(resumen).not.toContain("<svg");
  });

  it("si es un error de sintaxis, le pasa el detalle y le pide corregir y reintentar una vez", () => {
    const resumen = resumenParaElModelo(conSintaxisRota);

    expect(resumen).toContain("Parse error on line 2");
    expect(resumen).toContain("volvé a llamar a la herramienta (una vez)");
  });

  it("si falló el servicio, le pide no reintentar y describir el diagrama en texto", () => {
    const resumen = resumenParaElModelo(conServicioCaido);

    expect(resumen).toContain("No reintentes");
    expect(resumen).toContain("lista numerada");
  });
});

describe("la tool generar_diagrama_flujo", () => {
  const { generar_diagrama_flujo: herramienta } = crearToolsDiagrama();

  it("al modelo le llega el resumen en texto, no el SVG", async () => {
    const paraElModelo = await herramienta.toModelOutput!({
      toolCallId: "prueba",
      input: { titulo: "Llegada", mermaid: MERMAID },
      output: generado,
    });

    expect(paraElModelo).toEqual({ type: "text", value: resumenParaElModelo(generado) });
  });
});

describe("en la vista: diagramaDe y herramientaFallo", () => {
  // Partes con el mismo tipo que recibe la vista (si la tool cambia de nombre o de datos, esto no compila).
  const conSalida = (output: DiagramaGenerado): ParteDelTutor => ({
    type: "tool-generar_diagrama_flujo",
    toolCallId: "t1",
    state: "output-available",
    input: { titulo: output.titulo, mermaid: output.mermaid },
    output,
  });

  it("un diagrama generado se muestra como data URL con su SVG", () => {
    const parte = conSalida(generado);

    const diagrama = diagramaDe(parte);

    expect(diagrama).toMatchObject({ titulo: "Llegada", mermaid: MERMAID });
    expect(decodeURIComponent(diagrama!.src.split(",")[1])).toBe(SVG);
    expect(herramientaFallo(parte)).toBe(false);
  });

  it("mientras se genera, o si falló, no hay imagen; si falló, se marca como error", () => {
    const enCurso: ParteDelTutor = {
      type: "tool-generar_diagrama_flujo",
      toolCallId: "t2",
      state: "input-available",
      input: { titulo: "Roto", mermaid: conSintaxisRota.mermaid },
    };
    const conError = conSalida(conSintaxisRota);

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
