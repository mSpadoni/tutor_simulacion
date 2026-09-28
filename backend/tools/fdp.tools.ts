import { tool } from "ai";
import { z } from "zod";
import { verificarFdp } from "@/backend/lib/fdp";

/** Los datos de la tool: lo que el modelo resolvió de la f.d.p. JSON no tiene infinito: para "x ≥ a", b = "infinito". */
const DatosSchema = z.object({
  fx: z
    .string()
    .min(1)
    .describe(
      'f(x) en sintaxis de mathjs, ej: "(x - 1)/18", "k*x^2", "5*exp(-5*x)", "x < 210 ? x/400 - 19/40 : -x/400 + 23/40"'
    ),
  a: z.number().describe("Desde dónde vale f(x)"),
  b: z.union([z.number(), z.literal("infinito")]).describe('Hasta dónde vale f(x); "infinito" si es x ≥ a'),
  k: z.number().optional().describe("El valor de k que calculaste, si f(x) la usa"),
  inversa: z.string().optional().describe('La inversa que calculaste, x en función de R, ej: "6*sqrt(R) + 1"'),
  M: z.number().optional().describe("El M que calculaste para el método del rechazo"),
});

/** Verifica la f.d.p. con los datos de la tool (convierte "infinito" en Infinity). */
export function verificarFdpDesdeTool(datos: z.infer<typeof DatosSchema>) {
  return verificarFdp({ ...datos, b: datos.b === "infinito" ? Infinity : datos.b });
}

/** La tool para `streamText`. */
export function crearToolsFdp() {
  return {
    verificar_fdp: tool({
      description:
        "Verifica numéricamente una f.d.p. que resolviste: si el área da 1 y f ≥ 0, qué k la deja libre de " +
        "incógnitas, el M del rechazo, si tu inversa es correcta y F(x) en algunos puntos. Usala SIEMPRE que " +
        "resuelvas o corrijas una f.d.p., antes de responder.",
      inputSchema: DatosSchema,
      execute: async (datos) => verificarFdpDesdeTool(datos),
    }),
  };
}
