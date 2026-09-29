import { ANALISIS_DE_PRUEBA } from "../helpers/analisisDePrueba";
import { describe, expect, it } from "vitest";
import {
  LARGO_MINIMO_DE_PARCIAL,
  problemasDelAnalisisDelEjercicio,
  problemasDelEjercicio,
  type DatoAleatorio,
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

const DATOS: DatoAleatorio[] = [
  { sigla: "IA", forma: "fdp" },
  { sigla: "TL", forma: "probabilidades" },
];

const BIEN: EjercicioARevisar = {
  enunciado:
    "Un lavadero tiene N máquinas. Los pedidos llegan con un intervalo que responde a una f.d.p. uniforme entre 5 y " +
    "15 minutos. El lavado del 70% de los pedidos dura 40 minutos y el del resto, 25 minutos. " +
    "Se desea determinar la cantidad N de máquinas." +
    RESTO_DEL_SISTEMA,
  datosAleatorios: DATOS,
};

describe("problemasDelEjercicio", () => {
  it("un enunciado que cumple las reglas no tiene problemas", () => {
    expect(problemasDelEjercicio(BIEN)).toEqual([]);
  });

  it("no nombra la variable de un dato: el alumno la deduce", () => {
    const ejercicio = { ...BIEN, enunciado: BIEN.enunciado.replace("con un intervalo", "con un intervalo (IA)") };

    expect(problemasDelEjercicio(ejercicio)).toEqual([expect.stringContaining("El enunciado nombra la variable IA")]);
  });

  it("una sigla que aparece dentro de otra palabra no cuenta como nombrarla", () => {
    const ejercicio = { ...BIEN, datosAleatorios: [...DATOS, { sigla: "TA", forma: "fdp_conocida" as const }] };
    // "TA" no está como palabra ("DATA", "tarda" no cuentan); falta "f.d.p. conocida".
    expect(problemasDelEjercicio(ejercicio)).toEqual([expect.stringContaining("El dato TA tiene que aparecer")]);
  });

  it("cada dato aparece como en la cátedra, según su forma", () => {
    const casos: [DatoAleatorio["forma"], string, string][] = [
      ["fdp", "responde a una f.d.p. lineal entre 10 y 30 minutos", "f.d.p."],
      ["fdp_conocida", "responde a una f.d.p. conocida", "f.d.p. conocida"],
      ["derivado", "el tiempo de los camiones grandes es el doble que el de los chicos", "doble"],
      ["probabilidades", "el 60% de los clientes tarda 40 minutos y el resto 20", "60%"],
    ];
    for (const [forma, frase] of casos) {
      const conFrase = { enunciado: `${BIEN.enunciado} Además, ${frase}.`, datosAleatorios: [{ sigla: "X", forma }] };
      expect(problemasDelEjercicio(conFrase), forma).toEqual([]);
    }

    const sinFdpConocida = {
      enunciado: BIEN.enunciado,
      datosAleatorios: [{ sigla: "X", forma: "fdp_conocida" as const }],
    };
    expect(problemasDelEjercicio(sinFdpConocida)).toEqual([
      expect.stringContaining("«responde a una f.d.p. conocida»"),
    ]);
    const sinDerivado = { enunciado: BIEN.enunciado, datosAleatorios: [{ sigla: "X", forma: "derivado" as const }] };
    expect(problemasDelEjercicio(sinDerivado)).toEqual([expect.stringContaining("el doble")]);
  });

  it("un enunciado corto (de clase, no de parcial) se marca", () => {
    const corto = { ...BIEN, enunciado: BIEN.enunciado.replace(RESTO_DEL_SISTEMA, "") };

    expect(corto.enunciado.length).toBeLessThan(LARGO_MINIMO_DE_PARCIAL);
    expect(problemasDelEjercicio(corto)).toEqual([expect.stringContaining("Es un ejercicio de clase, no de parcial")]);
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
  const datosAleatorios: DatoAleatorio[] = [
    { sigla: "IA", forma: "fdp" },
    { sigla: "TA", forma: "fdp" },
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
    const conOtroDato: DatoAleatorio[] = [...datosAleatorios, { sigla: "TR", forma: "fdp" }];

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
