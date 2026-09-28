import { describe, expect, it } from "vitest";
import { MODELO_OPENAI, URL_API_OPENAI_POR_DEFECTO, crearModeloOpenAI, leerConfigOpenAI } from "@/backend/lib/openai";

// Sin mocks: se usa la configuración y el proveedor reales. Cada caso deja las variables de entorno como estaban.

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

describe("leerConfigOpenAI", () => {
  it("sin OPENAI_API_KEY avisa qué variable falta", () => {
    conVariables({ OPENAI_API_KEY: undefined }, () => {
      expect(() => leerConfigOpenAI()).toThrow(/OPENAI_API_KEY/);
    });
  });

  it("sin OPENAI_BASE_URL usa la API de OpenAI", () => {
    const config = conVariables({ OPENAI_API_KEY: clave, OPENAI_BASE_URL: undefined }, leerConfigOpenAI);

    expect(config.baseURL).toBe("https://api.openai.com/v1");
    expect(URL_API_OPENAI_POR_DEFECTO).toBe("https://api.openai.com/v1");
  });

  it("con OPENAI_BASE_URL vacía también usa la de OpenAI", () => {
    const config = conVariables({ OPENAI_API_KEY: clave, OPENAI_BASE_URL: "" }, leerConfigOpenAI);

    expect(config.baseURL).toBe(URL_API_OPENAI_POR_DEFECTO);
  });

  it("si OPENAI_BASE_URL tiene otra URL, usa esa", () => {
    const config = conVariables(
      { OPENAI_API_KEY: clave, OPENAI_BASE_URL: "https://otra-url.example.com/v1" },
      leerConfigOpenAI
    );

    expect(config.baseURL).toBe("https://otra-url.example.com/v1");
  });
});

describe("crearModeloOpenAI", () => {
  it("usa gpt-4o-mini salvo que OPENAI_MODEL diga otro modelo", () => {
    expect(MODELO_OPENAI).toBe(process.env.OPENAI_MODEL || "gpt-4o-mini");
  });

  it("crea un modelo de chat de OpenAI con el modelo pedido", () => {
    const modelo = conVariables({ OPENAI_API_KEY: clave }, () => crearModeloOpenAI("gpt-4o-mini"));

    expect(typeof modelo).toBe("object");
    expect(modelo).toMatchObject({ modelId: "gpt-4o-mini", provider: expect.stringMatching(/^openai/) });
  });
});
