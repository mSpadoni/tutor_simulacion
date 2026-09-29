import { describe, expect, it } from "vitest";
import { problemasDelEjercicio, type EjercicioARevisar } from "@/backend/models/dominio/ejercicio";

// Las reglas de la cátedra para un ejercicio nuevo que se pueden comprobar sin interpretar el sistema
// (sección 8 de la base de conocimiento). Lógica pura.

const BIEN: EjercicioARevisar = {
  enunciado:
    "Un lavadero tiene N máquinas. Los pedidos llegan con un intervalo (IA) que responde a una f.d.p. uniforme entre " +
    "5 y 15 minutos, y el lavado (TL) responde a una f.d.p. lineal entre 20 y 40 minutos, donde f(40) = 2·f(20). " +
    "Se desea determinar la cantidad N de máquinas.",
  datosAleatorios: [
    { sigla: "IA", fdp: "uniforme entre 5 y 15 minutos" },
    { sigla: "TL", fdp: "lineal entre 20 y 40 minutos, donde f(40) = 2·f(20)" },
  ],
};

describe("problemasDelEjercicio", () => {
  it("un enunciado que cumple las reglas no tiene problemas", () => {
    expect(problemasDelEjercicio(BIEN)).toEqual([]);
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
      enunciado: BIEN.enunciado.replace("Se desea determinar la cantidad N de máquinas.", ""),
      datosAleatorios: [],
    };

    const problemas = problemasDelEjercicio(ejercicio);
    expect(problemas).toContainEqual(expect.stringContaining("no dice qué se busca decidir"));
    expect(problemas).toContainEqual(expect.stringContaining("no tiene datos aleatorios"));
  });
});
