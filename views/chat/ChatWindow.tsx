// "use client": corre en el navegador, porque maneja estado (mensajes, lo que se escribe) y clicks.
"use client";

import { useCallback, useRef, useState } from "react";
import type { TutorUIMessage } from "@/shared/chat";
import Atajos from "./Atajos";
import AvisoDeError from "./AvisoDeError";
import { useChatDelTutor } from "./hooks/useChatDelTutor";
import { useSeguirAlFinal } from "./hooks/useSeguirAlFinal";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import PanelDeDebug from "./PanelDeDebug";
import { atajoEstaCompleto } from "./respuesta";

type Props = {
  /** Id de la conversación (lo genera el servidor al abrir una nueva; se guarda con el primer mensaje). */
  conversacionId: string;
  /** El historial, leído de la base una sola vez al abrir la conversación. */
  mensajesIniciales: TutorUIMessage[];
  nombre: string;
};

/**
 * La ventana de chat: mensajes con la respuesta en streaming, avisos de estado, errores, el campo para escribir,
 * los atajos y el panel de debug. La conversación la maneja useChatDelTutor y el scroll, useSeguirAlFinal.
 */
export default function ChatWindow({ conversacionId, mensajesIniciales, nombre }: Props) {
  const { messages, status, error, stop, regenerate, enviar, anuncio, generando } = useChatDelTutor(
    conversacionId,
    mensajesIniciales
  );
  const { zonaRef, alScrollear, volverAlFinal } = useSeguirAlFinal(messages, status);
  const [borrador, setBorrador] = useState(""); // Lo que el alumno está escribiendo y todavía no mandó.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [debugAbierto, setDebugAbierto] = useState(false); // El panel de debug arranca plegado.
  const botonDebugRef = useRef<HTMLButtonElement>(null);

  // useCallback: la misma función en cada render (el panel la usa en un efecto y no tiene que re-ejecutarlo con
  // cada palabra que llega). Al cerrar, el foco vuelve al botón que lo abrió.
  const cerrarDebug = useCallback(() => {
    setDebugAbierto(false);
    botonDebugRef.current?.focus();
  }, []);

  /** Manda un mensaje del alumno (el del campo o el de un atajo). */
  function mandar(texto: string) {
    if (!texto.trim() || generando) return;
    volverAlFinal(); // Al mandar un mensaje, se vuelve al final para ver la respuesta.
    enviar(texto.trim());
    setBorrador("");
    textareaRef.current?.focus();
  }

  /** Un atajo: se manda directo si está completo, o se pone en el campo para que el alumno lo termine. */
  function usarAtajo(mensaje: string) {
    if (atajoEstaCompleto(mensaje)) {
      mandar(mensaje);
    } else {
      setBorrador(mensaje);
      textareaRef.current?.focus();
    }
  }

  return (
    <>
      <main id="chat" className="flex min-h-0 flex-1 flex-col">
        <section aria-labelledby="titulo-conversacion" className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-1.5">
            <h2 id="titulo-conversacion" className="text-sm font-medium text-slate-700">
              Conversación con el tutor
            </h2>
            {/* Botón con texto: muestra qué tools usó el modelo, tokens y demora (bonus del challenge). */}
            <button
              ref={botonDebugRef}
              type="button"
              onClick={() => (debugAbierto ? cerrarDebug() : setDebugAbierto(true))}
              aria-expanded={debugAbierto}
              aria-controls="panel-debug"
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100"
            >
              <span aria-hidden="true">🛠 </span>
              {debugAbierto ? "Ocultar debug" : "Ver debug"}
            </button>
          </div>

          <div
            ref={zonaRef}
            onScroll={(evento) => alScrollear(evento.currentTarget)}
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-lg font-medium text-slate-900">Hola, {nombre}. ¿Qué querés hacer?</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Escribí lo que necesites o usá uno de los atajos de abajo: pedir un ejercicio, corregir tu
                    resolución, resolver una f.d.p. o preguntar teoría.
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

              {error && <AvisoDeError error={error} onReintentar={() => void regenerate()} />}
            </div>
          </div>

          <div className="mx-auto w-full max-w-3xl">
            <MessageInput
              valor={borrador}
              onCambio={setBorrador}
              onEnviar={() => mandar(borrador)}
              onDetener={stop}
              generando={generando}
              textareaRef={textareaRef}
            />
            <Atajos onUsar={usarAtajo} deshabilitados={generando} />
          </div>
        </section>
      </main>
      <PanelDeDebug id="panel-debug" mensajes={messages} abierto={debugAbierto} onCerrar={cerrarDebug} />
    </>
  );
}
