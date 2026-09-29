import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { enunciadoDe, resolucionDe } from "@/backend/models/dominio/ficha";
import type { MaterialCatedra } from "@/backend/models/materialCatedra.model";
import { consultarModelos } from "./consultarModelos.tools";
import { resultadoConFichas, type ResultadoTool } from "./formatoMaterial";

// buscar_resueltos_parecidos: para un ejercicio que no es de la cátedra (lo creó el tutor o lo trajo el alumno),
// los ejercicios resueltos por la cátedra que más se le parecen y los modelos de ese tipo de sistema. El tutor
// razona su ejercicio por analogía con cómo la cátedra clasificó variables y armó la T.E.I. y la T.E.F. en casos
// parecidos (RAG: recupera material relevante; la respuesta la sigue armando el modelo).

/** Cuántos ejercicios resueltos parecidos se devuelven. */
const EJERCICIOS_PARECIDOS = 2;

/**
 * Ejercicios resueltos por la cátedra parecidos al enunciado, con su resolución, y los modelos de ese sistema.
 * Se busca por el tipo de sistema que dedujo el modelo ("N puestos con N colas, arrepentimiento"): buscando por el
 * enunciado entero pesan más las palabras del dominio ("lavadero", "autos") que la estructura del sistema.
 */
export function buscarResueltosParecidos(
  material: MaterialCatedra,
  enunciado: string,
  tipoDeSistema = ""
): ResultadoTool {
  const consulta = tipoDeSistema.trim() || enunciado;
  const parecidos = material.buscar(consulta, {
    tipo: "ejercicio",
    limite: EJERCICIOS_PARECIDOS,
    presupuestoTokens: 7000,
    filtro: (ficha) => resolucionDe(ficha) !== "",
  });
  const modelos = consultarModelos(material, consulta);
  if (parecidos.length === 0) {
    return {
      texto: `No hay ejercicios resueltos parecidos. Razonalo con los pasos de la sección 7 de la base.\n\n${modelos.texto}`,
      fichas: modelos.fichas,
    };
  }
  const ejercicios = resultadoConFichas(
    parecidos,
    "Ejercicios resueltos por la cátedra PARECIDOS al tuyo (no son el mismo ejercicio). Usalos por analogía: fijate " +
      "cómo la cátedra clasifica las variables y arma la T.E.I. y la T.E.F. en sistemas parecidos, y razoná tu " +
      "ejercicio con los pasos de la sección 7 de la base. No copies: tu enunciado tiene sus propios datos, " +
      "decisiones y resultados. Las resoluciones pueden tener errores: si contradicen la base, manda la base.",
    (ficha) => `${enunciadoDe(ficha)}\n\n#### Resolución de la cátedra\n\n${resolucionDe(ficha)}`
  );
  return {
    texto: `${ejercicios.texto}\n\n---\n\n## Modelos de la cátedra de este tipo de sistema\n\n${modelos.texto}`,
    fichas: [...ejercicios.fichas, ...modelos.fichas],
  };
}

/** La tool para el AI SDK. Recibe el material por parámetro para poder probarla con el real. */
export function crearToolResueltosParecidos(material: MaterialCatedra) {
  return {
    buscar_resueltos_parecidos: tool({
      description:
        "Trae ejercicios resueltos por la cátedra parecidos a un enunciado (con sus variables, T.E.I. y T.E.F.) y " +
        "los modelos de ese tipo de sistema, para razonar por analogía. Usala sobre todo cuando el alumno te pide " +
        "resolver o corregir un ejercicio que no es de la cátedra (el enunciado que pegó); también para armar el " +
        "análisis de un ejercicio nuevo que te pidió.",
      inputSchema: z.object({
        enunciado: z.string().min(30).describe("El enunciado completo del ejercicio que estás analizando"),
        tipoDeSistema: z
          .string()
          .min(3)
          .max(200)
          .describe(
            "Qué tipo de sistema es, con las palabras de la cátedra, ej: 'N puestos con N colas, arrepentimiento', " +
              "'N puestos con una sola cola', 'tiempo comprometido con 2 puestos', 'stock con reposición', " +
              "'colas con prioridad'. Fijate cuántos puestos hay, si cada uno tiene su fila y qué complicaciones tiene."
          ),
      }),
      execute: async ({ enunciado, tipoDeSistema }) =>
        buscarResueltosParecidos(material, enunciado, tipoDeSistema).texto,
    }),
  };
}
