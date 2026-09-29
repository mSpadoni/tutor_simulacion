import { isToolUIPart } from "ai";
import type { NombreDeHerramienta, ParteDelTutor } from "@/shared/chat";
import { leerErrorPublico, type ErrorPublico } from "@/shared/errores";

/**
 * El error del chat como lo muestra la vista: su código (para decidir qué ofrecer, ej. "Reintentar") y el mensaje
 * para el alumno. useChat pone en `error.message` el cuerpo de la respuesta (si falló antes de empezar) o el texto
 * del error del stream (si falló en el medio): en los dos casos el servidor manda `{ error: { codigo, mensaje } }`.
 */
export function errorParaMostrar(error: Error | undefined): ErrorPublico {
  const delServidor = error?.message ? leerErrorPublico(error.message) : null;
  if (delServidor) return delServidor;
  // No vino del servidor: el pedido no llegó (sin internet, servidor caído) o algo que no conocemos. Nunca se muestra
  // el texto crudo del error.
  return {
    codigo: "sin_conexion",
    mensaje: "No pudimos contactar al tutor. Revisá tu conexión y probá de nuevo.",
  };
}

/**
 * ¿El alumno está mirando el final de la conversación? (a menos de `margen` píxeles del fondo)
 * Si está ahí, el chat lo acompaña mientras llega la respuesta; si subió a leer algo, no se lo mueve.
 */
export function estaCercaDelFinal(
  { scrollTop, scrollHeight, clientHeight }: { scrollTop: number; scrollHeight: number; clientHeight: number },
  margen = 80
): boolean {
  return scrollHeight - scrollTop - clientHeight <= margen;
}

/**
 * Un cuadro de la animación que acompaña al texto: avanza una parte de lo que falta hasta el final (al principio
 * más rápido, cerca del final más despacio) y al menos 1 px, para que siempre termine de llegar.
 * `fraccion` controla la velocidad: 0.06 ≈ un deslizamiento suave, sin saltos.
 */
export function siguienteScroll(actual: number, objetivo: number, fraccion = 0.06): number {
  const falta = objetivo - actual;
  if (falta <= 1) return objetivo;
  return actual + Math.max(1, falta * fraccion);
}

/**
 * Qué le mostramos al alumno mientras el tutor usa cada tool, y cuando ya la usó (heurística #1).
 * Tipado con los nombres reales de las tools: si se agrega o renombra una, esto deja de compilar hasta tener su texto.
 */
export const TEXTOS_DE_HERRAMIENTAS: Record<NombreDeHerramienta, { usando: string; usada: string }> = {
  consultar_modelos: {
    usando: "Consultando los modelos de la cátedra…",
    usada: "Consultó los modelos de la cátedra",
  },
  buscar_ejercicio: {
    usando: "Buscando el ejercicio en el material de la cátedra…",
    usada: "Buscó el ejercicio en el material de la cátedra",
  },
  inspiracion_para_ejercicio: {
    usando: "Buscando ejercicios de la cátedra para inspirarse…",
    usada: "Se inspiró en ejercicios de la cátedra",
  },
  generar_diagrama_flujo: {
    usando: "Dibujando el diagrama de flujo…",
    usada: "Dibujó el diagrama de flujo",
  },
  generar_ejercicio: {
    usando: "Guardando el ejercicio en «Mis ejercicios»…",
    usada: "Guardó el ejercicio en «Mis ejercicios»",
  },
  verificar_fdp: {
    usando: "Verificando la f.d.p. con cálculo numérico…",
    usada: "Verificó la f.d.p. con cálculo numérico",
  },
};

/** Un diagrama listo para mostrar: el SVG va como data URL en un <img> (así el navegador no ejecuta nada de adentro). */
export type DiagramaParaMostrar = { titulo: string; mermaid: string; src: string };

/**
 * Si la parte del mensaje es un diagrama que Kroki generó bien, sus datos para mostrarlo; si no, null
 * (todavía se está generando, o falló: eso lo muestra el aviso de la tool).
 */
export function diagramaDe(parte: ParteDelTutor): DiagramaParaMostrar | null {
  if (parte.type !== "tool-generar_diagrama_flujo" || parte.state !== "output-available") return null;
  const salida = parte.output; // tipado: el resultado de generarDiagramaFlujo (DiagramaGenerado)
  if (!salida.ok) return null;
  return {
    titulo: salida.titulo,
    mermaid: salida.mermaid,
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(salida.svg)}`,
  };
}

/** ¿La tool terminó pero falló? (ej. el diagrama no se pudo generar) — para mostrar el aviso con ⚠. */
export function herramientaFallo(parte: ParteDelTutor): boolean {
  if (!isToolUIPart(parte)) return false;
  if (parte.state === "output-error") return true;
  if (parte.state !== "output-available") return false;
  // Algunas tools devuelven texto (las del material) y otras un resultado { ok, ... }.
  const salida: unknown = parte.output;
  return typeof salida === "object" && salida !== null && "ok" in salida && salida.ok === false;
}
