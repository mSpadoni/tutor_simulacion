"use client";

import { Suspense, use, useSyncExternalStore } from "react";
import type { DiagramaParaMostrar } from "./tipos";

/**
 * Un diagrama de flujo generado con Kroki. Va como <img> (el SVG no se inserta como HTML, así no se ejecuta nada
 * que venga adentro), con un alt que dice de qué es, la fuente citada y el Mermaid como alternativa en texto.
 */
export function DiagramaDeFlujo({ diagrama }: { diagrama: DiagramaParaMostrar }) {
  return (
    <figure className="my-2 rounded-lg border border-slate-200 bg-white p-2">
      <div className="overflow-x-auto">
        {/* eslint-disable-next-line @next/next/no-img-element -- es un data URL generado en el momento. */}
        <img src={diagrama.src} alt={`Diagrama de flujo: ${diagrama.titulo}`} className="mx-auto max-w-none" />
      </div>
      <figcaption className="mt-2 text-xs text-slate-600">
        {diagrama.titulo} · Renderizado con{" "}
        <a href="https://kroki.io" target="_blank" rel="noreferrer" className="text-blue-700 underline">
          Kroki
        </a>
        <details className="mt-1">
          <summary className="cursor-pointer text-slate-700">Ver como texto (Mermaid)</summary>
          <pre className="mt-1 overflow-x-auto rounded bg-slate-100 p-2 text-[0.8rem]">{diagrama.mermaid}</pre>
        </details>
      </figcaption>
    </figure>
  );
}

/** Si la respuesta de POST /api/diagrama trae un diagrama generado, sus datos para mostrarlo; si no, null. */
export function diagramaDeLaRespuesta(datos: unknown): DiagramaParaMostrar | null {
  if (typeof datos !== "object" || datos === null) return null;
  const { ok, titulo, mermaid, svg } = datos as Record<string, unknown>;
  if (ok !== true || typeof svg !== "string" || typeof mermaid !== "string") return null;
  return {
    titulo: typeof titulo === "string" ? titulo : "Diagrama de flujo",
    mermaid,
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  };
}

// Un pedido por código: si el mismo diagrama se vuelve a mostrar (otro render, reabrir la conversación), se reusa.
const pedidos = new Map<string, Promise<DiagramaParaMostrar | null>>();

/** Le pide a Kroki (a través de la app) el diagrama. Si algo falla, null: se muestra el código. */
function pedirDiagrama(mermaid: string): Promise<DiagramaParaMostrar | null> {
  let pedido = pedidos.get(mermaid);
  if (!pedido) {
    pedido = fetch("/api/diagrama", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mermaid }),
    })
      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))
      .then(diagramaDeLaRespuesta)
      .catch(() => null);
    pedidos.set(mermaid, pedido);
  }
  return pedido;
}

/** El código tal cual, cuando no hay imagen (todavía, o porque no se pudo generar). */
function CodigoDelDiagrama({ mermaid, aviso }: { mermaid: string; aviso: string }) {
  return (
    <div className="my-2">
      <p className="text-xs text-slate-600" role="status">
        {aviso}
      </p>
      <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-100 p-3 text-sm">{mermaid}</pre>
    </div>
  );
}

function DiagramaPedido({ mermaid }: { mermaid: string }) {
  // use(): suspende hasta que llega la respuesta (el <Suspense> de arriba muestra el aviso mientras tanto).
  const diagrama = use(pedirDiagrama(mermaid));
  if (!diagrama) return <CodigoDelDiagrama mermaid={mermaid} aviso="No se pudo dibujar este diagrama:" />;
  return <DiagramaDeFlujo diagrama={diagrama} />;
}

// En el servidor (y en el primer render del navegador, para que coincidan) no se pide nada: la ruta es relativa
// al navegador. useSyncExternalStore devuelve false en ese momento y true después, sin useEffect.
const sinSuscripcion = () => () => {};
const useEnElNavegador = () =>
  useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false
  );

/** Un diagrama que el tutor escribió como código en el texto: se muestra como imagen, igual que el de la tool. */
export function DiagramaDelTexto({ mermaid }: { mermaid: string }) {
  const aviso = <CodigoDelDiagrama mermaid={mermaid} aviso="Dibujando el diagrama…" />;
  if (!useEnElNavegador()) return aviso;
  return (
    <Suspense fallback={aviso}>
      <DiagramaPedido mermaid={mermaid} />
    </Suspense>
  );
}
