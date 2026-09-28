import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Configuración de Vitest (el que corre `npm test`).
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
    include: ["backend/tests/**/*.test.ts"],
    globalSetup: ["backend/tests/setup/supabaseLocal.setup.ts"],
    // Solo las variables OPENAI_ de .env.local: las de Supabase real nunca llegan a los tests.
    env: loadEnv("test", process.cwd(), "OPENAI_"),
    // Cada test habla con la base local o con OpenAI por HTTP: más margen que los 5 s por defecto.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
