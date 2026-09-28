// "use client": corre en el navegador, porque maneja estado (mensajes, lo que se escribe) y clicks.
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { mensajeDeError } from "./tipos";

// Atajos siempre visibles debajo del campo: el alumno puede cambiar de tarea en cualquier momento (heurística #6,
// reconocer antes que recordar). Los que terminan en ":" o en espacio se completan antes de mandar.
const ATAJOS = [
  { titulo: "Dame un ejercicio tipo parcial", mensaje: "Dame un ejercicio nuevo para practicar, tipo parcial." },
  { titulo: "Corregí mi resolución", mensaje: "Corregime esta resolución: " },
  { titulo: "Resolvé esta f.d.p.", mensaje: "Resolveme esta f.d.p.: " },
  { titulo: "Tengo una duda teórica", mensaje: "Tengo una duda teórica: " },
];

type Props = {
  /** Id de la conversación (lo genera el servidor al abrir una nueva; se guarda con el primer mensaje). */
  conversacionId: string;
  /** El historial, leído de la base una sola vez al abrir la conversación. */
  mensajesIniciales: UIMessage[];
  nombre: string;
};

/**
 * La ventana de chat: mensajes con la respuesta en streaming, avisos de estado, errores, el campo para escribir
 * y los atajos. useChat (Vercel AI SDK) mantiene la conversación en el navegador mientras está abierta; cada
 * mensaje nuevo lo guarda el servidor en la base.
 */
export default function ChatWindow({ conversacionId, mensajesIniciales, nombre }: Props) {
  const router = useRouter();
  const [borrador, setBorrador] = useState(""); // Lo que el alumno está escribiendo y todavía no mandó.
  const [anuncio, setAnuncio] = useState(""); // Lo que lee el lector de pantalla cuando termina una respuesta.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const finDeLaListaRef = useRef<HTMLDivElement>(null);

  // El transporte se crea una sola vez (useState con función). Manda solo el mensaje nuevo y el id de la
  // conversación: el servidor lee el historial de la base.
  const [transporte] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({ body: { id, mensaje: messages.at(-1) } }),
      })
  );

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    id: conversacionId,
    messages: mensajesIniciales,
    transport: transporte,
    onFinish: ({ message, isAbort, isError }) => {
      if (!isAbort && !isError) {
        const texto = message.parts.flatMap((parte) => (parte.type === "text" ? [parte.text] : [])).join(" ");
        setAnuncio(`El tutor respondió: ${texto}`);
      }
      // Actualiza la lista de conversaciones del costado (la nueva aparece, la actual sube arriba).
      router.refresh();
    },
  });

  const generando = status === "submitted" || status === "streaming";

  // Cada vez que cambian los mensajes o el estado, scrollea hasta el final.
  useEffect(() => {
    finDeLaListaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  /** Manda un mensaje del alumno (el del campo o el de un atajo). */
  function enviar(texto: string) {
    if (!texto.trim() || generando) return;
    setAnuncio("");
    void sendMessage({ text: texto.trim() });
    setBorrador("");
    textareaRef.current?.focus();
  }

  /** Un atajo: se manda directo si está completo, o se pone en el campo para que el alumno lo termine. */
  function usarAtajo(mensaje: string) {
    if (mensaje.endsWith(".")) {
      enviar(mensaje);
    } else {
      setBorrador(mensaje);
      textareaRef.current?.focus();
    }
  }

  return (
    <section aria-labelledby="titulo-conversacion" className="flex min-h-0 flex-1 flex-col">
      <h2 id="titulo-conversacion" className="sr-only">
        Conversación con el tutor
      </h2>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-lg font-medium text-slate-900">Hola, {nombre}. ¿Qué querés hacer?</p>
              <p className="mt-1 text-sm text-slate-600">
                Escribí lo que necesites o usá uno de los atajos de abajo: pedir un ejercicio, corregir tu resolución,
                resolver una f.d.p. o preguntar teoría.
              </p>
            </div>
          )}

          {/* aria-live="off": mientras la respuesta llega palabra por palabra no se anuncia (sería ruido).
              La respuesta completa la anuncia la región de abajo cuando termina. */}
          <ol aria-label="Mensajes" aria-live="off" className="flex flex-col gap-4">
            {messages.map((mensaje) => (
              <MessageBubble key={mensaje.id} mensaje={mensaje} />
            ))}
          </ol>

          {/* Estado visible con texto, no solo una animación (heurística #1). */}
          <div role="status" className="text-sm text-slate-700">
            {status === "submitted" && (
              <p className="flex items-center gap-2">
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-blue-700" />
                El tutor está pensando…
              </p>
            )}
          </div>
          <p aria-live="polite" className="sr-only">
            {anuncio}
          </p>

          {error && (
            <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-medium">
                <span aria-hidden="true">⚠ </span>
                {mensajeDeError(error)}
              </p>
              <button
                type="button"
                // Reintentar vuelve a pedir la respuesta al último mensaje (el servidor no lo guarda dos veces).
                onClick={() => void regenerate()}
                className="mt-2 rounded-lg border border-red-400 bg-white px-3 py-1.5 font-medium text-red-900 hover:bg-red-100"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Div vacío al final de la lista: el useEffect de arriba scrollea hasta acá. */}
          <div ref={finDeLaListaRef} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <MessageInput
          valor={borrador}
          onCambio={setBorrador}
          onEnviar={() => enviar(borrador)}
          onDetener={stop}
          generando={generando}
          textareaRef={textareaRef}
        />
        {/* Atajos chicos debajo del campo, siempre a mano. */}
        <ul aria-label="Atajos" className="flex flex-wrap gap-2 bg-white px-4 pb-3">
          {ATAJOS.map((atajo) => (
            <li key={atajo.titulo}>
              <button
                type="button"
                onClick={() => usarAtajo(atajo.mensaje)}
                disabled={generando}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-700 hover:bg-blue-50 disabled:opacity-60"
              >
                {atajo.titulo}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
