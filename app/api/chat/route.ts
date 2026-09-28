import { NextResponse } from "next/server";
import { authController } from "@/backend/controllers/auth.controller";
import { chatController } from "@/backend/controllers/chat.controller";
import { ErrorDeChat } from "@/backend/tutor/errores";
import { PedidoDeChat } from "@/backend/models/pedidoDeChat.model";

// En Vercel, cuánto puede durar la función como máximo (segundos): el stream del tutor con sus tools.
export const maxDuration = 60;

/**
 * Endpoint POST /api/chat: lo llama useChat en el navegador con el mensaje nuevo y el id de la conversación.
 * Si sale bien, devuelve la respuesta del tutor en streaming. Si algo falla antes de empezar, responde JSON
 * `{ error }` con un código HTTP (el mensaje es para mostrarle al alumno).
 */
export async function POST(request: Request) {
  // 1) Solo alumnos logueados pueden usar el tutor (401 = no autenticado).
  const usuario = await authController.obtenerUsuarioActual();
  if (!usuario) {
    return NextResponse.json(
      { error: "Tu sesión expiró. Recargá la página y volvé a ingresar con Google." },
      { status: 401 }
    );
  }

  // 2) Leer y validar lo que mandó el navegador. Si el cuerpo no es JSON válido, `.catch` lo convierte en null
  //    y la validación lo rechaza con 400 (pedido mal formado).
  const cuerpo: unknown = await request.json().catch(() => null);
  const validacion = PedidoDeChat.validar(cuerpo);
  if (!validacion.ok) {
    return NextResponse.json({ error: validacion.error }, { status: 400 });
  }

  // 3) La respuesta del tutor en streaming. Si falla con un error conocido (ErrorDeChat) se devuelve su mensaje;
  //    cualquier otro error es inesperado: se loguea y se responde un 500 genérico.
  try {
    return await chatController.responder(validacion.pedido);
  } catch (error) {
    if (error instanceof ErrorDeChat) {
      return NextResponse.json({ error: error.mensajeParaAlumno }, { status: error.status });
    }
    console.error("Error inesperado en /api/chat:", error);
    return NextResponse.json({ error: "Algo falló de nuestro lado. Probá de nuevo." }, { status: 500 });
  }
}
