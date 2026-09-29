import { ANALISIS_DE_PRUEBA } from "../helpers/analisisDePrueba";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { EjerciciosController } from "@/backend/controllers/ejercicios.controller";
import { ConversacionesModel } from "@/backend/models/repositorios/conversaciones.model";
import { EjerciciosModel } from "@/backend/models/repositorios/ejercicios.model";
import {
  crearToolsEjercicio,
  ENUNCIADO_DEL_ALUMNO,
  guardarEjercicio,
  RECHAZOS_POR_RESPUESTA,
  resumenDelEjercicio,
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
    "Un taller de bicicletas tiene N mecánicos. Las bicicletas llegan con un intervalo que responde a una f.d.p. " +
    "uniforme entre 5 y 15 minutos, y el 20% de los clientes se va si hay más de 4 esperando. Se desea determinar " +
    "la cantidad N de mecánicos. Cada mecánico tiene su propia fila y la bicicleta que llega se ubica en la fila con " +
    "menos bicicletas esperando; si hay empate, elige la de menor número. El arreglo de una bicicleta demora un " +
    "tiempo que depende del tipo de rotura: el 70% son pinchaduras, que se arreglan en 15 minutos, y el resto son " +
    "problemas de cambios, que llevan 40 minutos. El dueño quiere saber cuántos mecánicos le conviene contratar: un " +
    "mecánico ocioso le cuesta el jornal y cada cliente que se va es un arreglo perdido. Para decidirlo se estudiará " +
    "el porcentaje de tiempo ocioso de cada mecánico, el promedio de espera en la fila y el porcentaje de clientes que " +
    "se van sin dejar la bicicleta.",
  sePide: ["Análisis completo: metodología, variables, T.E.I. y T.E.F.", "Diagrama de flujo"],
  datosAleatorios: [
    { sigla: "IA", forma: "fdp" },
    { sigla: "TA", forma: "probabilidades" },
  ],
  seDecide: "la cantidad N de mecánicos",
  complicaciones: ["N puestos", "arrepentimiento"],
  analisis: ANALISIS_DE_PRUEBA,
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
    const nombraLaVariable = {
      ...EJERCICIO,
      enunciado: EJERCICIO.enunciado.replace("con un intervalo", "con un intervalo (IA)"),
    };

    const resultado = await guardarEjercicio(ejercicios, conversacionId, nombraLaVariable);

    expect(resultado).toEqual({
      ok: false,
      problemas: [expect.stringContaining("El enunciado nombra la variable IA")],
    });
    expect(await ejercicios.listarRecientes()).toEqual([]);
  });

  it(`en una respuesta rechaza hasta ${RECHAZOS_POR_RESPUESTA} veces; después lo guarda una vez, con avisos`, async () => {
    const { ejercicios, conversacionId } = await alumnoConConversacion();
    const { generar_ejercicio: herramienta } = crearToolsEjercicio(ejercicios, conversacionId);
    const nombraLaVariable = {
      ...EJERCICIO,
      enunciado: EJERCICIO.enunciado.replace("con un intervalo", "con un intervalo (IA)"),
    };
    const opciones = { toolCallId: "t", messages: [], context: {} };

    const intentos: EjercicioGenerado[] = [];
    for (let i = 0; i <= RECHAZOS_POR_RESPUESTA; i++) {
      intentos.push((await herramienta.execute!(nombraLaVariable, opciones)) as EjercicioGenerado);
    }

    expect(intentos.map((intento) => intento.ok)).toEqual([...Array(RECHAZOS_POR_RESPUESTA).fill(false), true]);
    expect(intentos.at(-1)).toMatchObject({ avisos: [expect.stringContaining("El enunciado nombra la variable IA")] });
    expect(await ejercicios.listarRecientes()).toHaveLength(1);
  });

  it("no guarda como ejercicio nuevo el enunciado que el alumno pegó para resolver, y no guarda dos por respuesta", async () => {
    const { ejercicios, conversacionId } = await alumnoConConversacion();
    const opciones = { toolCallId: "t", messages: [], context: {} };
    const delAlumno = crearToolsEjercicio(
      ejercicios,
      conversacionId,
      `Resolveme este ejercicio: ${EJERCICIO.enunciado}`
    ).generar_ejercicio;
    const nuevo = crearToolsEjercicio(ejercicios, conversacionId, "Dame un ejercicio tipo parcial").generar_ejercicio;

    expect(await delAlumno.execute!(EJERCICIO, opciones)).toEqual({ ok: false, error: ENUNCIADO_DEL_ALUMNO });
    expect(await ejercicios.listarRecientes()).toEqual([]);

    expect(await nuevo.execute!(EJERCICIO, opciones)).toMatchObject({ ok: true });
    expect(await nuevo.execute!(EJERCICIO, opciones)).toMatchObject({
      ok: false,
      error: expect.stringContaining("Ya guardaste"),
    });
    expect(await ejercicios.listarRecientes()).toHaveLength(1);
  });

  it("si se guarda igual, los problemas del análisis interno no van en los avisos que ve el alumno", async () => {
    const { ejercicios, conversacionId } = await alumnoConConversacion();
    const sinControl = structuredClone(EJERCICIO);
    sinControl.analisis.variables.control = [];

    const resultado = await guardarEjercicio(ejercicios, conversacionId, sinControl, { rechazar: false });

    expect(resultado).toMatchObject({
      ok: true,
      avisos: [],
      avisosDelAnalisis: [expect.stringContaining("no tiene variable de control")],
    });
    // El modelo sí se entera, con la orden de no revelarle la metodología al alumno.
    expect(resumenDelEjercicio(resultado)).toContain("No le cuentes los problemas del análisis");
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
