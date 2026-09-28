import { NextRequest } from "next/server";
import { describe, expect, inject, it } from "vitest";
import { middleware } from "@/middleware";
import { conVariablesAsync } from "./helpers/variablesDeEntorno";

// Sin mocks: el middleware real de Next con un request real, contra la base local de Supabase.
const { url, publishableKey } = inject("supabaseLocal");

/** NextResponse.next() marca la respuesta con este header: "seguí con el request normalmente". */
const dejaPasar = (respuesta: Response) => respuesta.headers.get("x-middleware-next") === "1";

describe("middleware", () => {
  it("con Supabase configurado, refresca la sesión y deja pasar el request", async () => {
    const respuesta = await conVariablesAsync({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: publishableKey }, () =>
      middleware(new NextRequest("http://localhost:3000/"))
    );

    expect(dejaPasar(respuesta)).toBe(true);
  });

  it("si falta la configuración de Supabase, no tumba el sitio: deja pasar el request", async () => {
    const respuesta = await conVariablesAsync({ SUPABASE_URL: undefined, SUPABASE_PUBLISHABLE_KEY: undefined }, () =>
      middleware(new NextRequest("http://localhost:3000/"))
    );

    expect(respuesta.status).toBe(200);
    expect(dejaPasar(respuesta)).toBe(true);
  });
});
