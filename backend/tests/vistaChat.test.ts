import { describe, expect, it } from "vitest";
import { estaCercaDelFinal, mensajeDeError, siguienteScroll, TEXTOS_DE_HERRAMIENTAS } from "@/views/chat/tipos";
import { EjerciciosModel } from "@/backend/models/ejercicios.model";
import { crearToolsDiagrama } from "@/backend/tools/diagrama.tools";
import { crearToolsEjercicio } from "@/backend/tools/ejercicio.tools";
import { crearToolsFdp } from "@/backend/tools/fdp.tools";
import { crearToolsMaterial } from "@/backend/tools/material.tools";
import { MaterialCatedra } from "@/backend/models/materialCatedra.model";

// Sin mocks: errores reales como los que arma useChat (Error con el cuerpo de la respuesta o el texto del stream).

describe("mensajeDeError (lo que ve el alumno cuando algo falla)", () => {
  it("si la ruta respondió JSON { error } (401, 400, 404), muestra ese mensaje", () => {
    const error = new Error(JSON.stringify({ error: "Tu sesión expiró. Recargá la página." }));

    expect(mensajeDeError(error)).toBe("Tu sesión expiró. Recargá la página.");
  });

  it("si el error vino dentro del stream, muestra su texto tal cual (ya está pensado para el alumno)", () => {
    const error = new Error("El tutor tardó demasiado en responder. Probá de nuevo en unos segundos.");

    expect(mensajeDeError(error)).toBe("El tutor tardó demasiado en responder. Probá de nuevo en unos segundos.");
  });

  it("un error de red del navegador o un JSON sin «error» se muestra con el mensaje genérico", () => {
    expect(mensajeDeError(new TypeError("Failed to fetch"))).toContain("Revisá tu conexión");
    expect(mensajeDeError(new Error(JSON.stringify({ otro: 1 })))).toContain("Revisá tu conexión");
    expect(mensajeDeError(undefined)).toContain("Revisá tu conexión");
  });
});

describe("estaCercaDelFinal (si el chat acompaña la respuesta o deja al alumno leyendo)", () => {
  // Una zona de 500 px de alto con 2000 px de contenido: el final está en scrollTop = 1500.
  const zona = (scrollTop: number) => ({ scrollTop, scrollHeight: 2000, clientHeight: 500 });

  it("en el final, o casi (menos de 80 px), está pegado al final", () => {
    expect(estaCercaDelFinal(zona(1500))).toBe(true);
    expect(estaCercaDelFinal(zona(1430))).toBe(true);
  });

  it("si subió a leer algo, no está en el final (no hay que moverlo)", () => {
    expect(estaCercaDelFinal(zona(1000))).toBe(false);
    expect(estaCercaDelFinal(zona(0))).toBe(false);
  });

  it("si el contenido entra entero en la pantalla, está en el final", () => {
    expect(estaCercaDelFinal({ scrollTop: 0, scrollHeight: 300, clientHeight: 500 })).toBe(true);
  });
});

describe("siguienteScroll (la pantalla se desliza hacia el final, sin saltos)", () => {
  it("avanza solo una parte de lo que falta: lejos va más rápido, cerca más despacio", () => {
    const lejos = siguienteScroll(0, 1000) - 0;
    const cerca = siguienteScroll(900, 1000) - 900;

    expect(lejos).toBeGreaterThan(cerca);
    expect(lejos).toBeLessThan(1000); // no salta directo al final
  });

  it("siempre llega: avanza al menos 1 px y, a 1 px o menos, se queda en el final", () => {
    expect(siguienteScroll(995, 1000)).toBeGreaterThanOrEqual(996);
    expect(siguienteScroll(999.5, 1000)).toBe(1000);
    // Repitiendo pasos se llega al final en una cantidad razonable de cuadros (menos de 2 segundos a 60 fps).
    let posicion = 0;
    let cuadros = 0;
    while (posicion < 1000 && cuadros < 500) {
      posicion = siguienteScroll(posicion, 1000);
      cuadros++;
    }
    expect(posicion).toBe(1000);
    expect(cuadros).toBeLessThan(120);
  });

  it("si ya está en el final (o más abajo), no se mueve", () => {
    expect(siguienteScroll(1000, 1000)).toBe(1000);
    expect(siguienteScroll(1200, 1000)).toBe(1000);
  });
});

describe("TEXTOS_DE_HERRAMIENTAS", () => {
  it("tiene texto para cada tool del tutor (para que el alumno vea qué está haciendo)", () => {
    const tools = Object.keys({
      ...crearToolsMaterial(MaterialCatedra.cargar()),
      ...crearToolsDiagrama(),
      ...crearToolsFdp(),
      ...crearToolsEjercicio(new EjerciciosModel(), "sin-conversacion"),
    });

    for (const nombre of tools) {
      expect(TEXTOS_DE_HERRAMIENTAS[nombre]?.usando, nombre).toBeTruthy();
      expect(TEXTOS_DE_HERRAMIENTAS[nombre]?.usada, nombre).toBeTruthy();
    }
  });
});
