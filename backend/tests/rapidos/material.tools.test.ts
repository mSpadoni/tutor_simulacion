import { describe, expect, it } from "vitest";
import { enunciadoDe, resolucionDe } from "@/backend/models/dominio/ficha";
import { MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { buscarEjercicio, crearToolBuscarEjercicio } from "@/backend/tools/buscarEjercicio.tools";
import { consultarModelos, crearToolConsultarModelos } from "@/backend/tools/consultarModelos.tools";
import {
  crearToolInspiracionParaEjercicio,
  inspiracionParaEjercicio,
} from "@/backend/tools/inspiracionParaEjercicio.tools";

// Sin mocks: las tools trabajan sobre el material real de backend/knowledge.
const material = MaterialCatedra.cargar();
const porTitulo = new Map(material.fichas.map((ficha) => [ficha.titulo, ficha]));

/** Marcas de una resolución de la cátedra: si aparecen, la tool filtró una resolución. */
const RESOLUCION = /^(Metodolog[ií]a:|- \*\*Datos:\*\*)|\| *(TEF|Evento) *\|/m;

describe("enunciadoDe", () => {
  // Solo ejercicios: los modelos (clases, TP 4) son teoría y se usan completos, con su resolución.
  const resueltas = material.fichas.filter(
    (ficha) => ficha.tipo === "ejercicio" && /^(Metodolog[ií]a:|- \*\*Datos:\*\*)/m.test(ficha.contenido)
  );

  it("hay fichas con resolución de la cátedra para probar (anexa resuelta y ejercicios resueltos)", () => {
    expect(resueltas.length).toBeGreaterThan(0);
  });

  it("de cada una deja solo el enunciado: sin resolución y sin quedar vacío", () => {
    for (const ficha of resueltas) {
      const enunciado = enunciadoDe(ficha);
      expect(enunciado.length, ficha.titulo).toBeGreaterThan(80);
      expect(enunciado, ficha.titulo).not.toMatch(RESOLUCION);
      expect(ficha.contenido.startsWith(enunciado), ficha.titulo).toBe(true);
    }
  });

  it("resolucionDe devuelve el resto: enunciado + resolución arman la ficha completa", () => {
    for (const ficha of resueltas) {
      const resolucion = resolucionDe(ficha);
      expect(resolucion, ficha.titulo).toMatch(/^(Metodolog[ií]a:|- \*\*Datos:\*\*)/);
      expect(ficha.contenido.trim().endsWith(resolucion), ficha.titulo).toBe(true);
    }
  });

  it("si la ficha no tiene resolución, el enunciado es la ficha entera y la resolución queda vacía", () => {
    const garage = porTitulo.get("Garage")!;
    expect(enunciadoDe(garage)).toBe(garage.contenido.trim());
    expect(resolucionDe(garage)).toBe("");
  });
});

describe("consultarModelos", () => {
  it("encuentra el modelo del tipo de sistema aunque se lo pida con la N o con el 1", () => {
    expect(consultarModelos(material, "N puestos N colas").fichas[0]).toMatch(/^N puestos con N colas/);
    expect(consultarModelos(material, "N puestos con una sola cola").fichas[0]).toMatch(/^N puestos con 1 sola cola/);
    expect(consultarModelos(material, "tiempo comprometido").fichas[0]).toMatch(/^Tiempo comprometido/);
  });

  it("el modelo de tiempo comprometido tiene su T.E.I.: un único evento, la LLEGADA", () => {
    const { texto } = consultarModelos(material, "tiempo comprometido remisería");

    expect(texto).toContain("| LLEGADA | LLEGADA | --- | --- |");
    expect(texto).toContain("T.E.F. = TPLL");
  });

  it("solo devuelve modelos (teoría), nunca ejercicios", () => {
    const { fichas } = consultarModelos(material, "cómo calculo el PTO en tiempo comprometido");

    expect(fichas.length).toBeGreaterThan(0);
    expect(fichas.every((titulo) => porTitulo.get(titulo)?.tipo === "modelo")).toBe(true);
  });

  it("sin modelos del tema lo dice y deriva a la base de conocimiento", () => {
    expect(consultarModelos(material, "xyzzy qwerty").texto).toContain("No hay modelos");
  });
});

describe("buscarEjercicio", () => {
  it("encuentra un ejercicio de la anexa por su nombre, con el enunciado y la resolución marcada como referencia", () => {
    const { texto, fichas } = buscarEjercicio(material, "resolveme Clínica de la anexa");
    const iEnunciado = texto.indexOf("dos consultorios");
    const iAviso = texto.indexOf("#### Resolución de la cátedra (REFERENCIA: puede tener errores");
    const iResolucion = texto.indexOf("- **Datos:**");

    expect(fichas).toContain("Clínica");
    expect(iEnunciado).toBeGreaterThan(0);
    // El aviso va antes de la resolución: el modelo lo lee antes de leerla.
    expect(iAviso).toBeGreaterThan(iEnunciado);
    expect(iResolucion).toBeGreaterThan(iAviso);
    expect(texto).toContain("contrastala con la base de conocimiento y los modelos");
  });

  it("junto con el ejercicio trae la teoría: modelos de la cátedra, después del enunciado", () => {
    const { texto, fichas } = buscarEjercicio(material, "Clínica");
    const iEnunciado = texto.indexOf("dos consultorios");
    const iTeoria = texto.indexOf("## Teoría de la cátedra para este tipo de sistema");
    const modelos = texto.slice(iTeoria);
    const titulosDeModelos = [...modelos.matchAll(/^### (.+)$/gm)].map((m) => m[1]);

    expect(iTeoria).toBeGreaterThan(iEnunciado);
    expect(titulosDeModelos.length).toBeGreaterThan(0);
    expect(titulosDeModelos.every((titulo) => porTitulo.get(titulo)?.tipo === "modelo")).toBe(true);
    // Los títulos que devuelve son los de los ejercicios encontrados, no los de la teoría agregada.
    expect(fichas.every((titulo) => porTitulo.get(titulo)?.tipo === "ejercicio")).toBe(true);
  });

  it("si el ejercicio no tiene resolución publicada, lo aclara", () => {
    expect(buscarEjercicio(material, "Garage").texto).toContain("La cátedra no publicó resolución");
  });

  it("encuentra el ejercicio N de la guía oficial", () => {
    expect(buscarEjercicio(material, "el ejercicio 10 de la guía").fichas).toEqual([
      expect.stringMatching(/^Ejercicio 10 /),
    ]);
  });

  it("si el alumno no lo nombra, lo encuentra por la descripción del sistema", () => {
    const { fichas } = buscarEjercicio(material, "cocheras que quedan comprometidas un 15% después de retirar el auto");

    expect(fichas).toContain("Garage");
  });

  it("si no encuentra nada, pide el enunciado al alumno", () => {
    const { texto, fichas } = buscarEjercicio(material, "zzz");

    expect(fichas).toEqual([]);
    expect(texto).toContain("Pedile al alumno el enunciado");
  });
});

describe("inspiracionParaEjercicio", () => {
  it("solo devuelve ejercicios (nunca modelos), sin resoluciones, y pide crear uno desde cero", () => {
    const { texto, fichas } = inspiracionParaEjercicio(material, "colas con arrepentimiento y N puestos");

    expect(fichas.length).toBeGreaterThan(0);
    expect(fichas.every((titulo) => porTitulo.get(titulo)?.tipo === "ejercicio")).toBe(true);
    expect(texto).not.toMatch(RESOLUCION);
    expect(texto).toContain("Creá uno nuevo desde cero");
  });

  it("devuelve hasta 3 y prohíbe explícitamente sus dominios y títulos", () => {
    const { texto, fichas } = inspiracionParaEjercicio(material, "stock con reposición");

    expect(fichas.length).toBeLessThanOrEqual(3);
    expect(texto).toContain("No uses el dominio ni el título de ninguno de estos:");
    for (const titulo of fichas) expect(texto).toContain(`«${titulo}»`);
  });
});

describe("las tres tools del material", () => {
  const tools = {
    ...crearToolConsultarModelos(material),
    ...crearToolBuscarEjercicio(material),
    ...crearToolInspiracionParaEjercicio(material),
  };
  const opciones = { toolCallId: "prueba", messages: [], context: {} };

  it("expone las tres tools con descripción", () => {
    expect(Object.keys(tools).sort()).toEqual(["buscar_ejercicio", "consultar_modelos", "inspiracion_para_ejercicio"]);
    for (const herramienta of Object.values(tools)) expect(herramienta.description?.length).toBeGreaterThan(50);
  });

  it("cada tool ejecuta la función que corresponde", async () => {
    expect(await tools.buscar_ejercicio.execute!({ nombreODescripcion: "Clínica" }, opciones)).toContain("Clínica");
    expect(await tools.consultar_modelos.execute!({ tema: "tiempo comprometido" }, opciones)).toContain(
      "Modelos de la cátedra"
    );
    expect(await tools.inspiracion_para_ejercicio.execute!({ tema: "stock" }, opciones)).toContain("inspiración");
  });
});
