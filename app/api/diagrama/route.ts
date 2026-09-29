import { NextResponse } from "next/server";
import { authController } from "@/backend/controllers/auth.controller";
import { diagramaController } from "@/backend/controllers/diagrama.controller";
import { respuestaDeError, respuestaDeErrorPublico } from "../respuestaDeError";

/**
 * Endpoint POST /api/diagrama: lo llama la vista cuando el tutor escribió un diagrama como código Mermaid en el
 * texto en vez de usar la tool. Devuelve el resultado de Kroki (`{ ok: true, svg, ... }` o `{ ok: false, motivo,
 * detalle }`). Si el pedido no es válido o no hay sesión, responde `{ error: { codigo, mensaje } }` con su status.
 */
export async function POST(request: Request) {
  // Solo alumnos logueados: Kroki es un servicio externo y no se ofrece a cualquiera.
  const usuario = await authController.obtenerUsuarioActual();
  if (!usuario) {
    return respuestaDeErrorPublico({
      codigo: "no_autenticado",
      mensaje: "Tu sesión expiró. Volvé a ingresar con Google.",
    });
  }

  const cuerpo: unknown = await request.json().catch(() => null);
  try {
    return NextResponse.json(await diagramaController.dibujar(cuerpo));
  } catch (error) {
    return respuestaDeError(error);
  }
}
