import { describe, expect, it } from "vitest";
import {
  envKroki,
  envOpenAI,
  envSupabase,
  ErrorDeConfiguracion,
  MODELO_OPENAI_POR_DEFECTO,
  URL_API_OPENAI_POR_DEFECTO,
  URL_KROKI_POR_DEFECTO,
} from "@/backend/lib/env";
import { conVariables } from "../helpers/variablesDeEntorno";

// Sin mocks: se cambian las variables de entorno reales y se restauran al terminar cada caso.

describe("envSupabase", () => {
  it("lee SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY", () => {
    const config = conVariables(
      { SUPABASE_URL: "https://proyecto.supabase.co", SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba" },
      envSupabase
    );

    expect(config).toEqual({ url: "https://proyecto.supabase.co", key: "sb_publishable_prueba" });
  });

  it("si faltan, avisa cuáles (y no acepta los nombres viejos con NEXT_PUBLIC_)", () => {
    conVariables(
      {
        SUPABASE_URL: undefined,
        SUPABASE_PUBLISHABLE_KEY: "",
        NEXT_PUBLIC_SUPABASE_URL: "https://proyecto.supabase.co",
      },
      () => {
        expect(envSupabase).toThrow(ErrorDeConfiguracion);
        expect(envSupabase).toThrow(/Falta SUPABASE_URL; Falta SUPABASE_PUBLISHABLE_KEY/);
      }
    );
  });

  it("una URL inválida se rechaza con un mensaje claro", () => {
    conVariables({ SUPABASE_URL: "proyecto.supabase.co", SUPABASE_PUBLISHABLE_KEY: "clave" }, () =>
      expect(envSupabase).toThrow(/SUPABASE_URL tiene que ser una URL/)
    );
  });
});

describe("envOpenAI", () => {
  it("la key es obligatoria", () => {
    conVariables({ OPENAI_API_KEY: "" }, () => expect(envOpenAI).toThrow(/Falta OPENAI_API_KEY/));
  });

  it("sin URL ni modelo (o vacíos) usa los de OpenAI por defecto", () => {
    const config = conVariables(
      { OPENAI_API_KEY: "sk-prueba", OPENAI_BASE_URL: "", OPENAI_MODEL: undefined },
      envOpenAI
    );

    expect(config).toEqual({
      apiKey: "sk-prueba",
      baseURL: URL_API_OPENAI_POR_DEFECTO,
      modelo: MODELO_OPENAI_POR_DEFECTO,
    });
    expect(URL_API_OPENAI_POR_DEFECTO).toBe("https://api.openai.com/v1");
    expect(MODELO_OPENAI_POR_DEFECTO).toBe("gpt-4.1");
  });

  it("si están definidos, usa la URL y el modelo configurados", () => {
    const config = conVariables(
      { OPENAI_API_KEY: "sk-prueba", OPENAI_BASE_URL: "https://otra.example.com/v1", OPENAI_MODEL: "gpt-4o" },
      envOpenAI
    );

    expect(config).toMatchObject({ baseURL: "https://otra.example.com/v1", modelo: "gpt-4o" });
  });

  it("se lee en el momento: si la variable cambia, se ve el valor nuevo", () => {
    expect(conVariables({ OPENAI_API_KEY: "sk-uno" }, envOpenAI).apiKey).toBe("sk-uno");
    expect(conVariables({ OPENAI_API_KEY: "sk-dos" }, envOpenAI).apiKey).toBe("sk-dos");
  });
});

describe("cada servicio se valida por separado", () => {
  it("si falta la key de OpenAI, Supabase sigue configurado (el login no se cae)", () => {
    conVariables(
      { OPENAI_API_KEY: undefined, SUPABASE_URL: "https://proyecto.supabase.co", SUPABASE_PUBLISHABLE_KEY: "clave" },
      () => {
        expect(envOpenAI).toThrow(ErrorDeConfiguracion);
        expect(envSupabase()).toMatchObject({ url: "https://proyecto.supabase.co" });
      }
    );
  });
});

describe("envKroki", () => {
  it("sin KROKI_URL usa el servidor público; con una, la usa sin la barra final", () => {
    expect(conVariables({ KROKI_URL: undefined }, envKroki)).toEqual({ url: URL_KROKI_POR_DEFECTO });
    expect(conVariables({ KROKI_URL: "https://kroki.miservidor.com/" }, envKroki)).toEqual({
      url: "https://kroki.miservidor.com",
    });
  });

  it("una KROKI_URL inválida se rechaza", () => {
    conVariables({ KROKI_URL: "no-es-una-url" }, () => expect(envKroki).toThrow(/KROKI_URL tiene que ser una URL/));
  });
});
