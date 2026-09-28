import { describe, expect, it } from "vitest";
import { verificarFdp } from "@/backend/models/dominio/fdp";
import { crearToolsFdp, verificarFdpDesdeTool } from "@/backend/tools/fdp.tools";

// Sin mocks: cálculo numérico real sobre f.d.p. del TP 4 de la cátedra. Un caso por cosa que verifica.

/** f(x) = (x − 1)/18 en (1, 7) — TP 4, método de la inversa: F(x) = (x − 1)²/36 → x = 6√R + 1. */
const LINEAL = { fx: "(x - 1)/18", a: 1, b: 7 };

describe("verificarFdp", () => {
  it("método de la inversa: una inversa correcta pasa (F(x) vuelve a dar R)", () => {
    const resultado = verificarFdp({ ...LINEAL, inversa: "6*sqrt(R) + 1" });

    expect(resultado).toMatchObject({ ok: true, valida: true, area: 1, inversa: { correcta: true } });
  });

  it("método del rechazo: el M correcto pasa — f(x) = −x²/36 + x/6 en (0, 6), M = f(3) = 1/4", () => {
    const resultado = verificarFdp({ fx: "-x^2/36 + x/6", a: 0, b: 6, M: 0.25 });

    expect(resultado).toMatchObject({ ok: true, valida: true, maximo: { M: 0.25, x: 3 }, MCoincide: true });
  });

  it("la inversa falla si la fórmula está mal: x cae en el intervalo, pero F(x) no da R", () => {
    const resultado = verificarFdp({ ...LINEAL, inversa: "6*R + 1" });

    expect(resultado).toMatchObject({ ok: true, valida: true, inversa: { correcta: false } });
    if (resultado.ok) expect(resultado.conclusiones.join(" ")).toMatch(/La inversa está mal: con R = .*, pero F\(/);
  });

  it("la inversa falla si da valores fuera del intervalo", () => {
    // Se sumó 10 en vez de 1: para cualquier R da x > 7, fuera de (1, 7).
    const resultado = verificarFdp({ ...LINEAL, inversa: "6*sqrt(R) + 10" });

    expect(resultado).toMatchObject({ ok: true, inversa: { correcta: false } });
    if (resultado.ok) expect(resultado.conclusiones.join(" ")).toContain("fuera del intervalo");
  });

  it("una función que no integra 1 no es válida, y se dice qué k la deja libre de incógnitas", () => {
    const resultado = verificarFdp({ fx: "k*(x - 1)", a: 1, b: 7 });

    expect(resultado).toMatchObject({ ok: true, valida: false, kQueLaHaceValida: 0.055556 }); // k = 1/18
  });
});

describe("la tool verificar_fdp", () => {
  it('acepta b = "infinito" para f.d.p. de x ≥ a (JSON no tiene Infinity)', () => {
    const resultado = verificarFdpDesdeTool({ fx: "5*exp(-5*x)", a: 0, b: "infinito", inversa: "-log(1 - R)/5" });

    expect(resultado).toMatchObject({ ok: true, valida: true, inversa: { correcta: true } });
  });

  it("dice en su descripción que se usa siempre al resolver o corregir una f.d.p.", () => {
    expect(crearToolsFdp().verificar_fdp.description).toContain("Usala SIEMPRE que resuelvas o corrijas una f.d.p.");
  });
});
