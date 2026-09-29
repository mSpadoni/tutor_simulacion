import { describe, expect, it } from "vitest";
import { BuscadorBM25, normalizar, soloLetras } from "@/backend/models/dominio/buscadorBM25";
import { leerFichas } from "@/backend/models/dominio/ficha";

// Sin mocks: fichas leídas con el mismo lector que usa el material real.

const fichas = leerFichas(
  "prueba.md",
  [
    "# Material de prueba",
    "> tipo: ejercicio",
    "## Colas",
    "### Clínica",
    "Una clínica con dos consultorios atiende pacientes que hacen cola.",
    "### Banco",
    "Un banco con cajeros y una cola única de clientes.",
    "## Stock",
    "### Almacén",
    "Un almacén repone stock cuando baja del punto de pedido.",
  ].join("\n")
);

describe("normalizar y soloLetras", () => {
  it("pasa a minúsculas, saca tildes, signos y palabras vacías, y deja la raíz", () => {
    expect(normalizar("¿Cómo armo las Colas?")).toEqual(["armo", "cola"]);
    expect(soloLetras("  Clínica — 2 consultorios! ")).toBe("clinica 2 consultorios");
  });

  it("«N colas», «N puestos» y «una sola cola» cuentan como una palabra: la N o el 1 no se pierden", () => {
    expect(normalizar("N puestos con N colas")).toEqual(["npuesto", "ncola"]);
    expect(normalizar("N puestos con 1 sola cola")).toEqual(["npuesto", "uncola"]);
    expect(normalizar("un puesto con una sola cola")).toEqual(["unpuesto", "uncola"]);
  });
});

describe("BuscadorBM25", () => {
  const buscador = new BuscadorBM25(fichas);

  it("ordena de la más parecida a la menos y deja afuera las que no tienen nada que ver", () => {
    const titulos = buscador.buscar("pacientes en la clínica").map(({ ficha }) => ficha.titulo);

    expect(titulos).toEqual(["Clínica"]);
  });

  it("el título y la categoría pesan más que el cuerpo", () => {
    const [primero] = buscador.buscar("colas");

    expect(primero.ficha.categoria).toBe("Colas");
  });

  it("respeta el filtro y no encuentra nada con una consulta vacía", () => {
    expect(buscador.buscar("cola", (ficha) => ficha.titulo !== "Clínica").map(({ ficha }) => ficha.titulo)).toEqual([
      "Banco",
    ]);
    expect(buscador.buscar("¿de la?")).toEqual([]);
  });
});
