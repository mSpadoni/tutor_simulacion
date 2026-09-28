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

// ---------------------------------------------------------------------------------------------------------------
// Reglas de dependencia de la arquitectura (ver docs/ARQUITECTURA.md). Si alguien importa algo que no corresponde,
// `npm run lint` (y el build de Vercel) fallan con el motivo.

/** El backend no depende de las rutas ni de las views. */
const backendNoDependeDeAppNiViews = {
  group: ["@/app/*", "@/app/**", "@/views/*", "@/views/**"],
  message: "El backend no depende de las rutas (app/) ni de las views: ellas dependen de él, no al revés.",
};

/**
 * `@typescript-eslint/no-restricted-imports` con `patterns`. Si varias configuraciones tocan el mismo archivo, gana la
 * última: por eso el dominio repite la regla del backend.
 */
const prohibir = (...patterns) => ({ "@typescript-eslint/no-restricted-imports": ["error", { patterns }] });

const reglasDeDependencia = [
  {
    // Views: componentes. Los datos llegan por props y las acciones como Server Actions que conecta la página.
    files: ["views/**/*.{ts,tsx}"],
    rules: prohibir({
      group: ["@/backend/*", "@/backend/**", "@supabase/*"],
      message:
        "Las views no importan el backend ni Supabase: reciben los datos por props y las acciones por Server Actions.",
    }),
  },
  {
    // Backend (menos los tests, que prueban también funciones de las views).
    files: ["backend/**/*.ts"],
    ignores: ["backend/tests/**"],
    rules: prohibir(backendNoDependeDeAppNiViews),
  },
  {
    // Rutas: delegan en controllers; no tocan Supabase ni los repositorios directamente.
    files: ["app/**/*.{ts,tsx}"],
    rules: prohibir({
      group: [
        "@supabase/*",
        "@/backend/lib/supabase/*",
        "@/backend/models/conversaciones.model",
        "@/backend/models/ejercicios.model",
        "@/backend/models/materialCatedra.model",
      ],
      message: "Las rutas no usan Supabase ni los repositorios directamente: pasan por un controller.",
    }),
  },
  {
    // Dominio: lógica pura, sin Next, Supabase, AI SDK ni infraestructura. Se permiten imports de solo tipos
    // (`import type`), que desaparecen al compilar.
    files: ["backend/lib/fdp.ts", "backend/models/pedidoDeChat.model.ts", "backend/models/usuario.model.ts"],
    rules: prohibir(backendNoDependeDeAppNiViews, {
      group: ["next", "next/*", "@supabase/*", "ai", "@ai-sdk/*", "@/backend/lib/*", "@/backend/lib/**", "server-only"],
      message: "El dominio es lógica pura: sin Next, Supabase, AI SDK ni infraestructura (solo `import type`).",
      allowTypeImports: true,
    }),
  },
];

// Usa las reglas recomendadas por Next.js (rendimiento web + TypeScript). FlatCompat adapta ese formato viejo al nuevo.
const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript"), ...reglasDeDependencia];

export default eslintConfig;
