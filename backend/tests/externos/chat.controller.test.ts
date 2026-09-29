import { randomUUID } from "node:crypto";
import { createOpenAI } from "@ai-sdk/openai";
import { afterAll, describe, expect, it } from "vitest";
import { URL_API_OPENAI_POR_DEFECTO } from "@/backend/lib/env";
import { borrarAlumnosDePrueba } from "../helpers/alumnoDePrueba";
import { alumnoConChat, codigoDelError, conversar, herramientas, mensajesGuardados } from "../helpers/chatDePrueba";

// Contra la API real de OpenAI (necesita internet). Nuestra orquestación (guardar, límites, errores, timeout,
// streaming, historial) se prueba sin internet en integracion/chat.controller.test.ts; acá queda lo que solo
// puede comprobarse con el proveedor real: cómo responde de verdad y qué tools elige el modelo.
afterAll(borrarAlumnosDePrueba);

describe("contrato con la API de OpenAI (sin gastar crédito)", () => {
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

// Con el modelo real la redacción cambia en cada respuesta: estos tests solo controlan que responda, que se
// guarde y qué tool usa. Las reglas de contenido están en el prompt (systemPrompt.test.ts).
const hayClave = Boolean(process.env.OPENAI_API_KEY);

describe.skipIf(!hayClave)("modelo real (requiere OPENAI_API_KEY)", () => {
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

  // Qué tool elige el modelo (depende del proveedor, no de la app): una corrida por caso.
  const usaLasTools = async (pedido: string) => {
    const { conversaciones, controller } = await alumnoConChat({ pausaEntrePalabrasMs: 0 });
    const id = randomUUID();
    await conversar(controller, id, pedido);
    const [, tutor] = await mensajesGuardados(conversaciones, id, 2);
    return herramientas(tutor);
  };

  it("una consulta de cómo se hace algo usa los modelos, no ejercicios", async () => {
    const tools = await usaLasTools("¿Cómo calculo el PTO en un ejercicio de tiempo comprometido?");

    expect(tools).toContain("consultar_modelos");
    expect(tools).not.toContain("inspiracion_para_ejercicio");
  });

  it("para resolver un ejercicio de la anexa busca su enunciado y usa los modelos", async () => {
    const tools = await usaLasTools("Resolveme el análisis previo del ejercicio Garage de la Guía Anexa.");

    expect(tools).toEqual(expect.arrayContaining(["buscar_ejercicio", "consultar_modelos"]));
  });

  it("al resolver un ejercicio completo, termina mostrando el diagrama de flujo", async () => {
    expect(await usaLasTools("Resolveme el ejercicio Clínica de la Guía Anexa.")).toContain("generar_diagrama_flujo");
  }, 90_000);

  it("un ejercicio nuevo usa la inspiración, queda guardado y no muestra el diagrama", async () => {
    const tools = await usaLasTools("Dame un ejercicio nuevo para practicar, tipo parcial.");

    expect(tools).toEqual(expect.arrayContaining(["inspiracion_para_ejercicio", "generar_ejercicio"]));
    // El diagrama revelaría la metodología: nunca al dar un ejercicio nuevo.
    expect(tools).not.toContain("generar_diagrama_flujo");
  });

  it("al resolver una f.d.p., la verifica con verificar_fdp", async () => {
    const tools = await usaLasTools(
      "Resolveme esta f.d.p. por el método más conveniente: f(x) = k·(x − 1) entre 1 y 7."
    );

    expect(tools).toContain("verificar_fdp");
  });

  it("si el alumno pide el diagrama, lo dibuja con Kroki y queda guardado en el mensaje", async () => {
    const { conversaciones, controller } = await alumnoConChat({ pausaEntrePalabrasMs: 0 });
    const id = randomUUID();

    await conversar(
      controller,
      id,
      "Dibujame el diagrama de flujo de la rutina de LLEGADA de un sistema con un puesto y una cola."
    );
    const [, tutor] = await mensajesGuardados(conversaciones, id, 2);
    const diagrama = tutor.parts.find((parte) => parte.type === "tool-generar_diagrama_flujo");

    expect(diagrama).toMatchObject({ state: "output-available", output: { ok: true } });
  });
});
