import { mensajeDeError } from "./tipos";

type Props = { error: Error; onReintentar: () => void };

/** Qué pasó (en palabras del alumno, no técnicas) y cómo seguir (heurística #9). */
export default function AvisoDeError({ error, onReintentar }: Props) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
      <p className="font-medium">
        <span aria-hidden="true">⚠ </span>
        {mensajeDeError(error)}
      </p>
      <button
        type="button"
        // Reintentar vuelve a pedir la respuesta al último mensaje (el servidor no lo guarda dos veces).
        onClick={onReintentar}
        className="mt-2 rounded-lg border border-red-400 bg-white px-3 py-1.5 font-medium text-red-900 hover:bg-red-100"
      >
        Reintentar
      </button>
    </div>
  );
}
