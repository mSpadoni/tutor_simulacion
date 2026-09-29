import "server-only";
import { clienteKroki, type ClienteKroki } from "@/backend/lib/kroki";
import { generarDiagramaFlujo, type DiagramaGenerado } from "@/backend/tools/diagrama.tools";
import { validarPedidoDeDiagrama } from "./validaciones";

/**
 * Dibuja un diagrama que el tutor escribió como código Mermaid en el texto de su respuesta, en vez de usar la tool
 * generar_diagrama_flujo. Es el respaldo de la vista: el alumno ve la imagen igual, con el mismo cliente de Kroki y
 * el mismo estilo que la tool (errores HTTP, reintentos, timeout y validación del SVG incluidos).
 */
export class DiagramaController {
  constructor(private readonly kroki: ClienteKroki = clienteKroki) {}

  /** Valida el pedido del navegador y devuelve el diagrama (o por qué no se pudo generar). */
  async dibujar(cuerpo: unknown): Promise<DiagramaGenerado> {
    const mermaid = validarPedidoDeDiagrama(cuerpo);
    return generarDiagramaFlujo("Diagrama de flujo", mermaid, this.kroki);
  }
}

/** Instancia lista para usar desde las rutas. */
export const diagramaController = new DiagramaController();
