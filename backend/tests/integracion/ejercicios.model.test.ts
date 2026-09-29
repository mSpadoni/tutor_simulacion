import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { ConversacionesModel } from "@/backend/models/repositorios/conversaciones.model";
import { EjerciciosModel, type NuevoEjercicio } from "@/backend/models/repositorios/ejercicios.model";
import { borrarAlumnosDePrueba, crearAlumnoLogueado, NavegadorDePrueba } from "../helpers/alumnoDePrueba";

// Sin mocks: contra la base local de Supabase, con alumnos reales logueados (las políticas RLS se aplican de verdad).
afterAll(borrarAlumnosDePrueba);

function ejercicio(datos: Partial<NuevoEjercicio> = {}): NuevoEjercicio {
  return {
    tema: "colas con arrepentimiento",
    dificultad: "media",
    payload: {
      titulo: "Lavadero de autos",
      enunciado:
        "Un lavadero de autos tiene N boxes. Los autos llegan según una f.d.p. conocida y el 30% se va si hay más de 3 esperando.",
      sePide: ["Análisis completo: metodología, variables, T.E.I. y T.E.F.", "Diagrama de flujo"],
    },
    ...datos,
  };
}

describe("EjerciciosModel — conversación donde se generó", () => {
  it("guarda la conversación; si se borra la conversación, el ejercicio queda (sin enlace)", async () => {
    const alumno = await crearAlumnoLogueado();
    const ejercicios = new EjerciciosModel(alumno.navegador.crearCliente);
    const conversaciones = new ConversacionesModel(alumno.navegador.crearCliente);
    const conversacionId = randomUUID();
    await conversaciones.crear(conversacionId, "Práctica");

    const guardado = await ejercicios.guardar(ejercicio(), conversacionId);
    expect(guardado.conversacion_id).toBe(conversacionId);

    await conversaciones.borrar(conversacionId);
    const [queda] = await ejercicios.listarRecientes();
    expect(queda.id).toBe(guardado.id);
    expect(queda.conversacion_id).toBeNull();
  });

  it("no se puede asociar un ejercicio a la conversación de otro alumno (RLS)", async () => {
    const duenio = await crearAlumnoLogueado();
    const otro = await crearAlumnoLogueado();
    const conversacionAjena = randomUUID();
    await new ConversacionesModel(duenio.navegador.crearCliente).crear(conversacionAjena, "Ajena");

    await expect(
      new EjerciciosModel(otro.navegador.crearCliente).guardar(ejercicio(), conversacionAjena)
    ).rejects.toThrow("No se pudo guardar el ejercicio");
  });
});

describe("EjerciciosModel", () => {
  it("guarda el ejercicio a nombre del alumno logueado y lo lista", async () => {
    const alumno = await crearAlumnoLogueado();
    const ejercicios = new EjerciciosModel(alumno.navegador.crearCliente);

    const guardado = await ejercicios.guardar(ejercicio());

    expect(guardado).toMatchObject({ usuario_id: alumno.id, tema: "colas con arrepentimiento", dificultad: "media" });
    expect(guardado.payload.titulo).toBe("Lavadero de autos");
    expect((await ejercicios.listarRecientes()).map((e) => e.id)).toEqual([guardado.id]);
  });

  it("valida con Zod antes de guardar: dificultad inválida o sin consignas no llegan a la base", async () => {
    const alumno = await crearAlumnoLogueado();
    const ejercicios = new EjerciciosModel(alumno.navegador.crearCliente);

    // @ts-expect-error: a propósito, un valor que TypeScript no permite.
    await expect(ejercicios.guardar(ejercicio({ dificultad: "imposible" }))).rejects.toThrow();
    await expect(ejercicios.guardar(ejercicio({ payload: { ...ejercicio().payload, sePide: [] } }))).rejects.toThrow();
    expect(await ejercicios.listarRecientes()).toEqual([]);
  });

  it("cada alumno ve solo sus ejercicios, y sin sesión no se guarda (RLS)", async () => {
    const duenio = await crearAlumnoLogueado();
    const otro = await crearAlumnoLogueado();
    await new EjerciciosModel(duenio.navegador.crearCliente).guardar(ejercicio());

    expect(await new EjerciciosModel(otro.navegador.crearCliente).listarRecientes()).toEqual([]);
    await expect(new EjerciciosModel(new NavegadorDePrueba().crearCliente).guardar(ejercicio())).rejects.toThrow(
      "No se pudo guardar el ejercicio"
    );
  });
});

describe("EjerciciosModel — el payload se valida también al leer", () => {
  it("una fila con payload mal formado se omite y el resto se lista con sus datos", async () => {
    const alumno = await crearAlumnoLogueado();
    const ejercicios = new EjerciciosModel(alumno.navegador.crearCliente);
    const bueno = await ejercicios.guardar(ejercicio());
    // Una fila guardada sin pasar por el model (a mano, o con un esquema viejo): le falta el enunciado.
    const supabase = await alumno.navegador.crearCliente();
    const insertado = await supabase
      .from("ejercicios")
      .insert({ tema: "stock", dificultad: "facil", payload: { titulo: "Roto" } });
    expect(insertado.error).toBeNull();

    const listados = await ejercicios.listarRecientes();

    expect(listados.map((listado) => listado.id)).toEqual([bueno.id]);
    expect(listados[0].payload).toEqual(ejercicio().payload);
  });
});
