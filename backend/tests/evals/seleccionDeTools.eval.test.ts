import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { borrarAlumnosDePrueba } from "../helpers/alumnoDePrueba";
import { alumnoConChat, conversar, herramientas, mensajesGuardados } from "../helpers/chatDePrueba";

// EVALS: la conducta del modelo real (qué tools elige ante cada pedido). No es un contrato de la app sino una
// decisión probabilística del proveedor, así que cada caso se corre varias veces y se exige una tasa mínima,
// con temperatura 0 para que sea lo más estable posible. Gastan crédito: se corren con `npm run test:evals`
// al cambiar el prompt o las tools, no en cada `npm test`.
// Que la app ofrezca cada tool y que el prompt tenga cada regla se prueba sin modelo, en rapidos/.

const CORRIDAS = 3;
const MINIMO = 2; // de CORRIDAS

beforeAll(() => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Las evals necesitan OPENAI_API_KEY en .env.local (usan el modelo real). No se saltean.");
  }
});
afterAll(borrarAlumnosDePrueba);

/** Qué tools usó el tutor ante `pedido`, en una corrida. */
async function toolsUsadas(pedido: string): Promise<string[]> {
  const { conversaciones, controller } = await alumnoConChat({ pausaEntrePalabrasMs: 0, temperatura: 0 });
  const id = randomUUID();
  await conversar(controller, id, pedido);
  const [, tutor] = await mensajesGuardados(conversaciones, id, 2);
  return tutor ? herramientas(tutor) : [];
}

/**
 * Corre `pedido` CORRIDAS veces (una después de otra, para no disparar el rate limit) y cuenta en cuántas se
 * cumplió `condicion`. Deja la tasa en el log, para ver la tendencia aunque el caso pase.
 */
async function tasa(pedido: string, condicion: (tools: string[]) => boolean): Promise<number> {
  let cumplidas = 0;
  for (let i = 0; i < CORRIDAS; i++) if (condicion(await toolsUsadas(pedido))) cumplidas += 1;
  console.info(`[eval] ${cumplidas}/${CORRIDAS} — ${pedido}`);
  return cumplidas;
}

describe("selección de tools del modelo real", () => {
  it("una consulta de cómo se hace algo usa los modelos (y no la inspiración de ejercicios)", async () => {
    const cumplidas = await tasa(
      "¿Cómo calculo el PTO en un ejercicio de tiempo comprometido?",
      (tools) => tools.includes("consultar_modelos") && !tools.includes("inspiracion_para_ejercicio")
    );

    expect(cumplidas).toBeGreaterThanOrEqual(MINIMO);
  });

  it("para resolver un ejercicio de la anexa busca su enunciado y usa los modelos", async () => {
    const cumplidas = await tasa(
      "Resolveme el análisis previo del ejercicio Garage de la Guía Anexa.",
      (tools) => tools.includes("buscar_ejercicio") && tools.includes("consultar_modelos")
    );

    expect(cumplidas).toBeGreaterThanOrEqual(MINIMO);
  });

  it("al resolver un ejercicio completo, termina mostrando el diagrama de flujo", async () => {
    const cumplidas = await tasa("Resolveme el ejercicio Clínica de la Guía Anexa.", (tools) =>
      tools.includes("generar_diagrama_flujo")
    );

    expect(cumplidas).toBeGreaterThanOrEqual(MINIMO);
  });

  it("un ejercicio nuevo usa la inspiración, lo guarda y NO muestra el diagrama (revelaría la metodología)", async () => {
    const cumplidas = await tasa(
      "Dame un ejercicio nuevo para practicar, tipo parcial.",
      (tools) =>
        tools.includes("inspiracion_para_ejercicio") &&
        tools.includes("generar_ejercicio") &&
        !tools.includes("generar_diagrama_flujo")
    );

    expect(cumplidas).toBeGreaterThanOrEqual(MINIMO);
  });

  it("al resolver una f.d.p., la verifica con verificar_fdp", async () => {
    const cumplidas = await tasa(
      "Resolveme esta f.d.p. por el método más conveniente: f(x) = k·(x − 1) entre 1 y 7.",
      (tools) => tools.includes("verificar_fdp")
    );

    expect(cumplidas).toBeGreaterThanOrEqual(MINIMO);
  });

  it("si el alumno pide un diagrama, lo dibuja", async () => {
    const cumplidas = await tasa(
      "Dibujame el diagrama de flujo de la rutina de LLEGADA de un sistema con un puesto y una cola.",
      (tools) => tools.includes("generar_diagrama_flujo")
    );

    expect(cumplidas).toBeGreaterThanOrEqual(MINIMO);
  });
});
