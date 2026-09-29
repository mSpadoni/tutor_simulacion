import { afterEach, describe, expect, it } from "vitest";
import { ClienteKroki, MAX_CARACTERES_SVG } from "@/backend/lib/kroki";
import { levantarServidor, type Respuesta, type ServidorLocal } from "../helpers/servidorHttpLocal";

// Cómo maneja ClienteKroki cada respuesta posible del servicio, contra un servidor HTTP real en esta máquina
// (sin internet ni servicios públicos): así cada caso es determinista y se puede contar cuántos pedidos hizo.

const DIAGRAMA = 'flowchart TD\n  CI[["C.I."]] --> B["T = TPLL"]';
const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><text>TPLL</text></svg>';
const comoSvg = { "content-type": "image/svg+xml" };

let servidor: ServidorLocal | undefined;
afterEach(async () => {
  await servidor?.cerrar();
  servidor = undefined;
});

/** Un servidor que responde `respuestas` en orden (la última se repite) y un cliente apuntado a él. */
async function clienteContra(respuestas: Respuesta[], opciones: ConstructorParameters<typeof ClienteKroki>[0] = {}) {
  servidor = await levantarServidor((numero) => respuestas[Math.min(numero, respuestas.length) - 1]);
  return new ClienteKroki({ endpoint: servidor.url, esperaSinRetryAfterMs: 0, ...opciones });
}

describe("ClienteKroki.renderizar — respuestas del servicio", () => {
  it("un 200 con un SVG devuelve el SVG, en un solo pedido", async () => {
    const kroki = await clienteContra([{ status: 200, headers: comoSvg, cuerpo: SVG }]);

    expect(await kroki.renderizar(DIAGRAMA)).toEqual({ ok: true, svg: SVG });
    expect(servidor!.pedidos()).toBe(1);
  });

  it("lo que no es un diagrama se rechaza sin hacer ningún pedido", async () => {
    const kroki = await clienteContra([{ status: 200, headers: comoSvg, cuerpo: SVG }]);

    expect(await kroki.renderizar("esto no es un diagrama")).toMatchObject({ ok: false, motivo: "codigo_invalido" });
    expect(servidor!.pedidos()).toBe(0);
  });

  it("un 400 es un error de sintaxis: devuelve el detalle del servicio y no reintenta (no lo arreglaría)", async () => {
    const kroki = await clienteContra([{ status: 400, cuerpo: "Error: Parse error on line 2" }]);

    expect(await kroki.renderizar(DIAGRAMA)).toEqual({
      ok: false,
      motivo: "sintaxis",
      detalle: "Error: Parse error on line 2",
    });
    expect(servidor!.pedidos()).toBe(1);
  });
});

describe("ClienteKroki.renderizar — reintentos", () => {
  it("un 5xx se reintenta una vez; si sigue fallando, avisa que el servicio falló", async () => {
    const kroki = await clienteContra([{ status: 500 }]);

    expect(await kroki.renderizar(DIAGRAMA)).toMatchObject({ ok: false, motivo: "servicio" });
    expect(servidor!.pedidos()).toBe(2);
  });

  it("si el reintento sale bien, devuelve el SVG", async () => {
    const kroki = await clienteContra([{ status: 503 }, { status: 200, headers: comoSvg, cuerpo: SVG }]);

    expect(await kroki.renderizar(DIAGRAMA)).toEqual({ ok: true, svg: SVG });
    expect(servidor!.pedidos()).toBe(2);
  });

  it("un 429 sin Retry-After espera lo configurado, reintenta y, si sigue, avisa que hay demasiados pedidos", async () => {
    const kroki = await clienteContra([{ status: 429 }]);

    expect(await kroki.renderizar(DIAGRAMA)).toMatchObject({ ok: false, motivo: "limite" });
    expect(servidor!.pedidos()).toBe(2);
  });

  it("un 429 que pide esperar más de lo aceptable no se reintenta", async () => {
    const kroki = await clienteContra([{ status: 429, headers: { "retry-after": "60" } }], {
      maxEsperaReintentoMs: 3000,
    });

    expect(await kroki.renderizar(DIAGRAMA)).toMatchObject({ ok: false, motivo: "limite" });
    expect(servidor!.pedidos()).toBe(1);
  });
});

describe("ClienteKroki.renderizar — respuestas inválidas", () => {
  it("un 200 que no es un SVG no se acepta", async () => {
    const kroki = await clienteContra([
      { status: 200, headers: { "content-type": "application/json" }, cuerpo: '{"hola":1}' },
    ]);

    expect(await kroki.renderizar(DIAGRAMA)).toMatchObject({ ok: false, motivo: "respuesta_invalida" });
  });

  it("un SVG desmedido no se acepta (no se guarda ni se muestra)", async () => {
    const enorme = `<svg xmlns="http://www.w3.org/2000/svg">${"<g/>".repeat(MAX_CARACTERES_SVG / 4)}</svg>`;
    const kroki = await clienteContra([{ status: 200, headers: comoSvg, cuerpo: enorme }]);

    expect(await kroki.renderizar(DIAGRAMA)).toMatchObject({ ok: false, motivo: "respuesta_invalida" });
  });
});
