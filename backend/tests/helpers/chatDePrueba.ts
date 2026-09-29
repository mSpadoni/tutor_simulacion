import { randomUUID } from "node:crypto";
import { ChatController } from "@/backend/controllers/chat.controller";
import { ConversacionesModel } from "@/backend/models/repositorios/conversaciones.model";
import { EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";
import type { MetadatosDeRespuesta, TutorUIMessage } from "@/shared/chat";
import { leerErrorPublico } from "@/shared/errores";
import { crearAlumnoLogueado } from "./alumnoDePrueba";

// Lo que comparten los tests del chat (con el modelo de prueba y con el real): un alumno con su controller,
// mandar un mensaje como useChat y leer lo que quedó guardado.

/** Un alumno logueado, sus models y un ChatController que guarda con su sesión. */
export async function alumnoConChat(dependencias: ConstructorParameters<typeof ChatController>[0] = {}) {
  const alumno = await crearAlumnoLogueado();
  const conversaciones = new ConversacionesModel(alumno.navegador.crearCliente);
  const ejercicios = new EjerciciosModel(alumno.navegador.crearCliente);
  const controller = new ChatController({
    conversaciones: () => conversaciones,
    ejercicios: () => ejercicios,
    ...dependencias,
  });
  return { alumno, conversaciones, ejercicios, controller };
}

/** Lo que miran los tests de cada evento del stream (cada tipo de evento trae solo algunos de estos campos). */
export type Evento = { type: string; errorText?: string; delta?: string; messageMetadata?: MetadatosDeRespuesta };

/** Manda un mensaje como useChat (el cuerpo tal cual lo manda el navegador), lee el stream y devuelve sus eventos. */
export async function conversar(controller: ChatController, conversacionId: string, texto: string) {
  const cuerpo = {
    id: conversacionId,
    mensaje: { id: randomUUID(), role: "user", parts: [{ type: "text", text: texto }] },
  };
  const lector = (await controller.responder(cuerpo)).getReader();
  const eventos: Evento[] = [];
  for (let leido = await lector.read(); !leido.done; leido = await lector.read()) eventos.push(leido.value);
  return eventos;
}

/** El código del error que llegó dentro del stream (el navegador lo lee igual). */
export const codigoDelError = (eventos: Evento[]) =>
  leerErrorPublico(eventos.find((evento) => evento.type === "error")?.errorText ?? "")?.codigo;

/**
 * Espera a que haya al menos `cantidad` mensajes guardados y los devuelve. La respuesta del tutor se guarda al
 * terminar el stream (en su onFinish): se espera esa condición, con un tope, en vez de un tiempo fijo.
 */
export async function mensajesGuardados(conversaciones: ConversacionesModel, id: string, cantidad: number) {
  for (let intento = 0; intento < 20; intento++) {
    const mensajes = await conversaciones.mensajes(id);
    if (mensajes.length >= cantidad) return mensajes;
    await new Promise((listo) => setTimeout(listo, 150));
  }
  return conversaciones.mensajes(id);
}

/** Qué tools usó el tutor en un mensaje guardado (sus partes "tool-<nombre>"), sin repetir. */
export const herramientas = (mensaje: TutorUIMessage) => [
  ...new Set(mensaje.parts.filter((parte) => parte.type.startsWith("tool-")).map((parte) => parte.type.slice(5))),
];
