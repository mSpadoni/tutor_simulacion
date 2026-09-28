/**
 * Lee la URL y la clave pública de Supabase desde las variables de entorno (.env.local).
 * `(): { url: string; key: string }` = no recibe parámetros y devuelve un objeto con esas dos propiedades de tipo texto.
 * Si falta alguna, corta con un error claro en vez de fallar más adelante con algo confuso.
 */
export function leerConfigSupabase(): { url: string; key: string } {
  // process.env tiene las variables de entorno. Pueden no existir, así que su tipo es `string | undefined`.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // `!url` es true si url es undefined o texto vacío. Después de este if, TypeScript ya sabe que ambas son string.
  if (!url || !key) {
    throw new Error(
      "Faltan variables de entorno de Supabase: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ver .env.example)"
    );
  }

  // `{ url, key }` es un atajo de `{ url: url, key: key }`.
  return { url, key };
}
