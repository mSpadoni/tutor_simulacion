// Cómo se lee un test de Vitest:
// - describe("tema", () => {...}): agrupa tests relacionados.
// - it("qué debería pasar", () => {...}): un test. Si alguna línea `expect` no se cumple, el test falla.
// - expect(valor).toBe(esperado): compara. Otros: toEqual (mismo contenido), toContain, toMatch (regex), toThrow...
import { describe, expect, it } from "vitest";
import { MaterialCatedra } from "@/backend/models/materialCatedra.model";

// Sin mocks: se carga el material real de backend/knowledge.
const material = MaterialCatedra.cargar();

describe("MaterialCatedra.cargar", () => {
  it("lee todas las fichas del material, sin la base de conocimiento (esa va siempre entera)", () => {
    expect(material.fichas.length).toBeGreaterThan(90);
    expect(material.fichas.some((ficha) => ficha.fuente.startsWith("BASE DE CONOCIMIENTO"))).toBe(false);
  });

  it("cada ficha tiene fuente, categoría, título y contenido", () => {
    for (const ficha of material.fichas) {
      expect(ficha.fuente, ficha.id).toBeTruthy();
      expect(ficha.categoria, ficha.id).toBeTruthy();
      expect(ficha.titulo, ficha.id).toBeTruthy();
      expect(ficha.contenido.length, ficha.id).toBeGreaterThan(50);
    }
  });

  it("incluye los 22 ejercicios de la guía de TP 2026 y los de EaE de la Guía Anexa (sin Δt)", () => {
    const deFuente = (texto: string) => material.fichas.filter((ficha) => ficha.fuente.includes(texto));
    expect(deFuente("Trabajos Prácticos 2026")).toHaveLength(22);
    expect(deFuente("Guía Anexa")).toHaveLength(41); // 58 menos los 17 de Δt, que todavía no se vieron
  });
});

describe("MaterialCatedra.buscar", () => {
  const titulos = (consulta: string) => material.buscar(consulta).map((ficha) => ficha.titulo);

  it("si el alumno nombra el ejercicio N de la guía, ese enunciado va primero", () => {
    expect(titulos("¿Cómo resuelvo el ejercicio 5 de la guía de TP?")[0]).toMatch(/^Ejercicio 5 — /);
    expect(titulos("tengo dudas con el ejercicio nro 12 del tp")[0]).toMatch(/^Ejercicio 12 — Banco de Sangre/);
  });

  it("encuentra el ejercicio resuelto más parecido (tiempo comprometido)", () => {
    expect(titulos("Corregime: remisería con N autos, tiempo comprometido TC(i)")[0]).toMatch(/Remisería/);
  });

  it("para generación de variables aleatorias trae los ejercicios del TP 4", () => {
    const fichas = material.buscar("no entiendo el método del rechazo con una parábola");
    expect(fichas[0].fuente).toMatch(/Generación de variables aleatorias/);
    expect(fichas[0].titulo).toMatch(/Parábola/);
  });

  it("para mantenimiento trae ejercicios de esa categoría", () => {
    const fichas = material.buscar("ejercicio de mantenimiento con rotura de piezas");
    expect(fichas.length).toBeGreaterThan(0);
    expect(fichas.every((ficha) => ficha.categoria.startsWith("Mantenimiento"))).toBe(true);
  });

  it("respeta el límite de fichas y el presupuesto de tokens", () => {
    const fichas = material.buscar("dame un ejercicio tipo parcial", { limite: 5, presupuestoTokens: 2000 });

    expect(fichas.length).toBeLessThanOrEqual(5);
    expect(fichas.reduce((suma, ficha) => suma + ficha.tokensAprox, 0)).toBeLessThanOrEqual(2000);
  });

  it("no usa material de Δt (el alumno todavía no lo vio)", () => {
    expect(material.fichas.some((ficha) => ficha.categoria.includes("Δt"))).toBe(false);
  });

  it("para colas con prioridad trae la clase oficial de la cátedra", () => {
    const fichas = material.buscar("tengo dudas con colas con prioridades, la cola 1 es VIP");
    expect(fichas.map((ficha) => ficha.titulo)).toContain(
      "Colas con prioridades (2 colas, 2 puestos, la cola 1 con prioridad)"
    );
  });

  it("sin palabras útiles no trae nada", () => {
    expect(material.buscar("hola, gracias")).toEqual([]);
    expect(material.buscar("")).toEqual([]);
  });
});
