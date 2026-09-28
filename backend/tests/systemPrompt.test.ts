// Cómo se lee un test de Vitest:
// - describe("tema", () => {...}): agrupa tests relacionados.
// - it("qué debería pasar", () => {...}): un test. Si alguna línea `expect` no se cumple, el test falla.
// - expect(valor).toBe(esperado): compara. Otros: toEqual (mismo contenido), toContain, toMatch (regex), toThrow...
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { armarSystemPrompt } from "@/backend/lib/prompts/systemPrompt";

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

  it("define también el modo de resolver un ejercicio", () => {
    expect(prompt).toContain("Resolver un ejercicio");
  });

  it("no trae material fijo: el material lo pide el modelo con las tools", () => {
    expect(prompt).not.toContain("MATERIAL DE LA CÁTEDRA RELACIONADO");
    expect(armarSystemPrompt()).toBe(prompt);
  });
});

describe("armarSystemPrompt — herramientas", () => {
  const prompt = armarSystemPrompt();

  it("arranca con la regla de consultar los modelos (al principio pesa más que en el medio del prompt)", () => {
    const inicio = prompt.slice(0, 800);

    expect(inicio).toContain("**Regla más importante:**");
    expect(inicio).toContain("**consultá los modelos de la cátedra con la herramienta consultar_modelos**");
  });

  it("presenta las tres tools y deja que el modelo decida cuáles usar", () => {
    expect(prompt).toContain("**consultar_modelos(tema)**");
    expect(prompt).toContain("**buscar_ejercicio(nombre o descripción)**");
    expect(prompt).toContain("**inspiracion_para_ejercicio(tema)**");
    expect(prompt).toContain("Decidí vos cuáles usar según lo que pide el alumno");
  });

  it("las consultas de cómo se hace algo van a los modelos; una definición de la base se puede responder directo", () => {
    expect(prompt).toContain("**Consulta teórica sobre cómo se hace algo**");
    expect(prompt).toContain(
      "llamá **siempre** a consultar_modelos antes de responder, **aunque creas que ya lo sabés**"
    );
    expect(prompt).toContain("Solo una definición que está textual en la base de conocimiento");
  });

  it("para corregir o resolver, sugiere combinar los modelos con el enunciado", () => {
    expect(prompt).toContain("**Corrección o resolución** → consultar_modelos **y** buscar_ejercicio");
  });

  it("la resolución de la cátedra es una referencia a contrastar con la teoría, no la verdad", () => {
    expect(prompt).toContain("**una referencia más, no la verdad**");
    expect(prompt).toContain("**contrastala siempre con la base de conocimiento y los modelos**");
    expect(prompt).toContain("Nunca marques un error del alumno solo porque no coincide con esa resolución");
  });

  it("un ejercicio nuevo se crea desde cero, no se copia de la inspiración", () => {
    expect(prompt).toContain("Creá uno **desde cero**: otro dominio, otro título, otra historia y otros datos");
    expect(prompt).toContain("Nunca devuelvas un ejercicio de la cátedra tal cual");
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
    expect(prompt).toContain("Es la **teoría**. Usala para explicar");
    expect(prompt).toContain("Los modelos nunca se dan como ejercicio para practicar");
  });

  it("la presentación del tutor no nombra la metodología", () => {
    const primeraLinea = prompt.split("\n")[0];

    expect(primeraLinea).not.toMatch(/evento a evento|EaE/i);
  });
});
