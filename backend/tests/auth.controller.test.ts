// Cómo se lee un test de Vitest:
// - describe("tema", () => {...}): agrupa tests relacionados.
// - it("qué debería pasar", async () => {...}): un test (async porque habla con la base local de Supabase).
// - expect(valor).toBe(esperado): compara. Otros: toEqual (mismo contenido), toMatchObject (al menos esas propiedades)...
// - afterAll(fn): corre `fn` una vez al terminar todos los tests del archivo (acá, borra los alumnos de prueba).
import { afterAll, describe, expect, it } from "vitest";
import { AuthController } from "@/backend/controllers/auth.controller";
import { Usuario } from "@/backend/models/usuario.model";
import { borrarAlumnosDePrueba, crearAlumnoLogueado, NavegadorDePrueba } from "./helpers/alumnoDePrueba";

afterAll(borrarAlumnosDePrueba);

describe("AuthController.obtenerUsuarioActual", () => {
  it("devuelve null si el alumno no inició sesión", async () => {
    const controller = new AuthController(new NavegadorDePrueba().crearCliente);

    expect(await controller.obtenerUsuarioActual()).toBeNull();
  });

  it("devuelve al alumno logueado con los datos que manda Google (lo que muestra 'Hola, <nombre>')", async () => {
    const alumno = await crearAlumnoLogueado({
      full_name: "Mateo Spadoni",
      avatar_url: "https://ejemplo.com/mateo.png",
    });
    const controller = new AuthController(alumno.navegador.crearCliente);

    const usuario = await controller.obtenerUsuarioActual();

    expect(usuario).toBeInstanceOf(Usuario);
    expect(usuario).toMatchObject({
      id: alumno.id,
      email: alumno.email,
      nombre: "Mateo Spadoni",
      avatarUrl: "https://ejemplo.com/mateo.png",
    });
    expect(usuario?.nombreVisible).toBe("Mateo Spadoni");
  });

  it("mantiene la sesión entre requests (como al recargar la página)", async () => {
    const alumno = await crearAlumnoLogueado();

    // Cada controller crea su cliente de cero, leyendo solo las cookies: igual que dos requests distintos.
    const primerRequest = await new AuthController(alumno.navegador.crearCliente).obtenerUsuarioActual();
    const segundoRequest = await new AuthController(alumno.navegador.crearCliente).obtenerUsuarioActual();

    expect(primerRequest?.id).toBe(alumno.id);
    expect(segundoRequest?.id).toBe(alumno.id);
  });

  it("no mezcla sesiones: cada navegador ve a su propio alumno", async () => {
    const ana = await crearAlumnoLogueado({ full_name: "Ana" });
    const beto = await crearAlumnoLogueado({ full_name: "Beto" });

    const vistoPorAna = await new AuthController(ana.navegador.crearCliente).obtenerUsuarioActual();
    const vistoPorBeto = await new AuthController(beto.navegador.crearCliente).obtenerUsuarioActual();

    expect(vistoPorAna?.nombre).toBe("Ana");
    expect(vistoPorBeto?.nombre).toBe("Beto");
  });
});

describe("AuthController.cerrarSesion", () => {
  it("después de cerrar sesión, el siguiente request ya no tiene alumno", async () => {
    const alumno = await crearAlumnoLogueado();
    const controller = new AuthController(alumno.navegador.crearCliente);

    await controller.cerrarSesion();

    expect(await controller.obtenerUsuarioActual()).toBeNull();
  });
});

describe("AuthController.urlDeLoginConGoogle", () => {
  it("arma la URL de Supabase → Google con el callback de la app y PKCE", async () => {
    const navegador = new NavegadorDePrueba();
    const controller = new AuthController(navegador.crearCliente);

    const url = await controller.urlDeLoginConGoogle("http://localhost:3000/auth/callback");

    expect(url).not.toBeNull();
    const destino = new URL(url!);
    expect(destino.pathname).toBe("/auth/v1/authorize");
    expect(destino.searchParams.get("provider")).toBe("google");
    expect(destino.searchParams.get("redirect_to")).toBe("http://localhost:3000/auth/callback");
    expect(destino.searchParams.get("code_challenge_method")).toBe("s256");
    expect(destino.searchParams.get("code_challenge")).toBeTruthy();
    // El verificador PKCE queda en las cookies para canjear el code en /auth/callback.
    expect(navegador.nombresDeCookies().some((nombre) => nombre.endsWith("code-verifier"))).toBe(true);
  });
});

describe("AuthController.completarLogin", () => {
  it("rechaza un code inválido y no deja sesión (la home muestra el aviso de error)", async () => {
    const navegador = new NavegadorDePrueba();
    const controller = new AuthController(navegador.crearCliente);
    await controller.urlDeLoginConGoogle("http://localhost:3000/auth/callback");

    const ok = await controller.completarLogin("code-que-no-existe");

    expect(ok).toBe(false);
    expect(await controller.obtenerUsuarioActual()).toBeNull();
  });
});
