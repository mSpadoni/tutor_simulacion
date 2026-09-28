import { NextResponse } from "next/server";
import { authController } from "@/backend/controllers/auth.controller";
import { chatController, ErrorDeChat } from "@/backend/controllers/chat.controller";
import { Conversacion } from "@/backend/models/conversacion.model";

/**
 * Endpoint POST /api/chat: lo llama el chat del navegador con la conversación y devuelve la respuesta del tutor.
 * Responde JSON: `{ respuesta, herramientas }` si salió bien o `{ error }` con un código HTTP si no.
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
  const validacion = Conversacion.validar(cuerpo);
  if (!validacion.ok) {
    return NextResponse.json({ error: validacion.error }, { status: 400 });
  }

  // 3) Pedirle la respuesta al tutor. Si falla con un error conocido (ErrorDeChat) se devuelve su mensaje;
  //    cualquier otro error es inesperado: se loguea y se responde un 500 genérico.
  try {
    const { texto, herramientas } = await chatController.responder(validacion.conversacion);
    // `herramientas`: qué tools usó el modelo (para el panel de debug del Día 3).
    return NextResponse.json({ respuesta: texto, herramientas });
  } catch (error) {
    if (error instanceof ErrorDeChat) {
      return NextResponse.json({ error: error.mensajeParaAlumno }, { status: error.status });
    }
    console.error("Error inesperado en /api/chat:", error);
    return NextResponse.json({ error: "Algo falló de nuestro lado. Probá de nuevo." }, { status: 500 });
  }
}
