// Cómo se lee un test de Vitest:
// - describe("tema", () => {...}): agrupa tests relacionados.
// - it("qué debería pasar", () => {...}): un test. Si alguna línea `expect` no se cumple, el test falla.
// - expect(valor).toBe(esperado): compara. Otros: toEqual (mismo contenido), toContain, toMatch (regex), toThrow...
import { createOpenAI } from "@ai-sdk/openai";
import { describe, expect, it } from "vitest";
import { ChatController, ErrorDeChat, type RespuestaTutor } from "@/backend/controllers/chat.controller";
import { URL_API_OPENAI_POR_DEFECTO } from "@/backend/lib/openai";
import { Conversacion } from "@/backend/models/conversacion.model";
import { MaterialCatedra } from "@/backend/models/materialCatedra.model";

// Sin mocks: todos los tests le hablan a la API real de OpenAI (necesitan internet).

/** Atajo para armar una conversación válida de un solo mensaje del alumno. */
function conversacion(texto: string): Conversacion {
  const resultado = Conversacion.validar({ mensajes: [{ rol: "alumno", contenido: texto }] });
  if (!resultado.ok) throw new Error(resultado.error);
  return resultado.conversacion;
}

/** Nombres de las tools que usó el modelo, sin repetir. */
const herramientas = (respuesta: RespuestaTutor) => [...new Set(respuesta.herramientas.map((h) => h.nombre))];

/** Modelo real de OpenAI con una clave inválida: la API responde 401 sin gastar crédito. */
const modeloConClaveInvalida = () =>
  createOpenAI({ apiKey: "sk-clave-invalida-de-prueba", baseURL: URL_API_OPENAI_POR_DEFECTO }).chat("gpt-4o-mini");

// Si no hay API key configurada, los tests que llaman al modelo de verdad se saltean (describe.skipIf).
const hayClave = Boolean(process.env.OPENAI_API_KEY);

describe("ChatController.responder — errores (con la API real, sin gastar crédito)", () => {
  it("con una clave inválida devuelve un error para el alumno, sin mostrar detalles técnicos", async () => {
    const controller = new ChatController({ crearModelo: modeloConClaveInvalida });

    const error = await controller.responder(conversacion("Hola")).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ErrorDeChat);
    expect(error).toMatchObject({ status: 502 });
    expect((error as ErrorDeChat).mensajeParaAlumno).toContain("El tutor no está disponible");
    expect((error as ErrorDeChat).mensajeParaAlumno).not.toMatch(/api key|401|sk-/i);
  });

  it("si OpenAI tarda demasiado, avisa que probés de nuevo (504)", async () => {
    const controller = new ChatController({ crearModelo: modeloConClaveInvalida, timeoutMs: 1 });

    await expect(controller.responder(conversacion("Hola"))).rejects.toMatchObject({
      status: 504,
      mensajeParaAlumno: expect.stringContaining("tardó demasiado"),
    });
  });
});

describe.skipIf(!hayClave)("ChatController.responder — respuestas reales (requiere OPENAI_API_KEY)", () => {
  it("una definición de la base se responde con la convención de la cátedra (sin pedir ejercicios)", async () => {
    const respuesta = await new ChatController().responder(
      conversacion("¿Qué puede ir en la columna E.F.NO C. de la T.E.I.? Explicámelo corto.")
    );

    expect(herramientas(respuesta)).not.toContain("inspiracion_para_ejercicio");
    // La regla de la base de conocimiento: el mismo evento que originó la fila, o nada.
    expect(respuesta.texto.toLowerCase()).toMatch(/mismo evento|propio evento|sí mismo|nada|----/);
  });

  it("una consulta de cómo se hace algo usa los modelos, no ejercicios", async () => {
    const respuesta = await new ChatController().responder(
      conversacion("¿Cómo calculo el PTO en un ejercicio de tiempo comprometido?")
    );

    expect(herramientas(respuesta)).toContain("consultar_modelos");
    expect(herramientas(respuesta)).not.toContain("inspiracion_para_ejercicio");
  });

  it("para resolver un ejercicio de la anexa busca su enunciado y usa los modelos", async () => {
    const respuesta = await new ChatController().responder(
      conversacion("Resolveme el análisis previo del ejercicio Garage de la Guía Anexa.")
    );

    expect(herramientas(respuesta)).toEqual(expect.arrayContaining(["buscar_ejercicio", "consultar_modelos"]));
  });

  it("un ejercicio nuevo se inspira en la cátedra pero no la copia, y no revela la metodología", async () => {
    const respuesta = await new ChatController().responder(
      conversacion("Dame un ejercicio nuevo para practicar, tipo parcial.")
    );
    const titulosDeLaCatedra = MaterialCatedra.cargar()
      .fichas.filter((ficha) => ficha.tipo === "ejercicio" && ficha.titulo.length >= 6)
      .map((ficha) => ficha.titulo.toLowerCase());
    // El título: la primera línea que es un encabezado de Markdown (o la primera línea, si no hay encabezados).
    const lineas = respuesta.texto.split("\n").filter((linea) => linea.trim());
    const titulo = (lineas.find((linea) => linea.startsWith("#")) ?? lineas[0])
      .replace(/[#*]/g, "")
      .trim()
      .toLowerCase();

    expect(herramientas(respuesta)).toContain("inspiracion_para_ejercicio");
    expect(respuesta.texto).toMatch(/f\.?\s?d\.?\s?p/i);
    expect(respuesta.texto).toMatch(/se pide/i);
    // Creado desde cero: el título no es el de un ejercicio de la cátedra.
    expect(titulosDeLaCatedra.filter((deLaCatedra) => titulo.includes(deLaCatedra))).toEqual([]);
    // Lo tiene que descubrir el alumno: ni la metodología ni los nombres de eventos o variables.
    expect(respuesta.texto).not.toMatch(
      /evento a evento|\bEaE\b|Δt|delta t|intervalos? constantes?|\bTPLL\b|\bTPS\b|\bTEF\b/i
    );
  });

  it("con un modelo que no existe devuelve el error de configuración", async () => {
    const controller = new ChatController({
      crearModelo: () =>
        createOpenAI({ apiKey: process.env.OPENAI_API_KEY!, baseURL: URL_API_OPENAI_POR_DEFECTO }).chat(
          "modelo-que-no-existe"
        ),
    });

    await expect(controller.responder(conversacion("Hola"))).rejects.toMatchObject({ status: 502 });
  });
});
