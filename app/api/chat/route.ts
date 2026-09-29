import { createUIMessageStreamResponse } from "ai";
import { authController } from "@/backend/controllers/auth.controller";
import { chatController } from "@/backend/controllers/chat.controller";
import { PedidoDeChat } from "@/backend/models/dominio/pedidoDeChat.model";
import { respuestaDeError, respuestaDeErrorPublico } from "../respuestaDeError";

// En Vercel, cuánto puede durar la función como máximo (segundos): el stream del tutor con sus tools.
export const maxDuration = 60;

/**
 * Endpoint POST /api/chat: lo llama useChat en el navegador con el mensaje nuevo y el id de la conversación.
 * Si sale bien, devuelve la respuesta del tutor en streaming. Si algo falla antes de empezar, responde JSON
 * `{ error: { codigo, mensaje } }` con su status HTTP (ver respuestaDeError.ts).
 */
export async function POST(request: Request) {
  // 1) Solo alumnos logueados pueden usar el tutor.
  const usuario = await authController.obtenerUsuarioActual();
  if (!usuario) {
    return respuestaDeErrorPublico({
      codigo: "no_autenticado",
      mensaje: "Tu sesión expiró. Volvé a ingresar con Google.",
    });
  }

  // 2) Leer y validar lo que mandó el navegador. Si el cuerpo no es JSON válido, `.catch` lo convierte en null
  //    y la validación lo rechaza (pedido mal formado).
  const cuerpo: unknown = await request.json().catch(() => null);
  const validacion = PedidoDeChat.validar(cuerpo);
  if (!validacion.ok) {
    return respuestaDeErrorPublico({ codigo: "pedido_invalido", mensaje: validacion.error });
  }

  // 3) La respuesta del tutor en streaming. Los errores de antes de empezar se responden con su código.
  try {
    return createUIMessageStreamResponse({ stream: await chatController.responder(validacion.pedido) });
  } catch (error) {
    return respuestaDeError(error);
  }
}
