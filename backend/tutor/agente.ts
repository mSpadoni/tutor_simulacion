import "server-only";
import { randomUUID } from "node:crypto";
import { convertToModelMessages, smoothStream, stepCountIs, streamText, type LanguageModel } from "ai";
import { armarSystemPrompt } from "@/backend/lib/prompts/systemPrompt";
import type { ToolsDelTutor } from "@/backend/tools/tutor.tools";
import { timeoutComoError, traducirError } from "@/backend/tutor/errores";
import type { TutorUIMessage } from "@/shared/chat";

// El agente: todo lo que tiene que ver con el LLM (prompt, tools, pasos, streaming, log).
// No sabe de conversaciones ni de la base: recibe los mensajes y avisa cuando termina la respuesta.

/** Máximo de pasos por respuesta: hasta 3 rondas de tools y la respuesta final. Evita loops sin fin. */
const MAXIMO_DE_PASOS = 4;

/**
 * El modelo manda el texto en ráfagas irregulares; así la respuesta se lee más cómoda: sale palabra por palabra,
 * a un ritmo parejo (~30 palabras por segundo).
 */
export const PAUSA_ENTRE_PALABRAS_MS = 30;

export type PedidoAlAgente = {
  modelo: LanguageModel;
  /** La conversación hasta ahora, con el mensaje nuevo del alumno al final. */
  mensajes: TutorUIMessage[];
  tools: ToolsDelTutor;
  timeoutMs: number;
  /** Pausa entre palabras al mostrar la respuesta (ms). 0 = tan rápido como llega del modelo. */
  pausaEntrePalabrasMs: number;
  /** Se llama con la respuesta completa del tutor (o lo que llegó si el alumno la cortó). */
  alTerminar: (respuesta: TutorUIMessage) => Promise<void>;
};

/**
 * Para el contexto del modelo, de los mensajes anteriores solo va el texto: lo que devolvieron las tools
 * (modelos, enunciados) ocupa miles de tokens y, si lo necesita otra vez, el modelo vuelve a pedirlo.
 * En la base se guarda todo, para mostrarlo al reabrir la conversación.
 */
function soloTexto(mensaje: TutorUIMessage): TutorUIMessage {
  return { ...mensaje, parts: mensaje.parts.filter((parte) => parte.type === "text") };
}

/**
 * Le pide la respuesta al modelo y la devuelve como stream de partes (el formato que entiende useChat).
 * El modelo decide qué tools usar según lo que pide el alumno: acá no se elige por él.
 * Si el modelo falla en el medio, el error llega dentro del stream con el mensaje para el alumno.
 */
export async function responderComoTutor({
  modelo,
  mensajes,
  tools,
  timeoutMs,
  pausaEntrePalabrasMs,
  alTerminar,
}: PedidoAlAgente) {
  const inicio = Date.now();
  const resultado = streamText({
    model: modelo,
    system: armarSystemPrompt(),
    messages: await convertToModelMessages(mensajes.map(soloTexto)),
    tools,
    toolChoice: "auto", // el modelo decide si usa tools y cuáles
    stopWhen: stepCountIs(MAXIMO_DE_PASOS),
    maxOutputTokens: 2000,
    maxRetries: 1,
    timeout: timeoutMs,
    // Palabra por palabra, con una pausa pareja entre cada una.
    experimental_transform: smoothStream({ delayInMs: pausaEntrePalabrasMs, chunking: "word" }),
    onFinish: ({ steps, totalUsage }) => {
      // Log en formato JSON con datos útiles de cada respuesta (demora, pasos, tokens, tools usadas).
      const herramientas = steps.flatMap((paso) =>
        paso.toolCalls.map((llamada) => ({ nombre: llamada.toolName, entrada: llamada.input }))
      );
      console.info(
        JSON.stringify({
          evento: "chat.respuesta",
          ms: Date.now() - inicio,
          pasos: steps.length,
          tokens: totalUsage.totalTokens,
          herramientas,
        })
      );
    },
  });

  return resultado
    .toUIMessageStream<TutorUIMessage>({
      originalMessages: mensajes,
      generateMessageId: randomUUID,
      onFinish: async ({ responseMessage }) => {
        if (responseMessage.parts.length > 0) await alTerminar(responseMessage);
      },
      // Cualquier error del modelo llega al alumno con un mensaje entendible, sin detalles técnicos.
      onError: (error) => traducirError(error).mensajeParaAlumno,
    })
    .pipeThrough(timeoutComoError());
}
