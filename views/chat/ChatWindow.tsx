// "use client": corre en el navegador, porque maneja estado (mensajes, lo que se escribe) y clicks.
"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { MAX_MENSAJES_CONTEXTO, type MensajeChat } from "./tipos";

// Una sugerencia por modo del tutor: le muestra al alumno qué puede pedir (heurística #10).
const SUGERENCIAS = [
  { titulo: "Dame un ejercicio nuevo", mensaje: "Dame un ejercicio nuevo para practicar." },
  { titulo: "Corregí mi resolución", mensaje: "Quiero que me corrijas una resolución. Te la paso:" },
  { titulo: "Tengo una duda teórica", mensaje: "Tengo una duda teórica: " },
];

// En qué situación está el chat: listo para escribir, esperando al tutor, o con un error (que trae su mensaje).
// Es una unión de objetos: según `tipo`, TypeScript sabe si existe `mensaje` o no.
type Estado = { tipo: "listo" } | { tipo: "esperando" } | { tipo: "error"; mensaje: string };

/** La ventana de chat completa: lista de mensajes, sugerencias iniciales, errores y el campo para escribir. */
export default function ChatWindow({ nombre }: { nombre: string }) {
  // useState guarda un valor que, al cambiar, hace que React vuelva a dibujar el componente.
  // `const [valor, setValor] = useState(inicial)`: desestructuración de array → el valor actual y la función para cambiarlo.
  // `useState<MensajeChat[]>([])`: el <...> indica el tipo (lista de mensajes); arranca vacía.
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [borrador, setBorrador] = useState(""); // Lo que el alumno está escribiendo y todavía no mandó.
  const [estado, setEstado] = useState<Estado>({ tipo: "listo" });
  // useRef guarda una referencia a un elemento HTML real (sin redibujar al cambiar). Se conecta con `ref={...}` en el JSX.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const finDeLaListaRef = useRef<HTMLDivElement>(null);

  // useEffect ejecuta código después de dibujar. El array del final ([mensajes, estado]) dice cuándo:
  // cada vez que cambie alguno de esos dos. Acá: scrollear hasta el último mensaje.
  useEffect(() => {
    finDeLaListaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, estado]);

  /** Manda la conversación a /api/chat y agrega la respuesta del tutor (o muestra el error). */
  async function consultarAlTutor(conversacion: MensajeChat[]) {
    setEstado({ tipo: "esperando" });
    try {
      // fetch hace el pedido HTTP al servidor. Se mandan solo los últimos MAX_MENSAJES_CONTEXTO mensajes (slice con número negativo).
      const respuesta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: conversacion.slice(-MAX_MENSAJES_CONTEXTO) }),
      });
      // Lee el JSON de la respuesta; si no se puede leer, usa un objeto vacío `({})` (los paréntesis son para que
      // la flecha devuelva el objeto y no lo confunda con un bloque de código).
      const datos: { respuesta?: string; error?: string } = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok || !datos.respuesta) {
        setEstado({ tipo: "error", mensaje: datos.error ?? "No pudimos contactar al tutor. Probá de nuevo." });
        return;
      }
      // En React no se modifica la lista existente: se crea una nueva (spread `...` + el mensaje del tutor al final).
      setMensajes([...conversacion, { rol: "tutor", contenido: datos.respuesta }]);
      setEstado({ tipo: "listo" });
    } catch {
      // fetch solo tira error si ni siquiera pudo conectarse (sin internet, servidor apagado).
      setEstado({ tipo: "error", mensaje: "No hay conexión con el servidor. Revisá tu internet y probá de nuevo." });
    } finally {
      // `finally` corre siempre, haya salido bien o mal: devuelve el cursor al campo de texto.
      textareaRef.current?.focus();
    }
  }

  /** Agrega el mensaje del alumno a la lista, vacía el campo y le pregunta al tutor. */
  function enviar() {
    const conversacion: MensajeChat[] = [...mensajes, { rol: "alumno", contenido: borrador.trim() }];
    setMensajes(conversacion);
    setBorrador("");
    // `void`: se lanza la consulta sin esperarla (sin await); la pantalla se actualiza sola cuando responde.
    void consultarAlTutor(conversacion);
  }

  /** Qué hacer al tocar uno de los botones de sugerencia de la pantalla inicial. */
  function usarSugerencia(mensaje: string) {
    // "Dame un ejercicio" se manda directo; las otras dos necesitan que el alumno complete su parte.
    if (mensaje.endsWith(".")) {
      const conversacion: MensajeChat[] = [{ rol: "alumno", contenido: mensaje }];
      setMensajes(conversacion);
      void consultarAlTutor(conversacion);
    } else {
      setBorrador(mensaje);
      textareaRef.current?.focus();
    }
  }

  /** Borra la charla (previa confirmación) y deja el chat como recién abierto. */
  function nuevaConversacion() {
    // Borrar la charla es la única acción destructiva del chat: por eso sí pide confirmación.
    if (!window.confirm("¿Empezar una conversación nueva? Se borra lo que hablaste hasta ahora.")) return;
    setMensajes([]);
    setBorrador("");
    setEstado({ tipo: "listo" });
    textareaRef.current?.focus();
  }

  const esperando = estado.tipo === "esperando";

  return (
    <section aria-labelledby="titulo-conversacion" className="flex min-h-0 flex-1 flex-col">
      <h2 id="titulo-conversacion" className="sr-only">
        Conversación con el tutor
      </h2>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {mensajes.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={nuevaConversacion}
                disabled={esperando}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                Nueva conversación
              </button>
            </div>
          )}

          {mensajes.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-lg font-medium text-slate-900">Hola, {nombre}. ¿Qué querés hacer?</p>
              <p className="mt-1 text-sm text-slate-600">Elegí una opción o escribí directamente lo que necesites.</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                {/* .map dibuja un botón por sugerencia. `key` es obligatorio en listas: React lo usa para identificar cada ítem. */}
                {SUGERENCIAS.map((sugerencia) => (
                  <li key={sugerencia.titulo}>
                    <button
                      type="button"
                      // `() => ...`: se pasa una función que se ejecuta al hacer click (no se ejecuta al dibujar).
                      onClick={() => usarSugerencia(sugerencia.mensaje)}
                      className="h-full w-full rounded-lg border border-slate-300 px-3 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-blue-700 hover:bg-blue-50"
                    >
                      {sugerencia.titulo}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* role="log": los lectores de pantalla anuncian cada mensaje nuevo sin interrumpir (aria-live polite). */}
          <ol role="log" aria-label="Mensajes" className="flex flex-col gap-4">
            {mensajes.map((mensaje, indice) => (
              <MessageBubble key={indice} mensaje={mensaje} />
            ))}
          </ol>

          <div role="status" className="text-sm text-slate-700">
            {esperando && (
              <p className="flex items-center gap-2">
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-blue-700" />
                El tutor está pensando…
              </p>
            )}
          </div>

          {estado.tipo === "error" && (
            <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-medium">
                <span aria-hidden="true">⚠ </span>
                {estado.mensaje}
              </p>
              <button
                type="button"
                // Reintentar vuelve a mandar la misma conversación (el último mensaje del alumno ya está en la lista).
                onClick={() => void consultarAlTutor(mensajes)}
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
          onEnviar={enviar}
          deshabilitado={esperando}
          textareaRef={textareaRef}
        />
      </div>
    </section>
  );
}
