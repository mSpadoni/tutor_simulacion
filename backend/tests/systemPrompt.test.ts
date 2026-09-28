// Cómo se lee un test de Vitest:
// - describe("tema", () => {...}): agrupa tests relacionados.
// - it("qué debería pasar", () => {...}): un test. Si alguna línea `expect` no se cumple, el test falla.
// - expect(valor).toBe(esperado): compara. Otros: toEqual (mismo contenido), toContain, toMatch (regex), toThrow...
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { armarSystemPrompt } from "@/backend/lib/prompts/systemPrompt";
import { MaterialCatedra } from "@/backend/models/materialCatedra.model";

describe("armarSystemPrompt", () => {
  const prompt = armarSystemPrompt();

  it("incluye la base de conocimiento completa, tal cual está en el archivo", () => {
    const base = readFileSync("backend/knowledge/base-conocimiento-simulacion.md", "utf8");

    expect(prompt).toContain(base);
  });

  it("define los tres modos del tutor", () => {
    expect(prompt).toContain("Ejercicio nuevo");
    expect(prompt).toContain("Corrección");
    expect(prompt).toContain("Consulta teórica");
  });

  it("pide corregir de a un error y marcarlo con ⚠ (lo que la vista destaca)", () => {
    expect(prompt).toContain("UN error genuino por vez");
    expect(prompt).toContain("> ⚠");
  });

  it("sin fichas no agrega la sección de material de la cátedra", () => {
    expect(prompt).not.toContain("MATERIAL DE LA CÁTEDRA RELACIONADO");
    expect(armarSystemPrompt()).toBe(prompt);
  });

  it("con fichas, las agrega al final con su título y su fuente", () => {
    const fichas = MaterialCatedra.cargar().buscar("remisería con tiempo comprometido");

    const conMaterial = armarSystemPrompt(fichas);

    expect(conMaterial.startsWith(prompt)).toBe(true);
    expect(conMaterial).toContain("# MATERIAL DE LA CÁTEDRA RELACIONADO CON ESTA CONSULTA");
    for (const ficha of fichas) {
      expect(conMaterial).toContain(`### ${ficha.titulo}`);
      expect(conMaterial).toContain(ficha.contenido);
    }
  });

  it("separa los modelos (para explicar) de los ejercicios (para practicar), cada ficha en su grupo", () => {
    const fichas = MaterialCatedra.cargar().buscarModelosYEjercicios("tiempo comprometido con N autos");
    const conMaterial = armarSystemPrompt(fichas);
    const inicioModelos = conMaterial.indexOf("## Modelos de la cátedra (para explicar; no se dan como ejercicio)");
    const inicioEjercicios = conMaterial.indexOf("## Ejercicios de la cátedra (tipo de ejercicio para practicar");

    expect(inicioModelos).toBeGreaterThan(0);
    expect(inicioEjercicios).toBeGreaterThan(inicioModelos);
    for (const ficha of fichas) {
      const posicion = conMaterial.indexOf(`### ${ficha.titulo}`);
      if (ficha.tipo === "modelo") expect(posicion, ficha.titulo).toBeLessThan(inicioEjercicios);
      else expect(posicion, ficha.titulo).toBeGreaterThan(inicioEjercicios);
    }
  });

  it("si solo hay fichas de un tipo, no aparece el título del otro grupo", () => {
    const soloEjercicios = MaterialCatedra.cargar().buscar("garage con cocheras", { tipo: "ejercicio" });

    const conMaterial = armarSystemPrompt(soloEjercicios);

    expect(conMaterial).toContain("## Ejercicios de la cátedra");
    expect(conMaterial).not.toContain("## Modelos de la cátedra");
  });
});

describe("armarSystemPrompt — ejercicios nuevos", () => {
  const prompt = armarSystemPrompt();

  it("pide redactarlos como la Guía Anexa y los parciales, terminando en «Se pide:»", () => {
    expect(prompt).toContain("redactado como la Guía Anexa y los parciales");
    expect(prompt).toContain("Se pide:");
    expect(prompt).toContain("Complejidad de parcial");
  });

  it("prohíbe decir la metodología en el enunciado: la descubre el alumno", () => {
    expect(prompt).toContain("# La metodología la descubre el alumno");
    expect(prompt).toContain("nunca** digas cuál es ni la insinúes");
    expect(prompt).toContain("Qué no va nunca en el enunciado:");
  });

  it("los modelos se usan para explicar y nunca se dan como ejercicio", () => {
    expect(prompt).toContain("Usalos para **explicar**");
    expect(prompt).toContain("**Nunca** los des como ejercicio para practicar");
  });

  it("la presentación del tutor no nombra la metodología", () => {
    const primeraLinea = prompt.split("\n")[0];

    expect(primeraLinea).not.toMatch(/evento a evento|EaE/i);
  });
});
