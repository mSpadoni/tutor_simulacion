import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Configuración de Vitest (el que corre `npm test`).
// Dos grupos de tests, cada uno en su carpeta:
// - rapidos: lógica pura y reglas del proyecto. Sin Docker ni internet; tardan segundos (`npm run test:rapidos`).
// - externos: la copia local de Supabase (Docker), Kroki y OpenAI de verdad (`npm run test:externos`).
// `npm test` corre los dos.
export default defineConfig({
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
          include: ["backend/tests/rapidos/**/*.test.ts"],
          // El primer test de arquitectura carga ESLint en frío (unos segundos).
          testTimeout: 20_000,
        },
      },
      {
        extends: true,
        test: {
          name: "externos",
          include: ["backend/tests/externos/**/*.test.ts"],
          // Busca la Supabase local antes de empezar (y avisa si Docker no está corriendo).
          globalSetup: ["backend/tests/setup/supabaseLocal.setup.ts"],
          // Cada test habla con la base local, Kroki u OpenAI por HTTP: más margen que los 5 s por defecto.
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
