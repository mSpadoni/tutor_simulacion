import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { z } from "zod";

/** Mensajes que se mandan como contexto. Más que esto encarece cada consulta sin mejorar la respuesta. */
export const MAX_MENSAJES = 20;
export const MAX_CARACTERES_MENSAJE = 6000;

// zod (`z`) describe cómo tiene que ser un dato y después lo valida. Acá: un mensaje es un objeto con
// `rol` ("alumno" o "tutor") y `contenido` (texto sin espacios de más, entre 1 y MAX_CARACTERES_MENSAJE caracteres).
// El texto dentro de .min()/.max() es el mensaje de error que se muestra si no se cumple.
const MensajeSchema = z.object({
  rol: z.enum(["alumno", "tutor"]),
  contenido: z
    .string()
    .trim()
    .min(1, "Hay un mensaje vacío.")
    .max(MAX_CARACTERES_MENSAJE, `Un mensaje no puede superar los ${MAX_CARACTERES_MENSAJE} caracteres.`),
});

// Una conversación: una lista de 1 a MAX_MENSAJES mensajes. `.refine` agrega una regla propia:
// el último mensaje tiene que ser del alumno (si no, no hay nada que responder). `.at(-1)` = último elemento.
const ConversacionSchema = z.object({
  mensajes: z
    .array(MensajeSchema)
    .min(1, "La conversación está vacía.")
    .max(MAX_MENSAJES, `Se mandan como máximo los últimos ${MAX_MENSAJES} mensajes.`)
    .refine((mensajes) => mensajes.at(-1)?.rol === "alumno", "El último mensaje tiene que ser del alumno."),
});

/** `z.infer<typeof MensajeSchema>` saca el tipo de TypeScript del esquema: { rol: "alumno" | "tutor"; contenido: string }. */
export type Mensaje = z.infer<typeof MensajeSchema>;

/**
 * Resultado de validar: o salió bien (`ok: true` + la conversación) o salió mal (`ok: false` + el error).
 * Al chequear `if (resultado.ok)`, TypeScript sabe cuál de las dos formas es y qué propiedades tiene.
 */
export type ResultadoValidacion = { ok: true; conversacion: Conversacion } | { ok: false; error: string };

/** La charla entre el alumno y el tutor, tal como la manda el navegador en cada consulta. */
export class Conversacion {
  // Constructor `private`: desde afuera no se puede hacer `new Conversacion(...)`.
  // La única forma de crear una es Conversacion.validar(), así nunca existe una conversación sin validar.
  private constructor(readonly mensajes: readonly Mensaje[]) {}

  /** Valida el cuerpo del request (viene del navegador: no se confía en él). */
  static validar(datos: unknown): ResultadoValidacion {
    // `unknown`: "no sé qué es". Obliga a validarlo antes de usarlo. safeParse no tira error: devuelve success true/false.
    const resultado = ConversacionSchema.safeParse(datos);
    if (!resultado.success) {
      // Devuelve solo el primer error (`issues[0]`); `?.` y `??` cubren el caso de que no haya ninguno.
      return { ok: false, error: resultado.error.issues[0]?.message ?? "La conversación no es válida." };
    }
    return { ok: true, conversacion: new Conversacion(resultado.data.mensajes) };
  }

  /** Los dos últimos mensajes del alumno: con eso se eligen las fichas del material de la cátedra. */
  textoParaBuscarMaterial(): string {
    // filter: solo los del alumno → slice(-2): los 2 últimos → map: su texto → join: todo en un solo string.
    return this.mensajes
      .filter((mensaje) => mensaje.rol === "alumno")
      .slice(-2)
      .map((mensaje) => mensaje.contenido)
      .join("\n");
  }

  /** Traduce al formato de OpenAI: system prompt primero, "alumno" → user y "tutor" → assistant. */
  paraOpenAI(systemPrompt: string): ChatCompletionMessageParam[] {
    // Lista nueva: primero el system prompt y después (con el spread `...`) todos los mensajes ya traducidos.
    // `(mensaje): ChatCompletionMessageParam => ...` indica el tipo que devuelve la función flecha.
    return [
      { role: "system", content: systemPrompt },
      ...this.mensajes.map((mensaje): ChatCompletionMessageParam => ({
        role: mensaje.rol === "alumno" ? "user" : "assistant",
        content: mensaje.contenido,
      })),
    ];
  }
}
