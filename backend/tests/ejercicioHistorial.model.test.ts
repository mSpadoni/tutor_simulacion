// Cómo se lee un test de Vitest:
// - describe("tema", () => {...}): agrupa tests relacionados.
// - it("qué debería pasar", async () => {...}): un test (async porque habla con la base local de Supabase).
// - expect(valor).toBe(esperado): compara. Otros: toEqual (mismo contenido), toMatchObject (al menos esas propiedades)...
// - afterAll(fn): corre `fn` una vez al terminar todos los tests del archivo (acá, borra los alumnos de prueba).
import { afterAll, describe, expect, it } from "vitest";
import { EjercicioHistorialModel, type NuevoEjercicio } from "@/backend/models/ejercicioHistorial.model";
import { borrarAlumnosDePrueba, crearAlumnoLogueado, NavegadorDePrueba } from "./helpers/alumnoDePrueba";

afterAll(borrarAlumnosDePrueba);

/**
 * Arma un ejercicio de ejemplo. `Partial<T>` = T con todas sus propiedades opcionales:
 * se pasan solo las que se quieren cambiar, y `...datos` (al final) pisa los valores por defecto.
 */
function ejercicio(datos: Partial<NuevoEjercicio> = {}): NuevoEjercicio {
  return {
    tipo_ejercicio: "colas_1_puesto",
    enunciado: "Un banco con un cajero atiende clientes que llegan cada IA minutos...",
    resultado: "con_errores",
    pasos_con_error: ["clasificacion_variables"],
    ...datos,
  };
}

describe("EjercicioHistorialModel.guardar", () => {
  it("guarda el ejercicio a nombre del alumno logueado, sin pasarle el usuario_id", async () => {
    const alumno = await crearAlumnoLogueado();
    const historial = new EjercicioHistorialModel(alumno.navegador.crearCliente);

    const guardado = await historial.guardar(ejercicio({ diagrama_json: { nodos: [], conexiones: [] } }));

    expect(guardado).toMatchObject({
      usuario_id: alumno.id,
      tipo_ejercicio: "colas_1_puesto",
      resultado: "con_errores",
      pasos_con_error: ["clasificacion_variables"],
      diagrama_json: { nodos: [], conexiones: [] },
    });
    expect(guardado.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Date(guardado.creado_en).getTime()).toBeGreaterThan(Date.now() - 60_000);
  });

  it("rechaza un resultado que no está en el enum", async () => {
    const alumno = await crearAlumnoLogueado();
    const historial = new EjercicioHistorialModel(alumno.navegador.crearCliente);

    // @ts-expect-error: a propósito, un valor que TypeScript no permite, para probar a la base.
    await expect(historial.guardar(ejercicio({ resultado: "aprobado" }))).rejects.toThrow(
      "No se pudo guardar el ejercicio"
    );
  });

  it("sin sesión no deja guardar (RLS)", async () => {
    const historial = new EjercicioHistorialModel(new NavegadorDePrueba().crearCliente);

    await expect(historial.guardar(ejercicio())).rejects.toThrow("No se pudo guardar el ejercicio");
  });

  it("no deja guardar a nombre de otro alumno aunque se fuerce el usuario_id (RLS)", async () => {
    const ana = await crearAlumnoLogueado();
    const beto = await crearAlumnoLogueado();
    const clienteDeBeto = await beto.navegador.crearCliente();

    // Salteando el model a propósito: consulta directa, como haría un atacante con la publishable key.
    const { error } = await clienteDeBeto.from("ejercicios_historial").insert({ ...ejercicio(), usuario_id: ana.id });

    expect(error?.message).toMatch(/row-level security/);
  });
});

describe("EjercicioHistorialModel.listarRecientes", () => {
  it("devuelve los ejercicios del más reciente al más antiguo", async () => {
    const alumno = await crearAlumnoLogueado();
    const historial = new EjercicioHistorialModel(alumno.navegador.crearCliente);
    await historial.guardar(ejercicio({ tipo_ejercicio: "primero" }));
    await historial.guardar(ejercicio({ tipo_ejercicio: "segundo" }));
    await historial.guardar(ejercicio({ tipo_ejercicio: "tercero" }));

    const lista = await historial.listarRecientes();

    expect(lista.map((e) => e.tipo_ejercicio)).toEqual(["tercero", "segundo", "primero"]);
  });

  it("devuelve como máximo 7 por defecto, y respeta otro límite", async () => {
    const alumno = await crearAlumnoLogueado();
    const historial = new EjercicioHistorialModel(alumno.navegador.crearCliente);
    for (let i = 1; i <= 8; i++) {
      await historial.guardar(ejercicio({ tipo_ejercicio: `ejercicio_${i}` }));
    }

    expect(await historial.listarRecientes()).toHaveLength(7);
    expect(await historial.listarRecientes(3)).toHaveLength(3);
  });

  it("cada alumno ve solo su historial (RLS)", async () => {
    const ana = await crearAlumnoLogueado();
    const beto = await crearAlumnoLogueado();
    await new EjercicioHistorialModel(ana.navegador.crearCliente).guardar(ejercicio({ tipo_ejercicio: "de_ana" }));

    const historialDeBeto = await new EjercicioHistorialModel(beto.navegador.crearCliente).listarRecientes();
    const historialDeAna = await new EjercicioHistorialModel(ana.navegador.crearCliente).listarRecientes();

    expect(historialDeBeto).toEqual([]);
    expect(historialDeAna.map((e) => e.tipo_ejercicio)).toEqual(["de_ana"]);
  });

  it("sin sesión no ve nada (RLS)", async () => {
    const ana = await crearAlumnoLogueado();
    await new EjercicioHistorialModel(ana.navegador.crearCliente).guardar(ejercicio());

    const lista = await new EjercicioHistorialModel(new NavegadorDePrueba().crearCliente).listarRecientes();

    expect(lista).toEqual([]);
  });
});
