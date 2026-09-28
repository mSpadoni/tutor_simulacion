// `import { a, type B }`: trae la función `a` (existe al ejecutar) y el tipo `B` (solo existe para TypeScript,
// desaparece al compilar). `@/` es un atajo a la raíz del proyecto (configurado en tsconfig.json).
import { crearClienteServidor, type ClienteSupabase } from "@/backend/lib/supabase/server";
import type { Database } from "@/backend/types/database";

// `type X = ...` define un alias de tipo (no genera código, solo ayuda al editor y al compilador).
// `Database["public"]["Tables"]["ejercicios_historial"]` navega el tipo como si fuera un objeto:
// de todos los tipos de la base, toma el esquema "public", sus tablas, y dentro la tabla ejercicios_historial.
type Tabla = Database["public"]["Tables"]["ejercicios_historial"];

/** Una fila tal como viene de la base (con id, usuario_id, creado_en, etc.). */
export type EjercicioHistorial = Tabla["Row"];
/** Los valores posibles del enum de la base: "correcto" | "con_errores" | "abandonado". */
export type ResultadoEjercicio = Database["public"]["Enums"]["resultado_ejercicio"];
/**
 * Lo que hay que pasar para guardar un ejercicio nuevo.
 * `Omit<T, "a" | "b">` = el tipo T sin esas propiedades. Se sacan las que completa la base sola:
 * id (gen_random_uuid()), usuario_id (auth.uid(), el alumno logueado) y creado_en (now()).
 */
export type NuevoEjercicio = Omit<Tabla["Insert"], "id" | "usuario_id" | "creado_en">;

/**
 * Acceso a la tabla ejercicios_historial.
 * No filtra por usuario a mano: las políticas RLS ya limitan todo al alumno logueado.
 */
export class EjercicioHistorialModel {
  /**
   * Atajo de TypeScript: `private readonly crearCliente` en los parámetros del constructor
   * declara el atributo y lo asigna en un paso (equivale a `this.crearCliente = crearCliente`).
   * - `private`: solo se usa dentro de la clase. `readonly`: no se puede reasignar después.
   * - `() => Promise<ClienteSupabase>`: su tipo es "función sin parámetros que devuelve (a futuro) un cliente".
   * - `= crearClienteServidor`: valor por defecto si no se pasa nada.
   * Se recibe por parámetro (inyección de dependencias) para poder pasar un cliente falso en los tests.
   */
  constructor(private readonly crearCliente: () => Promise<ClienteSupabase> = crearClienteServidor) {}

  /**
   * Guarda un ejercicio del alumno logueado y devuelve la fila creada (ya con id y fecha).
   * `async` hace que el método devuelva una Promise; adentro se puede usar `await` para esperar
   * operaciones lentas (como ir a la base) sin bloquear el servidor.
   */
  async guardar(datos: NuevoEjercicio): Promise<EjercicioHistorial> {
    const supabase = await this.crearCliente();
    // Encadenado: insertar `datos` → `.select()` pide que devuelva lo insertado → `.single()` una sola fila, no un array.
    // `const { data, error } = ...` es desestructuración: saca esas dos propiedades del objeto respuesta.
    // Supabase no lanza excepciones: devuelve `error` con algo si falló, o `data` si salió bien.
    const { data, error } = await supabase.from("ejercicios_historial").insert(datos).select().single();

    if (error) {
      // Template string (comillas invertidas): `${...}` mete el valor de la expresión dentro del texto.
      throw new Error(`No se pudo guardar el ejercicio: ${error.message}`);
    }
    return data;
  }

  /**
   * Devuelve los últimos ejercicios del alumno logueado, los más recientes primero.
   * `limite = 7`: parámetro con valor por defecto (TypeScript deduce que es number).
   * Por defecto 7, para no saturar el panel (Ley de Miller).
   */
  async listarRecientes(limite = 7): Promise<EjercicioHistorial[]> {
    const supabase = await this.crearCliente();
    // Equivale en SQL a: SELECT * FROM ejercicios_historial ORDER BY creado_en DESC LIMIT <limite>
    // (el WHERE usuario_id = alumno lo agrega Postgres solo, por las políticas RLS).
    const { data, error } = await supabase
      .from("ejercicios_historial")
      .select("*")
      .order("creado_en", { ascending: false })
      .limit(limite);

    if (error) {
      throw new Error(`No se pudo leer el historial: ${error.message}`);
    }
    return data;
  }
}

/** Instancia única lista para usar desde el resto de la app: `ejercicioHistorialModel.guardar(...)`. */
export const ejercicioHistorialModel = new EjercicioHistorialModel();
