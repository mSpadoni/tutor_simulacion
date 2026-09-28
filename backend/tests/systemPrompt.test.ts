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
      expect(conMaterial).toContain(`## ${ficha.titulo}`);
      expect(conMaterial).toContain(ficha.contenido);
    }
  });
});
