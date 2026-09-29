import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { EjerciciosController } from "@/backend/controllers/ejercicios.controller";
import { ConversacionesModel } from "@/backend/models/repositorios/conversaciones.model";
import { EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";
import {
  crearToolsEjercicio,
  guardarEjercicio,
  RECHAZOS_POR_RESPUESTA,
  type DatosEjercicio,
  type EjercicioGenerado,
} from "@/backend/tools/ejercicio.tools";
import { borrarAlumnosDePrueba, crearAlumnoLogueado } from "../helpers/alumnoDePrueba";

// Sin mocks: contra la base local de Supabase, con alumnos reales logueados.
afterAll(borrarAlumnosDePrueba);

const EJERCICIO: DatosEjercicio = {
  tema: "colas con arrepentimiento",
  dificultad: "media",
  titulo: "Taller de bicicletas",
  enunciado:
    "Un taller de bicicletas tiene N mecánicos. Las bicicletas llegan con un intervalo (IA) que responde a una f.d.p. " +
    "uniforme entre 5 y 15 minutos, y el 20% de los clientes se va si hay más de 4 esperando. Se desea determinar " +
    "la cantidad N de mecánicos.",
  sePide: ["Análisis completo: metodología, variables, T.E.I. y T.E.F.", "Diagrama de flujo"],
  datosAleatorios: [{ sigla: "IA", fdp: "uniforme entre 5 y 15 minutos" }],
  seDecide: "la cantidad N de mecánicos",
};

/** Un alumno logueado con una conversación propia y sus models. */
async function alumnoConConversacion() {
  const alumno = await crearAlumnoLogueado();
  const ejercicios = new EjerciciosModel(alumno.navegador.crearCliente);
  const conversacionId = randomUUID();
  await new ConversacionesModel(alumno.navegador.crearCliente).crear(conversacionId, "Práctica");
  return { ejercicios, conversacionId };
}

describe("guardarEjercicio (la tool generar_ejercicio)", () => {
  it("guarda el ejercicio en «Mis ejercicios», asociado a la conversación", async () => {
    const { ejercicios, conversacionId } = await alumnoConConversacion();

    const resultado = await guardarEjercicio(ejercicios, conversacionId, EJERCICIO);

    expect(resultado).toMatchObject({
      ok: true,
      ejercicio: { titulo: EJERCICIO.titulo, enunciado: EJERCICIO.enunciado, sePide: EJERCICIO.sePide },
    });
    const [guardado] = await ejercicios.listarRecientes();
    expect(guardado).toMatchObject({ conversacion_id: conversacionId, tema: EJERCICIO.tema });
    expect(guardado.payload).toEqual({
      titulo: EJERCICIO.titulo,
      enunciado: EJERCICIO.enunciado,
      sePide: EJERCICIO.sePide,
    });
  });

  it("si no cumple las reglas de la cátedra, le devuelve los problemas al modelo y no guarda nada", async () => {
    const { ejercicios, conversacionId } = await alumnoConConversacion();
    const sinRecta = {
      ...EJERCICIO,
      enunciado: EJERCICIO.enunciado.replace("uniforme entre 5 y 15 minutos", "lineal entre 5 y 15 minutos"),
      datosAleatorios: [{ sigla: "IA", fdp: "lineal entre 5 y 15 minutos" }],
    };

    const resultado = await guardarEjercicio(ejercicios, conversacionId, sinRecta);

    expect(resultado).toEqual({ ok: false, problemas: [expect.stringContaining("es lineal pero no dice qué recta")] });
    expect(await ejercicios.listarRecientes()).toEqual([]);
  });

  it(`en una respuesta rechaza hasta ${RECHAZOS_POR_RESPUESTA} veces; después lo guarda una vez, con avisos`, async () => {
    const { ejercicios, conversacionId } = await alumnoConConversacion();
    const { generar_ejercicio: herramienta } = crearToolsEjercicio(ejercicios, conversacionId);
    const sinRecta = {
      ...EJERCICIO,
      enunciado: EJERCICIO.enunciado.replace("uniforme entre 5 y 15 minutos", "lineal entre 5 y 15 minutos"),
    };
    const opciones = { toolCallId: "t", messages: [], context: {} };

    const intentos: EjercicioGenerado[] = [];
    for (let i = 0; i <= RECHAZOS_POR_RESPUESTA; i++) {
      intentos.push((await herramienta.execute!(sinRecta, opciones)) as EjercicioGenerado);
    }

    expect(intentos.map((intento) => intento.ok)).toEqual([...Array(RECHAZOS_POR_RESPUESTA).fill(false), true]);
    expect(intentos.at(-1)).toMatchObject({ avisos: [expect.stringContaining("es lineal pero no dice qué recta")] });
    expect(await ejercicios.listarRecientes()).toHaveLength(1);
  });

  it("si los datos no pasan la validación, le devuelve el error al modelo y no guarda nada", async () => {
    const { ejercicios, conversacionId } = await alumnoConConversacion();

    const resultado = await guardarEjercicio(ejercicios, conversacionId, { ...EJERCICIO, sePide: [] });

    expect(resultado).toMatchObject({ ok: false, error: expect.stringContaining("No se pudo guardar el ejercicio") });
    expect(await ejercicios.listarRecientes()).toEqual([]);
  });
});

describe("EjerciciosController.listar («Mis ejercicios» del costado)", () => {
  it("devuelve título y conversación de cada ejercicio", async () => {
    const { ejercicios, conversacionId } = await alumnoConConversacion();
    await guardarEjercicio(ejercicios, conversacionId, EJERCICIO);
    await guardarEjercicio(ejercicios, conversacionId, { ...EJERCICIO, titulo: "Lavadero de autos" });

    const lista = await new EjerciciosController(() => ejercicios).listar();

    // Sin mirar el orden: depende de cuándo se guardó cada uno, no de lo que hace listar().
    expect(lista.map(({ titulo, conversacionId: id }) => ({ titulo, id }))).toHaveLength(2);
    expect(lista.map(({ titulo, conversacionId: id }) => ({ titulo, id }))).toEqual(
      expect.arrayContaining([
        { titulo: "Lavadero de autos", id: conversacionId },
        { titulo: "Taller de bicicletas", id: conversacionId },
      ])
    );
  });
});
