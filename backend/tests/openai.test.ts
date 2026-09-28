import { describe, expect, it } from "vitest";
import { MODELO_OPENAI, URL_API_OPENAI, obtenerClienteOpenAI } from "@/backend/lib/openai";

// Sin mocks: se usa el cliente real. Cada caso deja las variables de entorno como estaban.

/** Corre `accion` con las variables indicadas (undefined = borrada) y después restaura las originales. */
function conVariables<T>(variables: Record<string, string | undefined>, accion: () => T): T {
  const originales = Object.fromEntries(Object.keys(variables).map((nombre) => [nombre, process.env[nombre]]));
  const aplicar = (valores: Record<string, string | undefined>) => {
    for (const [nombre, valor] of Object.entries(valores)) {
      if (valor === undefined) delete process.env[nombre];
      else process.env[nombre] = valor;
    }
  };
  aplicar(variables);
  try {
    return accion();
  } finally {
    aplicar(originales);
  }
}

describe("obtenerClienteOpenAI", () => {
  // Va primero: el cliente se crea una sola vez, y sin clave no llega a crearse.
  it("sin OPENAI_API_KEY avisa qué variable falta", () => {
    conVariables({ OPENAI_API_KEY: undefined }, () => {
      expect(() => obtenerClienteOpenAI()).toThrow(/OPENAI_API_KEY/);
    });
  });

  it("siempre le habla a OpenAI, aunque exista la variable OPENAI_BASE_URL", () => {
    const cliente = conVariables(
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "sk-clave-de-prueba",
        OPENAI_BASE_URL: "https://otro-proveedor.example.com/v1",
      },
      () => obtenerClienteOpenAI()
    );

    expect(cliente.baseURL).toBe(URL_API_OPENAI);
    expect(URL_API_OPENAI).toBe("https://api.openai.com/v1");
  });

  it("usa gpt-4o-mini salvo que OPENAI_MODEL diga otro modelo", () => {
    expect(MODELO_OPENAI).toBe(process.env.OPENAI_MODEL || "gpt-4o-mini");
  });
});
