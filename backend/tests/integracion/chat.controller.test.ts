import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { ChatController } from "@/backend/controllers/chat.controller";
import { ErrorDeAplicacion } from "@/backend/errores";
import { ConversacionesModel } from "@/backend/models/repositorios/conversaciones.model";
import { MAX_MENSAJES_CONTEXTO, type TutorUIMessage } from "@/shared/chat";
import { borrarAlumnosDePrueba, crearAlumnoLogueado } from "../helpers/alumnoDePrueba";
import { alumnoConChat, codigoDelError, conversar, herramientas, mensajesGuardados } from "../helpers/chatDePrueba";
import { errorDeLaApi, modeloQueFalla, modeloQueResponde } from "../helpers/modeloDePrueba";
import { conVariablesAsync } from "../helpers/variablesDeEntorno";

// NUESTRA orquestación del chat (guardar, límites, errores, timeout, streaming, historial) contra la Supabase local,
// con un modelo de prueba del AI SDK: determinista y sin internet. La conducta del modelo real está en externos/.
afterAll(borrarAlumnosDePrueba);

const mensaje = (role: "user" | "assistant", texto: string): TutorUIMessage => ({
  id: randomUUID(),
  role,
  parts: [{ type: "text", text: texto }],
});

describe("ChatController.responder — conversación", () => {
  it("una conversación nueva se crea con el primer mensaje como título, y se guardan la pregunta y la respuesta", async () => {
    const { conversaciones, controller } = await alumnoConChat({
      crearModelo: () => modeloQueResponde("Claro, armemos uno de colas."),
    });
    const id = randomUUID();

    await conversar(controller, id, "Dame un ejercicio de colas");

    expect(await conversaciones.obtener(id)).toMatchObject({ titulo: "Dame un ejercicio de colas" });
    const [pregunta, respuesta] = await mensajesGuardados(conversaciones, id, 2);
    expect(pregunta.role).toBe("user");
    expect(respuesta).toMatchObject({ role: "assistant" });
    expect(herramientas(respuesta)).toEqual([]);
  });

  it("la respuesta llega palabra por palabra, aunque el modelo la mande en ráfagas", async () => {
    const texto = "Una simulación reproduce el comportamiento de un sistema a lo largo del tiempo.";
    const { controller } = await alumnoConChat({ crearModelo: () => modeloQueResponde(texto) });

    const eventos = await conversar(controller, randomUUID(), "¿Qué es una simulación?");
    const deltas = eventos.filter((evento) => evento.type === "text-delta").map((evento) => evento.delta ?? "");

    expect(deltas.join("")).toBe(texto);
    for (const delta of deltas) expect(delta.trim().split(/\s+/), JSON.stringify(delta)).toHaveLength(1);
  });

  it("al terminar manda al panel de debug el modelo, los pasos, los tokens y el motivo de fin", async () => {
    const { controller } = await alumnoConChat({ crearModelo: () => modeloQueResponde("Hola.") });

    const eventos = await conversar(controller, randomUUID(), "Hola");

    expect(eventos.find((evento) => evento.type === "start")?.messageMetadata).toEqual({ modelo: "modelo-de-prueba" });
    expect(eventos.find((evento) => evento.type === "finish")?.messageMetadata).toMatchObject({
      motivoDeFin: "stop",
      tokens: { entrada: 120, salida: 30, total: 150 },
    });
  });
});

describe("ChatController.responder — lo que recibe el modelo", () => {
  it("del historial solo va el texto: lo que devolvieron las tools no se reenvía (costo en tokens)", async () => {
    const modelo = modeloQueResponde("Seguimos.");
    const { conversaciones, controller } = await alumnoConChat({ crearModelo: () => modelo });
    const id = randomUUID();
    await conversaciones.crear(id, "Tiempo comprometido");
    const conTool: TutorUIMessage = {
      id: randomUUID(),
      role: "assistant",
      parts: [
        {
          type: "tool-consultar_modelos",
          toolCallId: "t1",
          state: "output-available",
          input: { tema: "tiempo comprometido" },
          output: "CONTENIDO LARGO DEL MODELO DE LA CÁTEDRA",
        },
        { type: "text", text: "Así se calcula el PTO." },
      ],
    };
    await conversaciones.agregarMensajes(id, [mensaje("user", "¿Cómo calculo el PTO?"), conTool]);

    await conversar(controller, id, "¿Y el tiempo ocioso?");

    const prompt = JSON.stringify(modelo.doStreamCalls[0].prompt);
    expect(prompt).toContain("Así se calcula el PTO.");
    expect(prompt).toContain("¿Y el tiempo ocioso?");
    expect(prompt).not.toContain("CONTENIDO LARGO DEL MODELO DE LA CÁTEDRA");
  });

  it(`del historial van los últimos ${MAX_MENSAJES_CONTEXTO} mensajes, más el nuevo`, async () => {
    const modelo = modeloQueResponde("Dale.");
    // Los mensajes anteriores cuentan para el límite de uso: acá se lo amplía para probar solo el historial.
    const { conversaciones, controller } = await alumnoConChat({
      crearModelo: () => modelo,
      limites: { porMinuto: 1000, porDia: 1000 },
    });
    const id = randomUUID();
    await conversaciones.crear(id, "Larga");
    const anteriores = Array.from({ length: MAX_MENSAJES_CONTEXTO + 5 }, (_, i) => mensaje("user", `mensaje-${i}`));
    await conversaciones.agregarMensajes(id, anteriores);

    await conversar(controller, id, "el nuevo");

    const prompt = JSON.stringify(modelo.doStreamCalls[0].prompt);
    expect(prompt).toContain(`mensaje-${MAX_MENSAJES_CONTEXTO + 4}`); // el último de los anteriores
    expect(prompt).not.toContain('"mensaje-4"'); // uno de los que quedaron afuera
    expect(prompt).toContain("el nuevo");
  });
});

describe("ChatController.responder — errores", () => {
  it("sin OPENAI_API_KEY corta con «tutor_no_disponible» antes de guardar nada", async () => {
    // Sin crearModelo: usa el real, que lee la key de las variables de entorno.
    const alumno = await crearAlumnoLogueado();
    const conversaciones = new ConversacionesModel(alumno.navegador.crearCliente);
    const controller = new ChatController({ conversaciones: () => conversaciones });
    const id = randomUUID();

    const error = await conVariablesAsync({ OPENAI_API_KEY: undefined }, () =>
      conversar(controller, id, "Hola").catch((e: unknown) => e)
    );

    expect(error).toMatchObject({ constructor: ErrorDeAplicacion, codigo: "tutor_no_disponible" });
    expect(await conversaciones.obtener(id)).toBeNull();
  });

  it("si el modelo falla (ej. clave inválida), el error llega en el stream con su código y sin detalles", async () => {
    const claveInvalida = errorDeLaApi(401, {
      message: "Incorrect API key provided: sk-abc***",
      code: "invalid_api_key",
    });
    const { controller } = await alumnoConChat({ crearModelo: () => modeloQueFalla(claveInvalida) });

    const eventos = await conversar(controller, randomUUID(), "Hola");

    expect(codigoDelError(eventos)).toBe("tutor_no_disponible");
    expect(eventos.find((evento) => evento.type === "error")?.errorText).not.toMatch(/api key|401|sk-/i);
  });

  it("si OpenAI está saturado (429), el error es «tutor_saturado» (se puede reintentar)", async () => {
    const saturado = errorDeLaApi(429, { message: "Rate limit reached", code: "rate_limit_exceeded" });
    const { controller } = await alumnoConChat({ crearModelo: () => modeloQueFalla(saturado) });

    expect(codigoDelError(await conversar(controller, randomUUID(), "Hola"))).toBe("tutor_saturado");
  });

  it("si el modelo tarda más que el límite, el stream avisa con «tutor_demorado»", async () => {
    const { controller } = await alumnoConChat({
      crearModelo: () => modeloQueResponde("Tarde.", { demoraInicialMs: 2000 }),
      timeoutMs: 50,
    });

    expect(codigoDelError(await conversar(controller, randomUUID(), "Hola"))).toBe("tutor_demorado");
  });

  it("no deja escribir en la conversación de otro alumno y no guarda nada", async () => {
    const responde = () => modeloQueResponde("Ok.");
    const duenio = await alumnoConChat({ crearModelo: responde });
    const intruso = await alumnoConChat({ crearModelo: responde });
    const id = randomUUID();
    await conversar(duenio.controller, id, "Mi conversación");
    await mensajesGuardados(duenio.conversaciones, id, 2);

    await expect(conversar(intruso.controller, id, "Hola")).rejects.toMatchObject({
      constructor: ErrorDeAplicacion,
      codigo: "conversacion_no_encontrada",
    });
    expect(await duenio.conversaciones.mensajes(id)).toHaveLength(2);
  });
});

describe("ChatController.responder — límite de uso", () => {
  it("al pasar el límite por minuto corta con «limite_por_minuto», sin guardar ni consultar al modelo", async () => {
    const modelo = modeloQueResponde("Ok.");
    const { conversaciones, controller } = await alumnoConChat({
      crearModelo: () => modelo,
      limites: { porMinuto: 1, porDia: 100 },
    });
    const id = randomUUID();
    await conversar(controller, id, "Primero");
    await mensajesGuardados(conversaciones, id, 2);

    await expect(conversar(controller, id, "Segundo")).rejects.toMatchObject({
      codigo: "limite_por_minuto",
      mensajePublico: expect.stringContaining("Esperá un minuto"),
    });
    expect(await conversaciones.mensajes(id)).toHaveLength(2);
    expect(modelo.doStreamCalls).toHaveLength(1);
  });

  it("al pasar el límite del día corta con «limite_por_dia» (que no se puede reintentar)", async () => {
    const { controller } = await alumnoConChat({
      crearModelo: () => modeloQueResponde("Ok."),
      limites: { porMinuto: 100, porDia: 1 },
    });
    const id = randomUUID();
    await conversar(controller, id, "Primero");

    await expect(conversar(controller, id, "Segundo")).rejects.toMatchObject({ codigo: "limite_por_dia" });
  });
});
