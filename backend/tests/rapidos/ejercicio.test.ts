import { ANALISIS_DE_PRUEBA } from "../helpers/analisisDePrueba";
import { describe, expect, it } from "vitest";
import {
  LARGO_MINIMO_DE_PARCIAL,
  problemasDelAnalisisDelEjercicio,
  problemasDelEjercicio,
  type EjercicioARevisar,
} from "@/backend/models/dominio/ejercicio";

// Las reglas de la cátedra para un ejercicio nuevo que se pueden comprobar sin interpretar el sistema
// (sección 8 de la base de conocimiento). Lógica pura.

/** Un párrafo más del sistema, para que el enunciado tenga el largo de uno de la anexa. */
const RESTO_DEL_SISTEMA =
  " Cada máquina tiene su propia fila de pedidos y el pedido que llega se ubica en la fila con menos pedidos " +
  "esperando; si hay empate, elige la de menor número. Los clientes que al llegar encuentran hasta 3 pedidos en esa " +
  "fila los dejan; si encuentran entre 4 y 6, el 40% se lleva la ropa a otro lavadero, y si encuentran más de 6 se " +
  "la lleva el 80%. El dueño quiere saber cuántas máquinas le conviene tener: una máquina ociosa le cuesta el alquiler " +
  "del día y cada cliente que se va es una venta perdida, así que para decidirlo se estudiará el porcentaje de tiempo " +
  "ocioso de cada máquina, el promedio de espera de los pedidos en la fila y el porcentaje de clientes que se van.";

const BIEN: EjercicioARevisar = {
  enunciado:
    "Un lavadero tiene N máquinas. Los pedidos llegan con un intervalo (IA) que responde a una f.d.p. uniforme entre " +
    "5 y 15 minutos, y el lavado (TL) responde a una f.d.p. lineal entre 20 y 40 minutos, donde f(40) = 2·f(20). " +
    "Se desea determinar la cantidad N de máquinas." +
    RESTO_DEL_SISTEMA,
  datosAleatorios: [
    { sigla: "IA", fdp: "uniforme entre 5 y 15 minutos" },
    { sigla: "TL", fdp: "lineal entre 20 y 40 minutos, donde f(40) = 2·f(20)" },
  ],
};

describe("problemasDelEjercicio", () => {
  it("un enunciado que cumple las reglas no tiene problemas", () => {
    expect(problemasDelEjercicio(BIEN)).toEqual([]);
  });

  it("un enunciado corto (de clase, no de parcial) se marca", () => {
    const corto = { ...BIEN, enunciado: BIEN.enunciado.replace(RESTO_DEL_SISTEMA, "") };

    expect(corto.enunciado.length).toBeLessThan(LARGO_MINIMO_DE_PARCIAL);
    expect(problemasDelEjercicio(corto)).toEqual([expect.stringContaining("Es un ejercicio de clase, no de parcial")]);
  });

  it("una f.d.p. lineal sin la relación que define la recta no se puede resolver", () => {
    const fdp = "lineal entre 10 y 30 minutos";
    const ejercicio = {
      enunciado: BIEN.enunciado.replace("lineal entre 20 y 40 minutos, donde f(40) = 2·f(20)", fdp),
      datosAleatorios: [BIEN.datosAleatorios[0], { sigla: "TL", fdp }],
    };

    expect(problemasDelEjercicio(ejercicio)).toEqual([expect.stringContaining("TL es lineal pero no dice qué recta")]);
  });

  it("una exponencial sin media, tampoco", () => {
    const fdp = "exponencial";
    const ejercicio = {
      enunciado: BIEN.enunciado.replace("uniforme entre 5 y 15 minutos", fdp),
      datosAleatorios: [{ sigla: "IA", fdp }, BIEN.datosAleatorios[1]],
    };

    expect(problemasDelEjercicio(ejercicio)).toEqual([
      expect.stringContaining("IA es exponencial pero no dice su media"),
    ]);
  });

  it("se revisa lo que dice el enunciado, no cómo lo copió el modelo en el dato (LaTeX, otras palabras)", () => {
    // Un caso real: el modelo escribió «$λ = 1/3$» en el enunciado y «λ = 1/3» en el dato.
    const ejercicio = {
      enunciado: BIEN.enunciado.replace("uniforme entre 5 y 15 minutos", "exponencial con $λ = 1/3$ minutos"),
      datosAleatorios: [{ sigla: "IA", fdp: "exponencial con λ = 1/3 minutos" }, BIEN.datosAleatorios[1]],
    };

    expect(problemasDelEjercicio(ejercicio)).toEqual([]);
  });

  it("lo que el enunciado dice de un dato no se mezcla con el dato siguiente de la misma oración", () => {
    // La recta de TL no le sirve a IA: cada dato se revisa desde su sigla hasta el próximo.
    const ejercicio = {
      ...BIEN,
      enunciado: BIEN.enunciado.replace("uniforme entre 5 y 15 minutos", "lineal entre 5 y 15 minutos"),
    };

    expect(problemasDelEjercicio(ejercicio)).toEqual([expect.stringContaining("IA es lineal pero no dice qué recta")]);
  });

  it("cada dato va con su sigla entre paréntesis", () => {
    const ejercicio = { ...BIEN, enunciado: BIEN.enunciado.replace("(IA)", "") };

    expect(problemasDelEjercicio(ejercicio)).toEqual([
      expect.stringContaining("El dato IA no aparece en el enunciado"),
    ]);
  });

  it("no puede nombrar la metodología ni variables de la resolución", () => {
    for (const revela of ["Se simula evento a evento.", "Cuando NS supera 4…", "Se usa la TEF."]) {
      const ejercicio = { ...BIEN, enunciado: `${BIEN.enunciado} ${revela}` };

      expect(problemasDelEjercicio(ejercicio), revela).toEqual([expect.stringContaining("no puede nombrar")]);
    }
  });

  it("tiene que decir qué se busca decidir, y tener al menos un dato aleatorio", () => {
    const ejercicio = {
      // Sin la decisión: ni "se desea determinar" ni "le conviene" ni "para decidirlo".
      enunciado: BIEN.enunciado
        .replace("Se desea determinar la cantidad N de máquinas.", "")
        .replace("quiere saber cuántas máquinas le conviene tener", "tiene varias máquinas")
        .replace("así que para decidirlo se estudiará", "y se estudiará"),
      datosAleatorios: [],
    };

    const problemas = problemasDelEjercicio(ejercicio);
    expect(problemas).toContainEqual(expect.stringContaining("no dice qué se busca decidir"));
    expect(problemas).toContainEqual(expect.stringContaining("no tiene datos aleatorios"));
  });
});

describe("problemasDelAnalisisDelEjercicio (el análisis que el modelo arma de su propio ejercicio)", () => {
  const datosAleatorios = [
    { sigla: "IA", fdp: "uniforme entre 5 y 15 minutos" },
    { sigla: "TA", fdp: "lineal entre 10 y 30 minutos, donde f(30) = 2·f(10)" },
  ];
  const seDecide = "la cantidad N de puestos";

  it("si el análisis cumple las reglas y coincide con el enunciado, no hay problemas", () => {
    expect(problemasDelAnalisisDelEjercicio({ datosAleatorios, seDecide, analisis: ANALISIS_DE_PRUEBA })).toEqual([]);
  });

  it("si la T.E.I. del propio ejercicio no cumple las reglas, el ejercicio está mal planteado", () => {
    const analisis = structuredClone(ANALISIS_DE_PRUEBA);
    analisis.tei.push({ evento: "ABRIR PUESTO", efnc: null, efc: [] });

    expect(problemasDelAnalisisDelEjercicio({ datosAleatorios, seDecide, analisis })).toContainEqual(
      expect.stringMatching(/^En el análisis de tu ejercicio: La fila «ABRIR PUESTO»/)
    );
  });

  it("cada dato del enunciado tiene que estar entre los datos del análisis", () => {
    const conOtroDato = [...datosAleatorios, { sigla: "TR", fdp: "exponencial de media 30 minutos" }];

    expect(
      problemasDelAnalisisDelEjercicio({ datosAleatorios: conOtroDato, seDecide, analisis: ANALISIS_DE_PRUEBA })
    ).toEqual(["El dato TR del enunciado no está entre los datos del análisis de tu ejercicio."]);
  });

  it("lo que se decide tiene que ser una variable de control", () => {
    const analisis = structuredClone(ANALISIS_DE_PRUEBA);
    analisis.variables.control = [];

    expect(problemasDelAnalisisDelEjercicio({ datosAleatorios, seDecide, analisis })).toEqual([
      expect.stringContaining("no tiene variable de control"),
    ]);
  });
});
