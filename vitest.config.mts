import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Configuración de Vitest. Cuatro grupos de tests, cada uno en su carpeta:
// - rapidos: lógica pura, reglas del proyecto y componentes. Sin Docker ni internet; tardan segundos.
// - integracion: contra la copia local de Supabase (Docker): repositorios, RLS, auth, middleware. Sin internet.
// - externos: el contrato con los servicios reales (OpenAI, Kroki). Necesitan internet.
// - evals: la conducta del modelo real (qué tools elige), varias corridas por caso. Gastan crédito.
// `npm test` corre rapidos + integracion (lo confiable, sin internet); `test:externos` y `test:evals`, aparte.

/** Lo que comparten los grupos que usan la base local. */
const conSupabaseLocal = {
  // Busca la Supabase local antes de empezar (y avisa si Docker no está corriendo).
  globalSetup: ["backend/tests/setup/supabaseLocal.setup.ts"],
  // Cada test habla por HTTP con la base local (y los externos, con OpenAI o Kroki): más margen que los 5 s.
  testTimeout: 30_000,
  hookTimeout: 30_000,
};

export default defineConfig({
  // tsconfig tiene "jsx": "preserve" (lo transforma Next); en los tests de componentes lo transforma Vite.
  oxc: { jsx: { runtime: "automatic" } },
  // Hace que el atajo `@/` en los imports apunte a la raíz del proyecto, igual que en tsconfig.json.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // `server-only` tira un error si se importa fuera del servidor de Next (condición "react-server").
      // Los tests corren en Node, que es servidor: se usa el mismo archivo vacío que usa Next en el servidor.
      "server-only": fileURLToPath(new URL("node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    // Solo las variables OPENAI_ de .env.local: las de Supabase real nunca llegan a los tests.
    env: loadEnv("test", process.cwd(), "OPENAI_"),
    projects: [
      {
        extends: true, // usa el alias y las variables de arriba
        test: {
          name: "rapidos",
          include: ["backend/tests/rapidos/**/*.test.{ts,tsx}"],
          // El primer test de arquitectura carga ESLint en frío (unos segundos).
          testTimeout: 20_000,
        },
      },
      {
        extends: true,
        test: { name: "integracion", include: ["backend/tests/integracion/**/*.test.ts"], ...conSupabaseLocal },
      },
      {
        extends: true,
        // El chat también guarda en la base local, por eso usa el mismo setup.
        test: { name: "externos", include: ["backend/tests/externos/**/*.test.ts"], ...conSupabaseLocal },
      },
      {
        extends: true,
        // Conducta del modelo real con varias corridas por caso: lento y gasta crédito (`npm run test:evals`).
        test: {
          name: "evals",
          include: ["backend/tests/evals/**/*.test.ts"],
          ...conSupabaseLocal,
          testTimeout: 300_000,
        },
      },
    ],
  },
});
