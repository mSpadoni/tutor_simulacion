// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ParteDelTutor, TutorUIMessage } from "@/shared/chat";
import MessageBubble from "@/views/chat/MessageBubble";

// Cómo se muestra un mensaje del chat, renderizado en un DOM (jsdom) y leído como lo leería el alumno.
// El texto del tutor lo escribe un LLM: puede traer HTML o links peligrosos (por una inyección en lo que mandó
// el alumno o en el material). Lo primero que se prueba es que eso nunca llegue a ejecutarse.
afterEach(cleanup);

const delTutor = (texto: string, partes: ParteDelTutor[] = []): TutorUIMessage => ({
  id: "m1",
  role: "assistant",
  parts: [...partes, { type: "text", text: texto }],
});

/** El globo, dentro de una lista (como en el chat). */
const mostrar = (mensaje: TutorUIMessage) =>
  render(
    <ol>
      <MessageBubble mensaje={mensaje} />
    </ol>
  );

describe("MessageBubble — seguridad del texto del tutor", () => {
  it("el HTML que escribe el modelo no se renderiza: ni <script>, ni <img onerror>, ni <iframe>", () => {
    const { container } = mostrar(
      delTutor(
        'Hola <script>alert("x")</script> <img src="x" onerror="alert(1)"> <iframe src="https://malo.example"></iframe> fin'
      )
    );

    expect(container.querySelector("script, iframe")).toBeNull();
    expect(container.querySelector("img[onerror]")).toBeNull();
    expect(container).toHaveTextContent("Hola");
  });

  it("un link con javascript: no queda ejecutable", () => {
    const { container } = mostrar(delTutor("Mirá [acá](javascript:alert(1)) y [la guía](https://example.com)."));

    for (const link of container.querySelectorAll("a")) {
      expect(link.getAttribute("href") ?? "").not.toMatch(/^\s*javascript:/i);
    }
    // Los links comunes sí funcionan, y se abren aparte sin darle acceso a la página.
    expect(screen.getByRole("link", { name: "la guía" })).toHaveAttribute("rel", "noreferrer");
  });

  it("el texto del alumno se muestra tal cual (no se interpreta como Markdown ni HTML)", () => {
    const { container } = mostrar({
      id: "m2",
      role: "user",
      parts: [{ type: "text", text: "**no es negrita** <b>tampoco</b>" }],
    });

    expect(container.querySelector("strong, b")).toBeNull();
    expect(container).toHaveTextContent("**no es negrita** <b>tampoco</b>");
  });
});

describe("MessageBubble — contenido", () => {
  it("el rol se dice con texto (no solo con color o posición)", () => {
    mostrar(delTutor("Hola"));

    expect(screen.getByText("Tutor")).toBeInTheDocument();
  });

  it("las fórmulas en LaTeX se muestran con KaTeX, con MathML para lectores de pantalla", () => {
    const { container } = mostrar(delTutor("La inversa es $x = 6\\sqrt{R} + 1$."));

    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.querySelector("math")).not.toBeNull();
  });

  it("un diagrama generado se muestra como imagen con texto alternativo y su Mermaid como alternativa en texto", () => {
    const diagrama: ParteDelTutor = {
      type: "tool-generar_diagrama_flujo",
      toolCallId: "t1",
      state: "output-available",
      input: { titulo: "Llegada", mermaid: "flowchart TD\n  A --> B" },
      output: {
        ok: true,
        titulo: "Llegada",
        mermaid: "flowchart TD\n  A --> B",
        svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
      },
    };
    mostrar(delTutor("Acá está.", [diagrama]));

    expect(screen.getByRole("img", { name: "Diagrama de flujo: Llegada" })).toBeInTheDocument();
    expect(screen.getByText("Ver como texto (Mermaid)")).toBeInTheDocument();
    const material = screen.getByRole("list", { name: "Material que consultó el tutor" });
    expect(within(material).getByText(/diagrama/i)).toBeInTheDocument();
  });
});

describe("MessageBubble — análisis verificado", () => {
  const analisis = {
    metodologia: "Evento a Evento",
    variables: {
      datos: [{ nombre: "IA", descripcion: "intervalo entre arribos" }],
      control: [],
      resultado: [{ nombre: "PTO", descripcion: "porcentaje de tiempo ocioso" }],
      estado: [{ nombre: "NS", descripcion: "clientes en el sistema" }],
    },
    eventos: [
      { nombre: "LLEGADA", tef: "TPLL" },
      { nombre: "SALIDA", tef: "TPS" },
    ],
    tei: [
      { evento: "LLEGADA", efnc: "LLEGADA", efc: [{ evento: "SALIDA", condicion: "NS = 1" }] },
      { evento: "SALIDA", efnc: null, efc: [{ evento: "SALIDA", condicion: "NS ≥ 1" }] },
    ],
  };
  const verificacion = (ok: boolean): ParteDelTutor => ({
    type: "tool-verificar_analisis",
    toolCallId: "t1",
    state: "output-available",
    input: analisis,
    output: { ok, problemas: ok ? [] : ["Falta la fila del evento SALIDA en la T.E.I."], analisis },
  });

  it("si pasó la verificación, la T.E.I. se muestra como tabla, una fila por evento, con --- donde no hay", () => {
    mostrar(delTutor("Las dos filas salen de la clase de EaE.", [verificacion(true)]));

    const seccion = screen.getByRole("region", { name: "Análisis del ejercicio" });
    const [tei] = within(seccion).getAllByRole("table");
    const filas = within(tei).getAllByRole("row").slice(1);
    expect(
      filas.map((fila) =>
        within(fila)
          .getAllByRole("cell")
          .map((celda) => celda.textContent)
      )
    ).toEqual([
      ["LLEGADA", "LLEGADA", "SALIDA", "NS = 1"],
      ["SALIDA", "---", "SALIDA", "NS ≥ 1"],
    ]);
    expect(seccion).toHaveTextContent("Control: ---");
  });

  it("si tenía problemas, no se muestra (el tutor lo corrige) y el aviso no lo marca como falla", () => {
    mostrar(delTutor("", [verificacion(false)]));

    expect(screen.queryByRole("region", { name: "Análisis del ejercicio" })).toBeNull();
    const material = screen.getByRole("list", { name: "Material que consultó el tutor" });
    expect(material).toHaveTextContent("Revisó el análisis con las reglas de la cátedra");
    expect(material).not.toHaveTextContent("⚠");
  });
});
