import { describe, expect, it } from "vitest";
import { mensajeDeError, TEXTOS_DE_HERRAMIENTAS } from "@/views/chat/tipos";
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

describe("TEXTOS_DE_HERRAMIENTAS", () => {
  it("tiene texto para cada tool del tutor (para que el alumno vea qué está haciendo)", () => {
    const tools = Object.keys(crearToolsMaterial(MaterialCatedra.cargar()));

    for (const nombre of tools) {
      expect(TEXTOS_DE_HERRAMIENTAS[nombre]?.usando, nombre).toBeTruthy();
      expect(TEXTOS_DE_HERRAMIENTAS[nombre]?.usada, nombre).toBeTruthy();
    }
  });
});
