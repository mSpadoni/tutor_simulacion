import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

// Sin mocks: el ESLint real del proyecto (eslint.config.mjs) revisa código de ejemplo como si estuviera en cada carpeta.
// Así se prueba que las reglas de dependencia de la arquitectura de verdad se cumplen solas.

const eslint = new ESLint({ cwd: process.cwd() });

/** Los errores de dependencia que ESLint marca para `codigo` si estuviera en `archivo`. */
async function erroresDeDependencia(codigo: string, archivo: string): Promise<string[]> {
  const [resultado] = await eslint.lintText(codigo, { filePath: archivo });
  return resultado.messages
    .filter((mensaje) => mensaje.ruleId === "@typescript-eslint/no-restricted-imports")
    .map((mensaje) => mensaje.message);
}

describe("reglas de dependencia (ESLint)", () => {
  it("las views no importan el backend ni Supabase; entre views, sí", async () => {
    const archivo = "views/chat/Ejemplo.tsx";

    expect(
      await erroresDeDependencia('import { chatController } from "@/backend/controllers/chat.controller";', archivo)
    ).toEqual([expect.stringContaining("Las views no importan el backend")]);
    expect(await erroresDeDependencia('import { createClient } from "@supabase/supabase-js";', archivo)).toHaveLength(
      1
    );
    expect(await erroresDeDependencia('import MessageInput from "@/views/chat/MessageInput";', archivo)).toEqual([]);
  });

  it("el backend no depende de las rutas ni de las views", async () => {
    expect(
      await erroresDeDependencia(
        'import { mensajeDeError } from "@/views/chat/tipos";',
        "backend/controllers/ejemplo.ts"
      )
    ).toEqual([expect.stringContaining("El backend no depende de las rutas")]);
  });

  it("las rutas pasan por un controller: no usan Supabase ni los repositorios directamente", async () => {
    const archivo = "app/ejemplo/page.tsx";

    expect(
      await erroresDeDependencia('import { crearClienteServidor } from "@/backend/lib/supabase/server";', archivo)
    ).toEqual([expect.stringContaining("pasan por un controller")]);
    expect(
      await erroresDeDependencia(
        'import { conversacionesModel } from "@/backend/models/repositorios/conversaciones.model";',
        archivo
      )
    ).toHaveLength(1);
    expect(
      await erroresDeDependencia('import { responderComoTutor } from "@/backend/tutor/agente";', archivo)
    ).toHaveLength(1);
    // Los errores para el alumno sí: la ruta los traduce a JSON.
    expect(await erroresDeDependencia('import { ErrorDeChat } from "@/backend/tutor/errores";', archivo)).toEqual([]);
    expect(
      await erroresDeDependencia(
        'import { conversacionesController } from "@/backend/controllers/conversaciones.controller";',
        archivo
      )
    ).toEqual([]);
  });

  it("shared/ es lógica pura para servidor y navegador: no importa backend ni SDKs; las views y el backend lo usan", async () => {
    expect(await erroresDeDependencia('import { envSupabase } from "@/backend/lib/env";', "shared/ejemplo.ts")).toEqual(
      [expect.stringContaining("shared/ es lógica pura")]
    );
    expect(await erroresDeDependencia('import { streamText } from "ai";', "shared/ejemplo.ts")).toHaveLength(1);
    expect(await erroresDeDependencia('import type { UIMessage } from "ai";', "shared/ejemplo.ts")).toEqual([]);
    // Solo tipos del backend (así se deriva el tipo de los mensajes de las tools reales): no llega código al navegador.
    expect(
      await erroresDeDependencia('import type { ToolsDelTutor } from "@/backend/tools/tutor.tools";', "shared/x.ts")
    ).toEqual([]);
    expect(
      await erroresDeDependencia('import { tituloDesde } from "@/shared/conversaciones";', "views/chat/Ejemplo.tsx")
    ).toEqual([]);
    expect(
      await erroresDeDependencia('import { tituloDesde } from "@/shared/conversaciones";', "backend/controllers/x.ts")
    ).toEqual([]);
  });

  it("el dominio es lógica pura: sin Next ni infraestructura, pero puede importar solo tipos", async () => {
    const archivo = "backend/models/dominio/fdp.ts";

    expect(await erroresDeDependencia('import { NextResponse } from "next/server";', archivo)).toEqual([
      expect.stringContaining("El dominio es lógica pura"),
    ]);
    expect(
      await erroresDeDependencia('import { crearModeloOpenAI } from "@/backend/lib/openai";', archivo)
    ).toHaveLength(1);
    expect(await erroresDeDependencia('import type { User } from "@supabase/supabase-js";', archivo)).toEqual([]);
    // Tampoco usa los repositorios: la regla vale para cualquier archivo nuevo de models/dominio/.
    expect(
      await erroresDeDependencia(
        'import { ejerciciosModel } from "@/backend/models/repositorios/ejercicios.model";',
        "backend/models/dominio/nuevo.ts"
      )
    ).toHaveLength(1);
  });
});

/** Los .ts de una carpeta de backend (sin los tests). */
const archivosDe = (carpeta: string) =>
  readdirSync(carpeta)
    .filter((archivo) => archivo.endsWith(".ts"))
    .map((archivo) => path.join(carpeta, archivo));

describe("server-only", () => {
  // Módulos que usan Supabase, OpenAI, Kroki o el disco: si alguien los importa desde un Client Component,
  // el build falla (en vez de mandar código del servidor, o claves, al navegador).
  const delServidor = [
    ...archivosDe("backend/controllers"),
    ...archivosDe("backend/tools"),
    ...archivosDe("backend/tutor"),
    ...archivosDe("backend/models/repositorios"),
    "backend/models/materialCatedra.model.ts",
    "backend/lib/openai.ts",
    "backend/lib/kroki.ts",
    "backend/lib/supabase/server.ts",
    "backend/lib/prompts/systemPrompt.ts",
  ];

  it.each(delServidor)('%s empieza con import "server-only"', (archivo) => {
    expect(readFileSync(archivo, "utf8").startsWith('import "server-only";')).toBe(true);
  });

  it("el dominio (lógica pura) no lo usa: se puede usar desde cualquier lado", () => {
    for (const archivo of archivosDe("backend/models/dominio")) {
      expect(readFileSync(archivo, "utf8"), archivo).not.toContain(`import "server-only"`);
    }
  });

  it("lo que usa el middleware (Edge) tampoco: env.ts y el cliente de Supabase del middleware", () => {
    for (const archivo of ["backend/lib/env.ts", "backend/lib/supabase/middleware.ts"]) {
      expect(readFileSync(archivo, "utf8"), archivo).not.toContain(`import "server-only"`);
    }
  });
});

describe("sin recargas innecesarias", () => {
  it("ninguna view vuelve a pedir la página entera (router.refresh): el sidebar se actualiza con lo que ya sabe", () => {
    const conRefresh = readdirSync("views", { recursive: true, encoding: "utf8" })
      .filter((archivo) => /\.tsx?$/.test(archivo))
      .filter((archivo) => readFileSync(path.join("views", archivo), "utf8").includes("router.refresh"));

    expect(conRefresh).toEqual([]);
  });
});

describe("variables de entorno en un solo lugar", () => {
  it("solo backend/lib/env.ts lee process.env (fuera de los tests)", () => {
    const leen = (carpeta: string): string[] =>
      readdirSync(carpeta, { withFileTypes: true, recursive: true })
        .filter((entrada) => entrada.isFile() && /\.tsx?$/.test(entrada.name))
        .map((entrada) => path.join(entrada.parentPath, entrada.name))
        .filter((archivo) => !archivo.includes(`${path.sep}tests${path.sep}`))
        .filter((archivo) => readFileSync(archivo, "utf8").includes("process.env"));

    expect([...leen("backend"), ...leen("app"), ...leen("views")]).toEqual([path.join("backend", "lib", "env.ts")]);
  });
});
