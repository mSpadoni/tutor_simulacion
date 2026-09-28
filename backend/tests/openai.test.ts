import { describe, expect, it } from "vitest";
import {
  MODELO_OPENAI,
  URL_API_OPENAI_POR_DEFECTO,
  crearClienteOpenAI,
  obtenerClienteOpenAI,
} from "@/backend/lib/openai";

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

const clave = process.env.OPENAI_API_KEY || "sk-clave-de-prueba";

describe("crearClienteOpenAI", () => {
  it("sin OPENAI_API_KEY avisa qué variable falta", () => {
    conVariables({ OPENAI_API_KEY: undefined }, () => {
      expect(() => crearClienteOpenAI()).toThrow(/OPENAI_API_KEY/);
    });
  });

  it("sin OPENAI_BASE_URL le habla a la API de OpenAI", () => {
    const cliente = conVariables({ OPENAI_API_KEY: clave, OPENAI_BASE_URL: undefined }, crearClienteOpenAI);

    expect(cliente.baseURL).toBe("https://api.openai.com/v1");
    expect(URL_API_OPENAI_POR_DEFECTO).toBe("https://api.openai.com/v1");
  });

  it("con OPENAI_BASE_URL vacía también usa la de OpenAI", () => {
    const cliente = conVariables({ OPENAI_API_KEY: clave, OPENAI_BASE_URL: "" }, crearClienteOpenAI);

    expect(cliente.baseURL).toBe(URL_API_OPENAI_POR_DEFECTO);
  });

  it("si OPENAI_BASE_URL tiene otra URL, usa esa", () => {
    const cliente = conVariables(
      { OPENAI_API_KEY: clave, OPENAI_BASE_URL: "https://otra-url.example.com/v1" },
      crearClienteOpenAI
    );

    expect(cliente.baseURL).toBe("https://otra-url.example.com/v1");
  });
});

describe("obtenerClienteOpenAI", () => {
  it("crea el cliente una sola vez y después devuelve el mismo", () => {
    const [primero, segundo] = conVariables({ OPENAI_API_KEY: clave }, () => [
      obtenerClienteOpenAI(),
      obtenerClienteOpenAI(),
    ]);

    expect(segundo).toBe(primero);
  });

  it("usa gpt-4o-mini salvo que OPENAI_MODEL diga otro modelo", () => {
    expect(MODELO_OPENAI).toBe(process.env.OPENAI_MODEL || "gpt-4o-mini");
  });
});
