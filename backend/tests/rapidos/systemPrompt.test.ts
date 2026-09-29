import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { armarSystemPrompt } from "@/backend/lib/prompts/systemPrompt";
import { EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";
import { MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { crearToolsTutor } from "@/backend/tools/tutor.tools";

// El CONTRATO del prompt y de las tools: lo que tiene que estar para que el tutor funcione (cada tool presentada,
// sus secciones, las reglas críticas) y lo que nunca puede aparecer (la metodología). No se afirman oraciones
// enteras: el prompt se reescribe seguido para mejorar al tutor y eso no tiene que romper los tests. Se buscan
// encabezados y palabras clave. Si el modelo CUMPLE estas reglas no se prueba acá: depende del modelo real.

const prompt = armarSystemPrompt();
const tools = crearToolsTutor({
  material: MaterialCatedra.cargar(),
  ejercicios: new EjerciciosModel(),
  conversacionId: "sin-conversacion",
});
/** El texto de una sección del prompt (desde su encabezado hasta el siguiente "# "). */
const seccion = (encabezado: string) => {
  const inicio = prompt.indexOf(`\n# ${encabezado}`);
  expect(inicio, `falta la sección «${encabezado}»`).toBeGreaterThan(-1);
  const fin = prompt.indexOf("\n# ", inicio + 3);
  return prompt.slice(inicio, fin === -1 ? undefined : fin);
};

describe("contrato del prompt", () => {
  it("incluye la base de conocimiento completa, tal cual está en el archivo", () => {
    expect(prompt).toContain(readFileSync("backend/knowledge/base-conocimiento-simulacion.md", "utf8"));
  });

  it("es siempre el mismo (no trae material fijo: el material lo pide el modelo con las tools)", () => {
    expect(armarSystemPrompt()).toBe(prompt);
  });

  it("presenta cada tool que existe, con sus parámetros", () => {
    for (const nombre of Object.keys(tools)) expect(prompt, nombre).toMatch(new RegExp(`\\*\\*${nombre}\\(`));
  });

  it("tiene las secciones que guían al tutor", () => {
    for (const encabezado of [
      "Qué quiere el alumno",
      "Cómo resolvés",
      "Cómo corregís",
      "Cómo dibujar un diagrama",
      "La metodología la descubre el alumno",
      "Ejemplos",
    ]) {
      seccion(encabezado);
    }
  });

  it("define los cuatro modos, y corregir es solo cuando el alumno mandó algo suyo", () => {
    const modos = seccion("Qué quiere el alumno");

    for (const modo of ["Ejercicio nuevo", "Corrección", "Consulta teórica", "Resolver un ejercicio"]) {
      expect(modos).toContain(`**${modo}**`);
    }
    expect(modos).toMatch(/Corrección\*\*: SOLO si el alumno te mandó/);
  });

  it("al resolver, los diagramas van con la herramienta; al dar un ejercicio nuevo, nunca", () => {
    expect(seccion("Cómo resolvés")).toContain("generar_diagrama_flujo");
    expect(seccion("Cómo resolvés")).toMatch(/Nunca escribas código Mermaid en el mensaje/);
    expect(prompt).toMatch(/\*\*Nunca al dar un ejercicio nuevo\*\*/);
  });

  it("resuelve en tres respuestas: variables y eventos, f.d.p., diagrama de flujo", () => {
    const resolver = seccion("Cómo resolvés");
    const variables = resolver.indexOf("**Variables y eventos**");
    const fdp = resolver.indexOf("**Las f.d.p.**");
    const diagrama = resolver.indexOf("**El diagrama de flujo**");

    expect(resolver).toMatch(/\*\*tres respuestas\*\*/);
    expect(variables).toBeGreaterThan(-1);
    expect(fdp).toBeGreaterThan(variables);
    expect(diagrama).toBeGreaterThan(fdp);
  });

  it("los ejemplos de diagramas del prompt usan la convención de la cátedra", () => {
    const dibujar = seccion("Cómo dibujar un diagrama");

    expect(dibujar).toContain('CI[["C.I."]]');
    expect(dibujar).toMatch(/:::conector/);
    expect(dibujar).toMatch(/shape: f-circ/);
    expect(dibujar).toMatch(/-- "SI" -->/);
    expect(dibujar).not.toMatch(/"SÍ"|\(\["Inicio"\]\)/);
  });

  it("la regla de consultar los modelos va al principio (ahí pesa más para el modelo)", () => {
    expect(prompt.slice(0, 800)).toMatch(/Regla más importante[\s\S]*consultar_modelos/);
  });

  it("una f.d.p. se verifica con verificar_fdp antes de responder", () => {
    expect(prompt).toMatch(/antes de responder, verificala con verificar_fdp/);
  });

  it("la resolución de la cátedra es una referencia a contrastar, no la verdad", () => {
    expect(prompt).toMatch(/una referencia más, no la verdad/);
  });

  it("corrige de a un error, marcado con «> ⚠» (lo que la vista destaca)", () => {
    expect(seccion("Cómo corregís")).toContain("> ⚠");
  });

  it("las fórmulas van en LaTeX con $...$ (lo que muestra KaTeX)", () => {
    expect(prompt).toContain("`$...$`");
  });
});

describe("la metodología la descubre el alumno", () => {
  const nombraLaMetodologia = /evento a evento|\bEaE\b|Δt/i;

  it("la presentación del tutor no la nombra", () => {
    expect(prompt.split("\n")[0]).not.toMatch(nombraLaMetodologia);
  });

  it("el ejemplo de ejercicio nuevo no la nombra y termina en «Se pide:»", () => {
    // Hasta el separador "---": después viene la base de conocimiento, que sí habla de la metodología.
    const inicio = prompt.indexOf("## Ejemplo 3");
    const ejemplo = prompt.slice(inicio, prompt.indexOf("\n---\n", inicio));

    expect(ejemplo).toContain("Se pide:");
    expect(ejemplo).not.toMatch(nombraLaMetodologia);
  });
});

describe("contrato de las tools (lo que lee el modelo para decidir)", () => {
  it("cada tool tiene una descripción que explica cuándo usarla", () => {
    for (const [nombre, herramienta] of Object.entries(tools)) {
      expect(herramienta.description?.length ?? 0, nombre).toBeGreaterThan(50);
    }
  });

  it("generar_diagrama_flujo: siempre para mostrar un diagrama, nunca al dar un ejercicio nuevo", () => {
    const descripcion = tools.generar_diagrama_flujo.description ?? "";

    expect(descripcion).toMatch(/SIEMPRE para mostrar un diagrama/i);
    expect(descripcion).toMatch(/nunca escribas Mermaid en el mensaje/i);
    expect(descripcion).toMatch(/NUNCA al dar un ejercicio nuevo/i);
  });

  it("verificar_fdp: siempre que se resuelve o corrige una f.d.p.", () => {
    expect(tools.verificar_fdp.description).toMatch(/SIEMPRE que resuelvas o corrijas una f\.d\.p\./i);
  });

  it("generar_ejercicio: siempre que se da un ejercicio nuevo", () => {
    expect(tools.generar_ejercicio.description).toMatch(/SIEMPRE que le des un ejercicio nuevo/i);
  });
});
