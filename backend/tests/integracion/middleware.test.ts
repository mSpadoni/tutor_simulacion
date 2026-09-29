import { NextRequest } from "next/server";
import { afterAll, describe, expect, inject, it } from "vitest";
import { middleware } from "@/middleware";
import { borrarAlumnosDePrueba, crearAlumnoLogueado, vencimientoDeSesion } from "../helpers/alumnoDePrueba";
import { conVariablesAsync } from "../helpers/variablesDeEntorno";

// Sin mocks: el middleware real de Next con un request real, contra la base local de Supabase.
const { url, publishableKey } = inject("supabaseLocal");
afterAll(borrarAlumnosDePrueba);

/** NextResponse.next() marca la respuesta con este header: "seguí con el request normalmente". */
const dejaPasar = (respuesta: Response) => respuesta.headers.get("x-middleware-next") === "1";

describe("middleware", () => {
  it("con Supabase configurado, refresca la sesión y deja pasar el request", async () => {
    const respuesta = await conVariablesAsync({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: publishableKey }, () =>
      middleware(new NextRequest("http://localhost:3000/"))
    );

    expect(dejaPasar(respuesta)).toBe(true);
  });

  it("si la sesión del alumno venció, la renueva y le devuelve las cookies nuevas", async () => {
    const alumno = await crearAlumnoLogueado();
    alumno.navegador.vencerSesion();
    const request = new NextRequest("http://localhost:3000/", { headers: { cookie: alumno.navegador.headerCookie() } });

    const respuesta = await conVariablesAsync({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: publishableKey }, () =>
      middleware(request)
    );

    const sesionNueva = respuesta.cookies.getAll().find((cookie) => /-auth-token(\.0)?$/.test(cookie.name));
    expect(dejaPasar(respuesta)).toBe(true);
    expect(sesionNueva).toBeDefined();
    expect(vencimientoDeSesion(sesionNueva!.value)).toBeGreaterThan(Date.now() / 1000);
  });

  it("si falta la configuración de Supabase, no tumba el sitio: deja pasar el request", async () => {
    const respuesta = await conVariablesAsync({ SUPABASE_URL: undefined, SUPABASE_PUBLISHABLE_KEY: undefined }, () =>
      middleware(new NextRequest("http://localhost:3000/"))
    );

    expect(respuesta.status).toBe(200);
    expect(dejaPasar(respuesta)).toBe(true);
  });
});
