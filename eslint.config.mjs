import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// ESLint revisa el código buscando errores comunes y malas prácticas (`npm run lint`).
// En módulos .mjs no existen __filename/__dirname: se reconstruyen a partir de import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Usa las reglas recomendadas por Next.js (rendimiento web + TypeScript). FlatCompat adapta ese formato viejo al nuevo.
const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript")];

export default eslintConfig;
