import type { UIMessage } from "ai";
import { z } from "zod";

/** Mensajes previos que se le pasan al modelo como contexto. Más que esto encarece cada consulta sin mejorarla. */
export const MAX_MENSAJES_CONTEXTO = 20;
export const MAX_CARACTERES_MENSAJE = 6000;

// zod (`z`) describe cómo tiene que ser un dato y después lo valida. El texto de cada regla es el error que se muestra.
// El navegador manda solo el mensaje nuevo (en el formato del Vercel AI SDK) y el id de la conversación:
// el historial lo lee el servidor de la base, así nadie puede inventarle al tutor una conversación.
const PedidoSchema = z.object({
  id: z.uuid("La conversación no es válida."),
  mensaje: z.object(
    {
      id: z.string().min(1).max(100),
      role: z.literal("user", "El mensaje tiene que ser del alumno."),
      parts: z
        .array(
          z.object({
            type: z.literal("text", "Por ahora solo se pueden mandar mensajes de texto."),
            text: z
              .string()
              .trim()
              .min(1, "El mensaje está vacío.")
              .max(MAX_CARACTERES_MENSAJE, `Un mensaje no puede superar los ${MAX_CARACTERES_MENSAJE} caracteres.`),
          })
        )
        .length(1, "El mensaje tiene que tener un solo texto."),
    },
    "Falta el mensaje."
  ),
});

/**
 * Resultado de validar: o salió bien (`ok: true` + el pedido) o salió mal (`ok: false` + el error).
 * Al chequear `if (resultado.ok)`, TypeScript sabe cuál de las dos formas es y qué propiedades tiene.
 */
export type ResultadoValidacion = { ok: true; pedido: PedidoDeChat } | { ok: false; error: string };

/** Lo que manda el navegador en cada mensaje: a qué conversación va y el mensaje nuevo del alumno. */
export class PedidoDeChat {
  // Constructor `private`: la única forma de crear uno es PedidoDeChat.validar(), así nunca existe uno sin validar.
  private constructor(
    readonly conversacionId: string,
    readonly mensaje: UIMessage
  ) {}

  /** Valida el cuerpo del request (viene del navegador: no se confía en él). */
  static validar(datos: unknown): ResultadoValidacion {
    const resultado = PedidoSchema.safeParse(datos);
    if (!resultado.success) {
      return { ok: false, error: resultado.error.issues[0]?.message ?? "El mensaje no es válido." };
    }
    const { id, mensaje } = resultado.data;
    return { ok: true, pedido: new PedidoDeChat(id, mensaje) };
  }

  /** El texto que escribió el alumno. */
  get texto(): string {
    const parte = this.mensaje.parts[0];
    return parte.type === "text" ? parte.text : "";
  }
}
