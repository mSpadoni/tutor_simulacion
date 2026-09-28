import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MensajeChat } from "./tipos";

// react-markdown no renderiza HTML crudo: lo que escriba el modelo no puede inyectar scripts.
// Este objeto dice cómo dibujar cada elemento del Markdown (párrafo, lista, tabla...) con estilos propios.
// `(props) => <p ... {...props} />`: recibe las props que arma react-markdown (incluido el texto) y las pasa
// todas al elemento con el spread `{...props}`, agregándole la clase de estilos.
const componentesMarkdown: Components = {
  p: (props) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
  ul: (props) => <ul className="my-2 list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-6" {...props} />,
  h1: (props) => <p className="mt-3 mb-1 font-semibold" {...props} />,
  h2: (props) => <p className="mt-3 mb-1 font-semibold" {...props} />,
  h3: (props) => <p className="mt-3 mb-1 font-semibold" {...props} />,
  code: (props) => <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em]" {...props} />,
  pre: (props) => <pre className="my-2 overflow-x-auto rounded-lg bg-slate-100 p-3 text-sm" {...props} />,
  // La T.E.I. llega como tabla: con scroll horizontal propio para no romper el layout en mobile.
  table: (props) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  th: (props) => <th className="border border-slate-300 bg-slate-100 px-2 py-1 font-semibold" {...props} />,
  td: (props) => <td className="border border-slate-300 px-2 py-1 align-top" {...props} />,
  // El tutor marca el error principal como "> ⚠ ...": se destaca con borde, fondo y el ícono (no solo color).
  blockquote: (props) => (
    <blockquote
      className="my-3 rounded-r-lg border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-amber-950"
      {...props}
    />
  ),
  a: (props) => <a className="text-blue-700 underline" target="_blank" rel="noreferrer" {...props} />,
};

/**
 * Un globo de mensaje del chat. Los del alumno van a la derecha como texto plano;
 * los del tutor a la izquierda, con el Markdown convertido a HTML (tablas, listas, negritas...).
 */
export default function MessageBubble({ mensaje }: { mensaje: MensajeChat }) {
  const esAlumno = mensaje.rol === "alumno";

  return (
    // Las clases se arman con un template string: `${condición ? "a" : "b"}` agrega una u otra según quién escribió.
    <li className={`flex flex-col ${esAlumno ? "items-end" : "items-start"}`}>
      {/* El rol va como texto visible, no solo con color o posición. */}
      <span className="mb-1 px-1 text-xs font-medium text-slate-600">{esAlumno ? "Vos" : "Tutor"}</span>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 leading-relaxed sm:max-w-[80%] ${
          esAlumno ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-900"
        }`}
      >
        {esAlumno ? (
          <p className="whitespace-pre-wrap">{mensaje.contenido}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentesMarkdown}>
            {mensaje.contenido}
          </ReactMarkdown>
        )}
      </div>
    </li>
  );
}
