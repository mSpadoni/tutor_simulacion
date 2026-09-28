// Cómo se lee un test de Vitest:
// - describe("tema", () => {...}): agrupa tests relacionados.
// - it("qué debería pasar", () => {...}): un test. Si alguna línea `expect` no se cumple, el test falla.
// - expect(valor).toBe(esperado): compara. Otros: toEqual (mismo contenido), toContain, toMatch (regex), toThrow...
import { randomUUID } from "node:crypto";
import { createOpenAI } from "@ai-sdk/openai";
import type { UIMessage } from "ai";
import { afterAll, describe, expect, it } from "vitest";
import { ChatController } from "@/backend/controllers/chat.controller";
import { ErrorDeChat } from "@/backend/tutor/errores";
import { URL_API_OPENAI_POR_DEFECTO } from "@/backend/lib/env";
import { ConversacionesModel } from "@/backend/models/repositorios/conversaciones.model";
import { EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";
import { PedidoDeChat } from "@/backend/models/dominio/pedidoDeChat.model";
import type { MetadatosDeRespuesta } from "@/shared/chat";
import { borrarAlumnosDePrueba, crearAlumnoLogueado } from "./helpers/alumnoDePrueba";
import { conVariablesAsync } from "./helpers/variablesDeEntorno";

// Sin mocks: la base es la copia local de Supabase y el modelo es la API real de OpenAI (necesitan internet).
afterAll(borrarAlumnosDePrueba);

/** Un alumno logueado, su model de conversaciones y un controller que guarda con su sesión. */
async function alumnoConChat(dependencias: ConstructorParameters<typeof ChatController>[0] = {}) {
  const alumno = await crearAlumnoLogueado();
  const conversaciones = new ConversacionesModel(alumno.navegador.crearCliente);
  const ejercicios = new EjerciciosModel(alumno.navegador.crearCliente);
  const controller = new ChatController({
    conversaciones: () => conversaciones,
    ejercicios: () => ejercicios,
    ...dependencias,
  });
  return { conversaciones, ejercicios, controller };
}

/** Manda un mensaje como useChat, lee el stream completo y devuelve sus eventos. */
async function conversar(controller: ChatController, conversacionId: string, texto: string) {
  const validacion = PedidoDeChat.validar({
    id: conversacionId,
    mensaje: { id: randomUUID(), role: "user", parts: [{ type: "text", text: texto }] },
  });
  if (!validacion.ok) throw new Error(validacion.error);

  const respuesta = await controller.responder(validacion.pedido);
  const cuerpo = await respuesta.text();
  // El stream es SSE: una línea "data: {json}" por evento, y "data: [DONE]" al final.
  return cuerpo
    .split("\n")
    .filter((linea) => linea.startsWith("data: {"))
    .map(
      (linea) =>
        JSON.parse(linea.slice(6)) as {
          type: string;
          errorText?: string;
          delta?: string;
          messageMetadata?: MetadatosDeRespuesta;
        }
    );
}

/** Espera a que la respuesta del tutor quede guardada (se guarda al cerrar el stream) y devuelve los mensajes. */
async function mensajesGuardados(conversaciones: ConversacionesModel, id: string, cantidad: number) {
  for (let intento = 0; intento < 20; intento++) {
    const mensajes = await conversaciones.mensajes(id);
    if (mensajes.length >= cantidad) return mensajes;
    await new Promise((listo) => setTimeout(listo, 150));
  }
  return conversaciones.mensajes(id);
}

/** Qué tools usó el tutor en un mensaje guardado (sus partes "tool-<nombre>"). */
const herramientas = (mensaje: UIMessage) => [
  ...new Set(mensaje.parts.filter((parte) => parte.type.startsWith("tool-")).map((parte) => parte.type.slice(5))),
];

/** Modelo real de OpenAI con una clave inválida: la API responde 401 sin gastar crédito. */
const modeloConClaveInvalida = () =>
  createOpenAI({ apiKey: "sk-clave-invalida-de-prueba", baseURL: URL_API_OPENAI_POR_DEFECTO }).chat("gpt-4o-mini");

describe("ChatController.responder — sin configuración de OpenAI", () => {
  it("si falta OPENAI_API_KEY, el alumno ve «no está disponible» (502) y no se guarda nada", async () => {
    // Sin crearModelo: usa el real, que lee la key de las variables de entorno.
    const alumno = await crearAlumnoLogueado();
    const conversaciones = new ConversacionesModel(alumno.navegador.crearCliente);
    const controller = new ChatController({ conversaciones: () => conversaciones });
    const id = randomUUID();

    const error = await conVariablesAsync({ OPENAI_API_KEY: undefined }, () =>
      conversar(controller, id, "Hola").catch((e: unknown) => e)
    );

    expect(error).toBeInstanceOf(ErrorDeChat);
    expect(error).toMatchObject({ status: 502, mensajeParaAlumno: expect.stringContaining("no está disponible") });
    expect(await conversaciones.obtener(id)).toBeNull();
  });
});

describe("ChatController.responder — conversación y errores (sin gastar crédito)", () => {
  it("una conversación nueva se crea con el primer mensaje como título, y ese mensaje queda guardado", async () => {
    const { conversaciones, controller } = await alumnoConChat({ crearModelo: modeloConClaveInvalida });
    const id = randomUUID();

    await conversar(controller, id, "Dame un ejercicio de colas");

    expect(await conversaciones.obtener(id)).toMatchObject({ titulo: "Dame un ejercicio de colas" });
    const mensajes = await conversaciones.mensajes(id);
    expect(mensajes.map((m) => m.role)).toEqual(["user"]);
  });

  it("si el modelo falla, el error llega en el stream con un mensaje para el alumno, sin detalles técnicos", async () => {
    const { controller } = await alumnoConChat({ crearModelo: modeloConClaveInvalida });

    const eventos = await conversar(controller, randomUUID(), "Hola");
    const error = eventos.find((evento) => evento.type === "error");

    expect(error?.errorText).toContain("El tutor no está disponible");
    expect(error?.errorText).not.toMatch(/api key|401|sk-/i);
    // Para el panel de debug: el modelo llega apenas empieza la respuesta, aunque después falle.
    expect(eventos.find((evento) => evento.type === "start")?.messageMetadata).toEqual({ modelo: "gpt-4o-mini" });
  });

  it("si el modelo tarda demasiado, el stream avisa que probés de nuevo", async () => {
    const { controller } = await alumnoConChat({ crearModelo: modeloConClaveInvalida, timeoutMs: 1 });

    const eventos = await conversar(controller, randomUUID(), "Hola");

    expect(eventos.find((evento) => evento.type === "error")?.errorText).toContain("tardó demasiado");
  });

  it("no deja escribir en la conversación de otro alumno (404) y no guarda nada", async () => {
    const duenio = await alumnoConChat({ crearModelo: modeloConClaveInvalida });
    const intruso = await alumnoConChat({ crearModelo: modeloConClaveInvalida });
    const id = randomUUID();
    await conversar(duenio.controller, id, "Mi conversación");

    await expect(conversar(intruso.controller, id, "Hola")).rejects.toMatchObject({
      constructor: ErrorDeChat,
      status: 404,
    });
    expect(await duenio.conversaciones.mensajes(id)).toHaveLength(1);
  });
});

// Con el modelo real la redacción cambia en cada respuesta: estos tests solo controlan que responda, que se
// guarde y que use la tool correcta. Las reglas de contenido están en el prompt (systemPrompt.test.ts).
const hayClave = Boolean(process.env.OPENAI_API_KEY);

describe.skipIf(!hayClave)("ChatController.responder — respuestas reales (requiere OPENAI_API_KEY)", () => {
  it("responde en streaming, guarda la respuesta y sigue la misma conversación con su historial", async () => {
    const { conversaciones, controller } = await alumnoConChat();
    const id = randomUUID();

    const eventos = await conversar(controller, id, "Hola!");
    expect(eventos.some((evento) => evento.type === "text-delta")).toBe(true);
    // Para el panel de debug: al terminar llegan los tokens, la demora y el motivo de fin.
    const fin = eventos.find((evento) => evento.type === "finish")?.messageMetadata;
    expect(fin?.tokens?.total).toBeGreaterThan(0);
    expect(fin?.ms).toBeGreaterThan(0);
    expect(fin?.motivoDeFin).toBe("stop");
    const primeros = await mensajesGuardados(conversaciones, id, 2);
    expect(primeros.map((m) => m.role)).toEqual(["user", "assistant"]);
    expect(herramientas(primeros[1])).toEqual([]);

    await conversar(controller, id, "Gracias, ¿qué me podés ayudar a practicar?");
    const todos = await mensajesGuardados(conversaciones, id, 4);
    expect(todos.map((m) => m.role)).toEqual(["user", "assistant", "user", "assistant"]);
  });

  it("la respuesta llega palabra por palabra (no en ráfagas)", async () => {
    const { controller } = await alumnoConChat();

    const eventos = await conversar(controller, randomUUID(), "Contame en dos oraciones qué es una simulación.");
    const deltas = eventos.filter((evento) => evento.type === "text-delta").map((evento) => evento.delta ?? "");
    const deUnaPalabra = deltas.filter((delta) => delta.trim().split(/\s+/).length <= 1);

    expect(deltas.length).toBeGreaterThan(5);
    // Casi todos los pedacitos son una sola palabra (el último puede traer lo que quedó).
    expect(deUnaPalabra.length / deltas.length).toBeGreaterThan(0.9);
  });

  it("una consulta de cómo se hace algo usa los modelos, no ejercicios", async () => {
    const { conversaciones, controller } = await alumnoConChat();
    const id = randomUUID();

    await conversar(controller, id, "¿Cómo calculo el PTO en un ejercicio de tiempo comprometido?");
    const [, tutor] = await mensajesGuardados(conversaciones, id, 2);

    expect(herramientas(tutor)).toContain("consultar_modelos");
    expect(herramientas(tutor)).not.toContain("inspiracion_para_ejercicio");
  });

  it("para resolver un ejercicio de la anexa busca su enunciado y usa los modelos", async () => {
    const { conversaciones, controller } = await alumnoConChat();
    const id = randomUUID();

    await conversar(controller, id, "Resolveme el análisis previo del ejercicio Garage de la Guía Anexa.");
    const [, tutor] = await mensajesGuardados(conversaciones, id, 2);

    expect(herramientas(tutor)).toEqual(expect.arrayContaining(["buscar_ejercicio", "consultar_modelos"]));
  });

  it("un ejercicio nuevo usa la inspiración de la cátedra y queda guardado en «Mis ejercicios»", async () => {
    const { conversaciones, ejercicios, controller } = await alumnoConChat();
    const id = randomUUID();

    await conversar(controller, id, "Dame un ejercicio nuevo para practicar, tipo parcial.");
    const [, tutor] = await mensajesGuardados(conversaciones, id, 2);

    expect(herramientas(tutor)).toContain("inspiracion_para_ejercicio");
    expect(herramientas(tutor)).toContain("generar_ejercicio");
    expect((await ejercicios.listarRecientes()).map((ejercicio) => ejercicio.conversacion_id)).toEqual([id]);
    // El diagrama revelaría la metodología: nunca al dar un ejercicio nuevo.
    expect(herramientas(tutor)).not.toContain("generar_diagrama_flujo");
  });

  it("al resolver una f.d.p., la verifica con verificar_fdp", async () => {
    const { conversaciones, controller } = await alumnoConChat();
    const id = randomUUID();

    await conversar(
      controller,
      id,
      "Resolveme esta f.d.p. por el método más conveniente: f(x) = k·(x − 1) entre 1 y 7."
    );
    const [, tutor] = await mensajesGuardados(conversaciones, id, 2);

    expect(herramientas(tutor)).toContain("verificar_fdp");
  });

  it("si el alumno pide el diagrama, lo dibuja con Kroki y queda guardado en el mensaje", async () => {
    const { conversaciones, controller } = await alumnoConChat();
    const id = randomUUID();

    await conversar(
      controller,
      id,
      "Dibujame el diagrama de flujo de la rutina de LLEGADA de un sistema con un puesto y una cola."
    );
    const [, tutor] = await mensajesGuardados(conversaciones, id, 2);
    const diagrama = tutor.parts.find((parte) => parte.type === "tool-generar_diagrama_flujo") as
      { state: string; output: { ok: boolean; svg?: string } } | undefined;

    expect(diagrama?.state).toBe("output-available");
    expect(diagrama?.output.ok).toBe(true);
    expect(diagrama?.output.svg).toContain("<svg");
  });

  it("con un modelo que no existe, el stream trae el error de configuración", async () => {
    const { controller } = await alumnoConChat({
      crearModelo: () =>
        createOpenAI({ apiKey: process.env.OPENAI_API_KEY!, baseURL: URL_API_OPENAI_POR_DEFECTO }).chat(
          "modelo-que-no-existe"
        ),
    });

    const eventos = await conversar(controller, randomUUID(), "Hola");

    expect(eventos.find((evento) => evento.type === "error")?.errorText).toContain("El tutor no está disponible");
  });
});
