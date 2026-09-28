import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, expectTypeOf, it } from "vitest";
import { EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";
import { MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { crearToolsTutor } from "@/backend/tools/tutor.tools";
import type { NombreDeHerramienta, TutorUIMessage } from "@/shared/chat";
import { TEXTOS_DE_HERRAMIENTAS } from "@/views/chat/tipos";

// El contrato entre /api/chat y la vista sale de un solo lugar (shared/chat.ts, derivado de las tools reales).
// Sin mocks: se arman las tools de verdad y se leen los archivos del proyecto.

describe("contrato del chat: tools ↔ vista", () => {
  const tools = crearToolsTutor({
    material: MaterialCatedra.cargar(),
    ejercicios: new EjerciciosModel(),
    conversacionId: "sin-conversacion",
  });

  it("en tipos: los textos de la vista cubren exactamente las tools del servidor", () => {
    // Si se agrega, borra o renombra una tool, esto (y la vista) deja de compilar.
    expectTypeOf<keyof typeof TEXTOS_DE_HERRAMIENTAS>().toEqualTypeOf<NombreDeHerramienta>();
    expectTypeOf<NombreDeHerramienta>().toEqualTypeOf<keyof typeof tools>();
  });

  it("en ejecución: cada tool tiene su texto para el alumno", () => {
    expect(Object.keys(TEXTOS_DE_HERRAMIENTAS).sort()).toEqual(Object.keys(tools).sort());
    for (const { usando, usada } of Object.values(TEXTOS_DE_HERRAMIENTAS)) {
      expect(usando).toBeTruthy();
      expect(usada).toBeTruthy();
    }
  });

  it("las partes de tool del mensaje llevan el tipo de la tool (datos y resultado)", () => {
    type ParteEjercicio = Extract<TutorUIMessage["parts"][number], { type: "tool-generar_ejercicio" }>;
    expectTypeOf<Extract<ParteEjercicio, { state: "output-available" }>["output"]>().toEqualTypeOf<
      { ok: true; id: string } | { ok: false; error: string }
    >();
  });
});

describe("los límites del chat se definen una sola vez", () => {
  const archivos = (dir: string): string[] =>
    readdirSync(dir).flatMap((nombre) => {
      const ruta = join(dir, nombre);
      if (statSync(ruta).isDirectory()) return archivos(ruta);
      return /\.tsx?$/.test(nombre) ? [ruta] : [];
    });

  it("MAX_CARACTERES_MENSAJE y MAX_MENSAJES_CONTEXTO solo se declaran en shared/chat.ts", () => {
    const declaraciones = ["app", "backend", "shared", "views"]
      .flatMap(archivos)
      .filter((ruta) => /const MAX_(CARACTERES_MENSAJE|MENSAJES_CONTEXTO)\b/.test(readFileSync(ruta, "utf8")));

    expect(declaraciones.map((ruta) => ruta.replaceAll("\\", "/"))).toEqual(["shared/chat.ts"]);
  });
});
