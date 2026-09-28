import { describe, expect, it } from "vitest";
import { leerConfigSupabase } from "@/backend/lib/supabase/config";

// Sin mocks: se cambian las variables de entorno reales y se restauran al terminar cada caso.

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

describe("leerConfigSupabase", () => {
  it("lee SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY", () => {
    const config = conVariables(
      { SUPABASE_URL: "https://proyecto.supabase.co", SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba" },
      leerConfigSupabase
    );

    expect(config).toEqual({ url: "https://proyecto.supabase.co", key: "sb_publishable_prueba" });
  });

  it("ya no acepta los nombres con NEXT_PUBLIC_ y avisa qué variables faltan", () => {
    conVariables(
      {
        SUPABASE_URL: undefined,
        SUPABASE_PUBLISHABLE_KEY: undefined,
        NEXT_PUBLIC_SUPABASE_URL: "https://proyecto.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_prueba",
      },
      () => expect(() => leerConfigSupabase()).toThrow(/SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY/)
    );
  });

  it("si falta solo la clave, también avisa", () => {
    conVariables({ SUPABASE_URL: "https://proyecto.supabase.co", SUPABASE_PUBLISHABLE_KEY: "" }, () =>
      expect(() => leerConfigSupabase()).toThrow(/Faltan variables de entorno de Supabase/)
    );
  });
});
