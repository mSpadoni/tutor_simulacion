// Tipos de la base, en el formato que genera el CLI de Supabase.
// Escritos a mano a partir de backend/supabase/migrations. Cuando cambie el schema, regenerarlos con:
//   npx supabase gen types typescript --local --workdir backend > backend/types/database.ts

// Cómo leer este archivo:
// - Row: cómo viene una fila al leerla (todas las columnas).
// - Insert: qué hay que pasar al insertar. El `?` (ej. `id?:`) marca las opcionales: las completa la base con su default.
// - Update: qué se puede pasar al actualizar (todo opcional: solo mandás lo que cambia).
// - `{ [_ in never]: never }`: forma de decir "objeto vacío" (esta base no tiene vistas ni funciones propias).

/** Cualquier valor que se puede guardar en una columna jsonb. Es recursivo: un Json puede contener otros Json. */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      ejercicios_historial: {
        Row: {
          id: string;
          usuario_id: string;
          tipo_ejercicio: string;
          enunciado: string;
          resultado: Database["public"]["Enums"]["resultado_ejercicio"];
          pasos_con_error: Json | null;
          diagrama_json: Json | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          usuario_id?: string;
          tipo_ejercicio: string;
          enunciado: string;
          resultado: Database["public"]["Enums"]["resultado_ejercicio"];
          pasos_con_error?: Json | null;
          diagrama_json?: Json | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          tipo_ejercicio?: string;
          enunciado?: string;
          resultado?: Database["public"]["Enums"]["resultado_ejercicio"];
          pasos_con_error?: Json | null;
          diagrama_json?: Json | null;
          creado_en?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      resultado_ejercicio: "correcto" | "con_errores" | "abandonado";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
