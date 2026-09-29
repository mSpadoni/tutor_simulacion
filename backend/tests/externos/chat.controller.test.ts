import { randomUUID } from "node:crypto";
import { createOpenAI } from "@ai-sdk/openai";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { URL_API_OPENAI_POR_DEFECTO } from "@/backend/lib/env";
import { borrarAlumnosDePrueba } from "../helpers/alumnoDePrueba";
import { alumnoConChat, codigoDelError, conversar, mensajesGuardados } from "../helpers/chatDePrueba";

// El contrato con la API real de OpenAI (necesita internet): que el proveedor de verdad responda en streaming y
// que sus errores reales se traduzcan a nuestros códigos. Nuestra orquestación se prueba sin internet en
// integracion/chat.controller.test.ts; qué tools elige el modelo, en evals/ (`npm run test:evals`).
afterAll(borrarAlumnosDePrueba);

describe("errores reales de la API de OpenAI (sin gastar crédito)", () => {
  it("una clave inválida de verdad (401 real) se traduce a «tutor_no_disponible»", async () => {
    const { controller } = await alumnoConChat({
      crearModelo: () =>
        createOpenAI({ apiKey: "sk-clave-invalida-de-prueba", baseURL: URL_API_OPENAI_POR_DEFECTO }).chat(
          "gpt-4o-mini"
        ),
    });

    expect(codigoDelError(await conversar(controller, randomUUID(), "Hola"))).toBe("tutor_no_disponible");
  });
});

describe("con la clave de OpenAI", () => {
  // Si falta, se avisa en vez de saltear en silencio: un `npm run test:externos` en verde tiene que haberlos corrido.
  beforeAll(() => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Estos tests necesitan OPENAI_API_KEY en .env.local (usan el modelo real). No se saltean.");
    }
  });

  it("responde en streaming con tokens, guarda la respuesta y sigue la conversación con su historial", async () => {
    const { conversaciones, controller } = await alumnoConChat({ pausaEntrePalabrasMs: 0 });
    const id = randomUUID();

    const eventos = await conversar(controller, id, "Hola!");
    expect(eventos.some((evento) => evento.type === "text-delta")).toBe(true);
    const fin = eventos.find((evento) => evento.type === "finish")?.messageMetadata;
    expect(fin?.tokens?.total).toBeGreaterThan(0);
    expect(fin?.motivoDeFin).toEqual(expect.any(String));
    await mensajesGuardados(conversaciones, id, 2);

    await conversar(controller, id, "Gracias, ¿qué me podés ayudar a practicar?");
    const todos = await mensajesGuardados(conversaciones, id, 4);
    expect(todos.map((m) => m.role)).toEqual(["user", "assistant", "user", "assistant"]);
  });

  it("un modelo que no existe se traduce a «tutor_no_disponible»", async () => {
    const { controller } = await alumnoConChat({
      crearModelo: () =>
        createOpenAI({ apiKey: process.env.OPENAI_API_KEY!, baseURL: URL_API_OPENAI_POR_DEFECTO }).chat(
          "modelo-que-no-existe"
        ),
    });

    expect(codigoDelError(await conversar(controller, randomUUID(), "Hola"))).toBe("tutor_no_disponible");
  });
});
