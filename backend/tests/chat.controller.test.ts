// Cómo se lee un test de Vitest:
// - describe("tema", () => {...}): agrupa tests relacionados.
// - it("qué debería pasar", () => {...}): un test. Si alguna línea `expect` no se cumple, el test falla.
// - expect(valor).toBe(esperado): compara. Otros: toEqual (mismo contenido), toContain, toMatch (regex), toThrow...
import OpenAI from "openai";
import { describe, expect, it } from "vitest";
import { ChatController, ErrorDeChat } from "@/backend/controllers/chat.controller";
import { Conversacion } from "@/backend/models/conversacion.model";

// Sin mocks: todos los tests le hablan a la API real de OpenAI (necesitan internet).

/** Atajo para armar una conversación válida de un solo mensaje del alumno. */
function conversacion(texto: string): Conversacion {
  const resultado = Conversacion.validar({ mensajes: [{ rol: "alumno", contenido: texto }] });
  if (!resultado.ok) throw new Error(resultado.error);
  return resultado.conversacion;
}

// Si no hay API key configurada, los tests que llaman al modelo de verdad se saltean (describe.skipIf).
const hayClave = Boolean(process.env.OPENAI_API_KEY);

describe("ChatController.responder — errores (con la API real, sin gastar crédito)", () => {
  it("con una clave inválida devuelve un error para el alumno, sin mostrar detalles técnicos", async () => {
    const controller = new ChatController({
      crearClienteOpenAI: () => new OpenAI({ apiKey: "sk-clave-invalida-de-prueba", maxRetries: 0 }),
    });

    const error = await controller.responder(conversacion("Hola")).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ErrorDeChat);
    expect(error).toMatchObject({ status: 502 });
    expect((error as ErrorDeChat).mensajeParaAlumno).toContain("El tutor no está disponible");
    expect((error as ErrorDeChat).mensajeParaAlumno).not.toMatch(/api key|401|sk-/i);
  });

  it("si OpenAI tarda demasiado, avisa que probés de nuevo (504)", async () => {
    const controller = new ChatController({
      crearClienteOpenAI: () => new OpenAI({ apiKey: "sk-clave-invalida-de-prueba", timeout: 1, maxRetries: 0 }),
    });

    await expect(controller.responder(conversacion("Hola"))).rejects.toMatchObject({
      status: 504,
      mensajeParaAlumno: expect.stringContaining("tardó demasiado"),
    });
  });
});

describe.skipIf(!hayClave)("ChatController.responder — respuestas reales (requiere OPENAI_API_KEY)", () => {
  it("responde una consulta teórica usando la convención de la cátedra", async () => {
    const respuesta = await new ChatController().responder(
      conversacion("En una línea: ¿qué puede ir en la columna E.F.NO C. de la T.E.I.?")
    );

    expect(respuesta.length).toBeGreaterThan(0);
    // La regla de la base de conocimiento: el mismo evento que originó la fila, o nada.
    expect(respuesta.toLowerCase()).toMatch(/mismo evento|propio evento|sí mismo|nada|----/);
  });

  it("con un modelo que no existe devuelve el error de configuración", async () => {
    const controller = new ChatController({ modelo: "modelo-que-no-existe" });

    await expect(controller.responder(conversacion("Hola"))).rejects.toMatchObject({ status: 502 });
  });
});
