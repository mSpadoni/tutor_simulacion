import type { EjercicioParaMostrar } from "./tipos";

/** Un ejercicio nuevo tal como quedó guardado en «Mis ejercicios»: título, enunciado y el «Se pide:». */
export function EjercicioNuevo({ ejercicio }: { ejercicio: EjercicioParaMostrar }) {
  return (
    <article aria-label={`Ejercicio: ${ejercicio.titulo}`} className="my-2 space-y-2">
      <p className="font-semibold">{ejercicio.titulo}</p>
      <p className="whitespace-pre-wrap">{ejercicio.enunciado}</p>
      <div>
        <p className="font-medium">Se pide:</p>
        <ol className="list-[lower-alpha] space-y-0.5 pl-6">
          {ejercicio.sePide.map((consigna, indice) => (
            <li key={indice}>{consigna}</li>
          ))}
        </ol>
      </div>
    </article>
  );
}
