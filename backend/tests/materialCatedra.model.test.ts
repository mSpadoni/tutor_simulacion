// Cómo se lee un test de Vitest:
// - describe("tema", () => {...}): agrupa tests relacionados.
// - it("qué debería pasar", () => {...}): un test. Si alguna línea `expect` no se cumple, el test falla.
// - expect(valor).toBe(esperado): compara. Otros: toEqual (mismo contenido), toContain, toMatch (regex), toThrow...
import { describe, expect, it } from "vitest";
import { MaterialCatedra, leerFichas, type Ficha } from "@/backend/models/materialCatedra.model";

// Sin mocks: se carga el material real de backend/knowledge.
const material = MaterialCatedra.cargar();

/** ¿Es uno de los ejercicios 1 a 8 de la guía oficial (los modelos)? */
const esModeloDeLaGuia = (ficha: Ficha) =>
  ficha.fuente.includes("Trabajos Prácticos") && /^Ejercicio [1-8] /.test(ficha.titulo);

describe("MaterialCatedra.cargar", () => {
  it("lee todas las fichas del material, sin la base de conocimiento (esa va siempre entera)", () => {
    expect(material.fichas.length).toBeGreaterThan(90);
    expect(material.fichas.some((ficha) => ficha.fuente.startsWith("BASE DE CONOCIMIENTO"))).toBe(false);
  });

  it("cada archivo declara su tipo: modelos (guía 1 a 8, clases, TP 4) y ejercicios (anexa, parciales, resueltos)", () => {
    const tiposPorFuente = new Map(material.fichas.map((ficha) => [ficha.fuente, ficha.tipo]));

    expect(tiposPorFuente.get("Guía oficial de Trabajos Prácticos 2026 — modelos (ejercicios 1 a 8)")).toBe("modelo");
    expect(tiposPorFuente.get("Clases de la cátedra: sistemas de colas (2C 2026)")).toBe("modelo");
    expect(tiposPorFuente.get("Generación de variables aleatorias — TP 4 resuelto")).toBe("modelo");
    expect(tiposPorFuente.get("Guía oficial de Trabajos Prácticos 2026 — ejercicios 9 a 12")).toBe("ejercicio");
    expect(tiposPorFuente.get("Guía Anexa resuelta (ejercicios de la cátedra, 2013 y 2015)")).toBe("ejercicio");
    expect(tiposPorFuente.get("Guía Anexa 2026 (cátedra)")).toBe("ejercicio");
    expect(tiposPorFuente.get("Parciales y parcialitos anteriores")).toBe("ejercicio");
    expect(tiposPorFuente.get("Ejercicios resueltos (cátedra)")).toBe("ejercicio");
  });

  it("los ejercicios 1 a 8 de la guía oficial son modelos, y del 9 al 12 son ejercicios", () => {
    const deLaGuia = material.fichas.filter((ficha) => ficha.fuente.includes("Trabajos Prácticos"));

    expect(deLaGuia.filter(esModeloDeLaGuia).map((ficha) => ficha.tipo)).toEqual(Array(8).fill("modelo"));
    expect(deLaGuia.filter((ficha) => !esModeloDeLaGuia(ficha)).map((ficha) => ficha.titulo)).toEqual([
      expect.stringMatching(/^Ejercicio 9 /),
      expect.stringMatching(/^Ejercicio 10 /),
      expect.stringMatching(/^Ejercicio 11 /),
      expect.stringMatching(/^Ejercicio 12 /),
    ]);
  });

  it("un archivo sin la línea «> tipo:» no se carga (falla con un mensaje claro)", () => {
    expect(() => leerFichas("sin-tipo.md", "# Algo\n\n## Categoría\n\n### Ficha\n\nTexto")).toThrow(
      /sin-tipo\.md.*> tipo:/
    );
  });

  it("ni las fuentes ni las categorías nombran la metodología (el modelo podría repetirla en un enunciado)", () => {
    for (const ficha of material.fichas) {
      expect(`${ficha.fuente} ${ficha.categoria}`, ficha.id).not.toMatch(/\bEaE\b|evento a evento/i);
    }
  });

  it("cada ficha tiene fuente, categoría, título y contenido", () => {
    for (const ficha of material.fichas) {
      expect(ficha.fuente, ficha.id).toBeTruthy();
      expect(ficha.categoria, ficha.id).toBeTruthy();
      expect(ficha.titulo, ficha.id).toBeTruthy();
      expect(ficha.contenido.length, ficha.id).toBeGreaterThan(50);
    }
  });

  it("incluye los ejercicios 1 a 12 de la guía de TP 2026 y los de la Guía Anexa sin Δt", () => {
    const deFuente = (texto: string) => material.fichas.filter((ficha) => ficha.fuente.includes(texto));
    expect(deFuente("Trabajos Prácticos 2026")).toHaveLength(12); // del 13 en adelante, todavía no
    expect(deFuente("Guía Anexa resuelta")).toHaveLength(41); // 58 menos los 17 de Δt
    expect(deFuente("Guía Anexa 2026")).toHaveLength(8); // solo los que no estaban en la resuelta
  });

  it("no carga lo pendiente (Δt y guía oficial 13 en adelante)", () => {
    expect(material.fichas.some((ficha) => ficha.tipo === "pendiente")).toBe(false);
    expect(material.fichas.some((ficha) => ficha.categoria.includes("Δt"))).toBe(false);
    expect(material.fichas.some((ficha) => /^Ejercicio (1[3-9]|2\d) /.test(ficha.titulo))).toBe(false);
  });
});

describe("MaterialCatedra.buscar por tipo", () => {
  it("una duda de tiempo comprometido trae los modelos de la guía oficial", () => {
    const modelos = material.buscar("¿cómo calculo el PTO en un ejercicio de tiempo comprometido?", { tipo: "modelo" });

    expect(modelos.length).toBeGreaterThan(0);
    expect(modelos.every((ficha) => ficha.tipo === "modelo")).toBe(true);
    expect(modelos.some(esModeloDeLaGuia)).toBe(true);
  });

  it("buscando ejercicios nunca aparecen los modelos de la guía (ni aunque el alumno los nombre)", () => {
    const consultas = [
      "dame un ejercicio de tiempo comprometido",
      "quiero practicar colas con N puestos en paralelo",
      "haceme un ejercicio como el ejercicio 3 de la guía",
    ];
    for (const consulta of consultas) {
      const ejercicios = material.buscar(consulta, { tipo: "ejercicio" });
      expect(ejercicios.length, consulta).toBeGreaterThan(0);
      expect(
        ejercicios.every((ficha) => ficha.tipo === "ejercicio"),
        consulta
      ).toBe(true);
      expect(ejercicios.some(esModeloDeLaGuia), consulta).toBe(false);
    }
  });

  it("con tipo, «el ejercicio N de la guía» solo se trae si es de ese tipo", () => {
    expect(material.buscar("el ejercicio 6 de la guía", { tipo: "modelo" })[0].titulo).toMatch(/^Ejercicio 6 /);
    expect(material.buscar("el ejercicio 12 de la guía", { tipo: "ejercicio" })[0].titulo).toMatch(/^Ejercicio 12 /);
  });
});

describe("MaterialCatedra.buscarPorNombre", () => {
  const titulos = (texto: string) => material.buscarPorNombre(texto).map((ficha) => ficha.titulo);

  it("encuentra por título aunque venga dentro de una frase, sin importar tildes ni mayúsculas", () => {
    expect(titulos("resolveme CLINICA de la anexa")).toContain("Clínica");
    expect(titulos("Garage")).toEqual(["Garage"]);
  });

  it("encuentra el ejercicio N de la guía, sea modelo o ejercicio", () => {
    expect(titulos("el ejercicio 3 de la guía")).toEqual([expect.stringMatching(/^Ejercicio 3 /)]);
    expect(titulos("ejercicio nro 11 del tp")).toEqual([expect.stringMatching(/^Ejercicio 11 /)]);
  });

  it("si no hay título que coincida, busca por descripción entre los ejercicios (hasta 2)", () => {
    const fichas = material.buscarPorNombre("boletería con dos colas y prioridad para retirar entradas");

    expect(fichas.length).toBeLessThanOrEqual(2);
    expect(fichas.every((ficha) => ficha.tipo === "ejercicio")).toBe(true);
    expect(fichas.map((ficha) => ficha.titulo)).toContain("Teatro Barrial");
  });

  it("sin texto útil no devuelve nada", () => {
    expect(material.buscarPorNombre("  ¿? ")).toEqual([]);
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
