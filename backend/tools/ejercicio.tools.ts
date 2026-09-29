import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { AnalisisSchema } from "@/backend/models/dominio/analisis";
import {
  EjercicioSchema,
  FORMAS_DE_DATO,
  problemasDelAnalisisDelEjercicio,
  esElEnunciadoDelAlumno,
  problemasDelEjercicio,
} from "@/backend/models/dominio/ejercicio";
import type { EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";

/** La forma de un dato a partir de lo que mande el modelo ("fdp_conocida", "lineal", "60%"…). */
export function aFormaDeDato(texto: string): (typeof FORMAS_DE_DATO)[number] {
  const forma = texto.trim().toLowerCase();
  if ((FORMAS_DE_DATO as readonly string[]).includes(forma)) return forma as (typeof FORMAS_DE_DATO)[number];
  if (/conocida/.test(forma)) return "fdp_conocida";
  if (/deriv|doble|triple|mitad|veces/.test(forma)) return "derivado";
  if (/probab|%|porcentaj|discret|empíric|empiric/.test(forma)) return "probabilidades";
  return "fdp";
}

/** Los datos del ejercicio que arma el modelo (validados con Zod antes de guardarlos). */
export const DatosEjercicioSchema = z.object({
  tema: EjercicioSchema.shape.tema.describe("Tipo de sistema, ej: 'colas con arrepentimiento', 'stock con reposición'"),
  dificultad: EjercicioSchema.shape.dificultad.describe("facil, media o dificil (tipo parcial = media o dificil)"),
  titulo: EjercicioSchema.shape.payload.shape.titulo.describe(
    "Título corto con el dominio, ej: 'Taller de bicicletas'"
  ),
  enunciado: EjercicioSchema.shape.payload.shape.enunciado.describe(
    "El sistema contado en prosa, con los datos sin nombrar su variable (el alumno la deduce) y lo que se desea " +
      "determinar (sin el «Se pide»)"
  ),
  sePide: EjercicioSchema.shape.payload.shape.sePide.describe("Cada consigna del «Se pide:», en orden"),
  // No se guardan: obligan a pensar el ejercicio antes de escribirlo y permiten revisarlo.
  datosAleatorios: z
    .array(
      z.object({
        sigla: z.string().trim().min(1).max(10).describe("La variable del dato, ej: 'IA' (no va en el enunciado)"),
        // Texto libre que se traduce a una de las cuatro formas: el modelo a veces manda "lineal" o "uniforme" y un
        // enum estricto rechazaba la llamada antes de revisarla (y esos rechazos no cuentan para el tope).
        forma: z
          .string()
          .transform(aFormaDeDato)
          .describe(
            "Cómo lo cuenta el enunciado: 'fdp' («responde a una f.d.p. uniforme entre 5 y 15»), 'fdp_conocida' " +
              "(«responde a una f.d.p. conocida»), 'derivado' («es el doble que…») o 'probabilidades' («el 60% " +
              "tarda 40 minutos y el resto 20»)"
          ),
      })
    )
    .describe("Cada dato aleatorio del enunciado y cómo aparece"),
  seDecide: z
    .string()
    .trim()
    .min(5)
    .max(200)
    .describe("Qué se busca decidir (la variable de control), ej: 'la cantidad N de cajas'. Queda fija en la corrida."),
  complicaciones: z
    .array(z.string().trim().min(3).max(120))
    .min(2, "Un ejercicio de parcial combina al menos dos complicaciones.")
    .max(4)
    .describe(
      "Las complicaciones que combinás (dos o tres), ej: ['N puestos con N colas', 'arrepentimiento por tramos', " +
        "'dos tipos de cliente con distinto tiempo de atención']"
    ),
  analisis: AnalisisSchema.describe(
    "Tu propio análisis del ejercicio (no se le muestra al alumno), armado con los pasos de la sección 7 de la base: " +
      "si no podés armar una T.E.I. válida, el ejercicio está mal planteado"
  ),
});

export type DatosEjercicio = z.infer<typeof DatosEjercicioSchema>;

/** El ejercicio como se guardó (lo muestra la vista). */
export type EjercicioGuardado = { titulo: string; enunciado: string; sePide: string[] };

/**
 * Revisiones que se rechazan como máximo en una misma respuesta. Después se guarda igual (con los avisos): un modelo
 * que no logra cumplir una regla no puede dejar al alumno sin ejercicio ni gastar todos los pasos reintentando.
 */
export const RECHAZOS_POR_RESPUESTA = 2;

/**
 * Lo que devuelve la tool: el ejercicio guardado (con los avisos de lo que no cumple, si se guardó igual); las
 * reglas de la cátedra que no cumple (no se guarda, el modelo lo corrige); o por qué no se pudo guardar.
 */
export type EjercicioGenerado =
  | {
      ok: true;
      id: string;
      ejercicio: EjercicioGuardado;
      /** Lo que no cumple el enunciado: la vista se lo muestra al alumno. */
      avisos: string[];
      /** Lo que no cumple el análisis interno: solo lo lee el modelo (mostrarlo revelaría la metodología). */
      avisosDelAnalisis?: string[];
    }
  | { ok: false; problemas: string[] }
  | { ok: false; error: string };

/**
 * Revisa el ejercicio y lo guarda en "Mis ejercicios" del alumno, asociado a la conversación donde se generó.
 * Si no cumple las reglas, no lo guarda y devuelve los problemas; con `rechazar: false`, lo guarda igual con avisos.
 */
export async function guardarEjercicio(
  ejercicios: EjerciciosModel,
  conversacionId: string,
  { tema, dificultad, titulo, enunciado, sePide, datosAleatorios, seDecide, analisis }: DatosEjercicio,
  { rechazar = true }: { rechazar?: boolean } = {}
): Promise<EjercicioGenerado> {
  const delEnunciado = problemasDelEjercicio({ enunciado, datosAleatorios });
  const delAnalisis = problemasDelAnalisisDelEjercicio({ enunciado, datosAleatorios, seDecide, analisis });
  if (delEnunciado.length + delAnalisis.length > 0 && rechazar) {
    return { ok: false, problemas: [...delEnunciado, ...delAnalisis] };
  }
  try {
    const guardado = await ejercicios.guardar(
      { tema, dificultad, payload: { titulo, enunciado, sePide } },
      conversacionId
    );
    return {
      ok: true,
      id: guardado.id,
      ejercicio: { titulo, enunciado, sePide },
      avisos: delEnunciado,
      avisosDelAnalisis: delAnalisis,
    };
  } catch (error) {
    return { ok: false, error: `No se pudo guardar el ejercicio: ${(error as Error).message}` };
  }
}

/** Lo que lee el modelo si intenta guardar como nuevo el enunciado que pegó el alumno. */
export const ENUNCIADO_DEL_ALUMNO =
  "Ese enunciado lo trajo el alumno para que lo resuelvas: no es un ejercicio nuevo y no se guarda. Resolvelo " +
  'siguiendo "Cómo resolvés" (respuesta 1: variables y eventos, con verificar_analisis).';

/** Lo que lee el modelo del resultado: si se guardó, que no lo repita; si no, qué corregir. */
export function resumenDelEjercicio(resultado: EjercicioGenerado): string {
  const delAnalisis = resultado.ok ? (resultado.avisosDelAnalisis ?? []) : [];
  if (resultado.ok && resultado.avisos.length + delAnalisis.length > 0) {
    return (
      "Ejercicio guardado y mostrado al alumno, pero no cumple:\n" +
      [...resultado.avisos, ...delAnalisis].map((aviso) => `- ${aviso}`).join("\n") +
      "\nNo lo repitas ni lo vuelvas a generar. Avisale al alumno en una línea que el enunciado puede tener " +
      "inconsistencias y ofrecele generar otro. No le cuentes los problemas del análisis (revelarían la metodología, " +
      "que la descubre él): nada de eventos, variables, T.E.I., T.E.F. ni índices."
    );
  }
  if (resultado.ok) {
    return "Ejercicio guardado en «Mis ejercicios» y mostrado al alumno. No lo repitas en texto: deseale suerte en una línea.";
  }
  if ("problemas" in resultado) {
    return (
      "El ejercicio no cumple estas reglas de la cátedra (no se guardó y el alumno todavía no lo ve):\n" +
      resultado.problemas.map((problema) => `- ${problema}`).join("\n") +
      "\nCorregilo y volvé a llamar a generar_ejercicio."
    );
  }
  if (resultado.error.startsWith("Ya guardaste")) return `${resultado.error}. Respondé en una línea y terminá.`;
  if (resultado.error === ENUNCIADO_DEL_ALUMNO) return resultado.error;
  return `${resultado.error}. Mostrale el ejercicio en texto y avisale que no se pudo guardar.`;
}

/** La tool para `streamText`. Se crea por pedido: guarda con la sesión del alumno y en su conversación. */
export function crearToolsEjercicio(ejercicios: EjerciciosModel, conversacionId: string, mensajeDelAlumno = "") {
  // Cuántas revisiones se rechazaron en esta respuesta (las tools se crean por pedido).
  let rechazos = 0;
  let guardado = false;
  return {
    generar_ejercicio: tool({
      description:
        "Revisa el ejercicio nuevo que creaste con las reglas de la cátedra y, si las cumple, lo guarda en «Mis " +
        "ejercicios» y se lo muestra al alumno. Llamala SIEMPRE para dar un ejercicio nuevo, en vez de escribirlo en " +
        "el mensaje: si devuelve problemas, corregilo y volvé a llamarla. NUNCA para un enunciado que te pasó el " +
        "alumno para resolver o corregir (ese ya existe: resolvelo).",
      inputSchema: DatosEjercicioSchema,
      execute: async (datos): Promise<EjercicioGenerado> => {
        // Un ejercicio por respuesta: si ya se guardó uno, no se guarda otro (el modelo a veces seguía llamándola).
        if (guardado) return { ok: false, error: "Ya guardaste un ejercicio en esta respuesta: no generes otro" };
        // El modelo a veces confunde "resolveme este ejercicio" con crear uno: el enunciado del alumno no se guarda.
        if (esElEnunciadoDelAlumno(datos.enunciado, mensajeDelAlumno)) {
          return { ok: false, error: ENUNCIADO_DEL_ALUMNO };
        }
        const resultado = await guardarEjercicio(ejercicios, conversacionId, datos, {
          rechazar: rechazos < RECHAZOS_POR_RESPUESTA,
        });
        if (!resultado.ok && "problemas" in resultado) rechazos += 1;
        if (resultado.ok) guardado = true;
        return resultado;
      },
      toModelOutput: ({ output }) => ({ type: "text", value: resumenDelEjercicio(output) }),
    }),
  };
}
