import { describe, expect, it } from "vitest";
import { armarSystemPrompt } from "@/backend/lib/prompts/systemPrompt";
import { AnalisisSchema, problemasDelAnalisis, type Analisis } from "@/backend/models/dominio/analisis";
import {
  crearToolsAnalisis,
  type AnalisisVerificado,
  RECHAZOS_POR_RESPUESTA,
  resumenDelAnalisis,
  verificarAnalisis,
} from "@/backend/tools/analisis.tools";

// Las reglas de la cátedra para el análisis previo (sección 2 y 3 de la base de conocimiento). Lógica pura.

/** 1 puesto, 1 cola (la clase de Evento a Evento): cumple todas las reglas. */
const CORRECTO: Analisis = {
  metodologia: "Evento a Evento",
  variables: {
    datos: [
      { nombre: "IA", descripcion: "intervalo entre arribos" },
      { nombre: "TA", descripcion: "tiempo de atención" },
    ],
    control: [],
    resultado: [
      { nombre: "PPS", descripcion: "promedio de permanencia" },
      { nombre: "PTO", descripcion: "porcentaje de tiempo ocioso" },
    ],
    estado: [{ nombre: "NS", descripcion: "clientes en el sistema" }],
  },
  eventos: [
    { nombre: "LLEGADA", tef: "TPLL", modifica: ["NS"] },
    { nombre: "SALIDA", tef: "TPS", modifica: ["NS"] },
  ],
  tei: [
    { evento: "LLEGADA", efnc: "LLEGADA", efc: [{ evento: "SALIDA", condicion: "NS = 1" }] },
    { evento: "SALIDA", efnc: null, efc: [{ evento: "SALIDA", condicion: "NS ≥ 1" }] },
  ],
};

/** Una copia del análisis correcto con algunos cambios. */
const con = (cambios: Partial<Analisis>): Analisis => structuredClone({ ...CORRECTO, ...cambios });

describe("problemasDelAnalisis", () => {
  it("el caso base de la cátedra cumple todas las reglas", () => {
    expect(problemasDelAnalisis(CORRECTO)).toEqual([]);
  });

  it("el ejemplo del prompt cumple el esquema y todas las reglas", () => {
    const ejemplo = armarSystemPrompt().match(/`(\{"metodologia"[\s\S]*?\})`/)?.[1];

    expect(ejemplo).toBeDefined();
    const analisis = AnalisisSchema.parse(JSON.parse(ejemplo!));
    expect(problemasDelAnalisis(analisis)).toEqual([]);
  });

  it("un evento en varias filas: va una sola fila, con todos sus E.F.C.", () => {
    const analisis = con({
      tei: [
        { evento: "LLEGADA", efnc: "LLEGADA", efc: [] },
        { evento: "LLEGADA", efnc: null, efc: [{ evento: "SALIDA", condicion: "NS = 1" }] },
        { evento: "SALIDA", efnc: null, efc: [{ evento: "SALIDA", condicion: "NS ≥ 1" }] },
      ],
    });

    expect(problemasDelAnalisis(analisis)).toEqual([expect.stringContaining("LLEGADA tiene 2 filas en la T.E.I.")]);
  });

  it("en E.F.NO C. va el mismo evento o nada: otro evento es un error", () => {
    const analisis = con({
      tei: [
        { evento: "LLEGADA", efnc: "SALIDA", efc: [] },
        { evento: "SALIDA", efnc: null, efc: [{ evento: "SALIDA", condicion: "NS ≥ 1" }] },
      ],
    });

    const problemas = problemasDelAnalisis(analisis);
    expect(problemas).toContainEqual(expect.stringContaining("En la fila LLEGADA, el E.F.NO C. es SALIDA"));
  });

  it("en la T.E.I. solo van eventos: una fila o un E.F.C. que no es un evento se marca", () => {
    const analisis = con({
      tei: [
        ...CORRECTO.tei,
        { evento: "ABRIR GRUPO", efnc: null, efc: [] },
        { evento: "SALIDA", efnc: null, efc: [] },
      ].slice(0, 3),
    });
    analisis.tei[0].efc.push({ evento: "RECHAZO", condicion: "NS > 4" });

    const problemas = problemasDelAnalisis(analisis);
    expect(problemas).toContainEqual(expect.stringContaining("La fila «ABRIR GRUPO» de la T.E.I. no es un evento"));
    expect(problemas).toContainEqual(expect.stringContaining("el E.F.C. «RECHAZO» no es un evento"));
  });

  it("falta la fila de un evento, y un evento que nada genera nunca sucede", () => {
    const analisis = con({ tei: [{ evento: "LLEGADA", efnc: "LLEGADA", efc: [] }] });

    const problemas = problemasDelAnalisis(analisis);
    expect(problemas).toContainEqual("Falta la fila del evento SALIDA en la T.E.I.");
    expect(problemas).toContainEqual(expect.stringContaining("El evento SALIDA no lo genera ninguna fila"));
  });

  it("la condición va con variables de estado: un dato o un resultado se marcan", () => {
    const analisis = con({
      tei: [
        { evento: "LLEGADA", efnc: "LLEGADA", efc: [{ evento: "SALIDA", condicion: "TA > 10" }] },
        { evento: "SALIDA", efnc: null, efc: [{ evento: "SALIDA", condicion: "PTO < 50 y NS > 0" }] },
      ],
    });

    const problemas = problemasDelAnalisis(analisis);
    expect(problemas).toContainEqual(expect.stringContaining("usa TA, que es un dato"));
    expect(problemas).toContainEqual(expect.stringContaining("La condición «TA > 10» (fila LLEGADA) no usa ninguna"));
    expect(problemas).toContainEqual(expect.stringContaining("usa PTO, que es de resultado"));
  });

  it("la condición puede usar variables de control y de la T.E.F., junto con las de estado; con índices también", () => {
    const analisis = con({
      variables: { ...CORRECTO.variables, control: [{ nombre: "N", descripcion: "cantidad de puestos" }] },
      eventos: [
        { nombre: "LLEGADA", tef: "TPLL", modifica: ["NS"] },
        { nombre: "SALIDA(i)", tef: "TPS(i)", modifica: ["NS"] },
      ],
      tei: [
        { evento: "LLEGADA", efnc: "LLEGADA", efc: [{ evento: "SALIDA(i)", condicion: "NS(i) <= N" }] },
        { evento: "SALIDA(i)", efnc: null, efc: [{ evento: "SALIDA(i)", condicion: "NS >= N y TPS(i) < HV" }] },
      ],
    });

    expect(problemasDelAnalisis(analisis)).toEqual([]);
  });

  it("un «evento» que no modifica ninguna variable de estado no es un evento (es una decisión dentro de otro)", () => {
    const analisis = con({
      eventos: [
        { nombre: "LLEGADA", tef: "TPLL", modifica: ["NS"] },
        { nombre: "SALIDA", tef: "TPS", modifica: ["NS"] },
        { nombre: "ARREPENTIMIENTO", tef: "TPA", modifica: ["PARR"] },
      ],
      tei: [...CORRECTO.tei, { evento: "ARREPENTIMIENTO", efnc: "ARREPENTIMIENTO", efc: [] }],
    });

    const problemas = problemasDelAnalisis(analisis);
    expect(problemas).toContainEqual(
      expect.stringContaining("ARREPENTIMIENTO modifica PARR, que no está entre las variables de estado")
    );
    expect(problemas).toContainEqual(expect.stringContaining("ARREPENTIMIENTO no modifica ninguna variable de estado"));
  });

  it("una variable de estado que ningún evento modifica no es de estado", () => {
    const analisis = con({
      variables: {
        ...CORRECTO.variables,
        estado: [...CORRECTO.variables.estado, { nombre: "ST", descripcion: "stock" }],
      },
    });

    expect(problemasDelAnalisis(analisis)).toEqual([
      expect.stringContaining("ST está como variable de estado, pero ningún evento la modifica"),
    ]);
  });

  it("T es el reloj: no se clasifica como variable", () => {
    const analisis = con({
      variables: {
        ...CORRECTO.variables,
        estado: [...CORRECTO.variables.estado, { nombre: "T", descripcion: "tiempo" }],
      },
    });

    expect(problemasDelAnalisis(analisis)).toEqual([expect.stringContaining("T es el reloj de la simulación")]);
  });

  it("una variable en dos categorías y una variable de T.E.F. para dos eventos se marcan", () => {
    const analisis = con({
      variables: { ...CORRECTO.variables, control: [{ nombre: "NS", descripcion: "otra vez" }] },
      eventos: [
        { nombre: "LLEGADA", tef: "TPLL", modifica: ["NS"] },
        { nombre: "SALIDA", tef: "TPLL", modifica: ["NS"] },
      ],
    });

    const problemas = problemasDelAnalisis(analisis);
    expect(problemas).toContainEqual(expect.stringContaining("NS está como de control y como de estado"));
    expect(problemas).toContainEqual(expect.stringContaining("TPLL es la variable de la T.E.F. de más de un evento"));
  });

  it("los nombres se comparan sin importar mayúsculas ni tildes", () => {
    const analisis = con({
      eventos: [
        { nombre: "Llegada", tef: "TPLL", modifica: ["NS"] },
        { nombre: "Salida", tef: "TPS", modifica: ["NS"] },
      ],
    });

    expect(problemasDelAnalisis(analisis)).toEqual([]);
  });
});

describe("verificar_analisis: lo que lee el modelo", () => {
  it("si pasó, le dice que el alumno ya ve las tablas y que no las repita", () => {
    const resultado = verificarAnalisis(CORRECTO);

    expect(resultado).toMatchObject({ ok: true, problemas: [] });
    expect(resumenDelAnalisis(resultado)).toContain("No las repitas en texto");
  });

  it("si no pasó, le lista cada regla que rompió y le pide corregir y volver a verificar", () => {
    const resultado = verificarAnalisis(con({ tei: [{ evento: "LLEGADA", efnc: "LLEGADA", efc: [] }] }));
    const resumen = resumenDelAnalisis(resultado);

    expect(resultado.ok).toBe(false);
    for (const problema of resultado.problemas) expect(resumen).toContain(`- ${problema}`);
    expect(resumen).toContain("volvé a llamar a verificar_analisis");
  });
});

describe("verificar_analisis: tope de rechazos por respuesta", () => {
  const opciones = { toolCallId: "t", messages: [], context: {} };
  /** Una llamada a la tool como la hace el SDK (acá execute devuelve el resultado, no un stream). */
  const verificar = async (herramienta: ReturnType<typeof crearToolsAnalisis>["verificar_analisis"]) =>
    (await herramienta.execute!(conProblemas, opciones)) as AnalisisVerificado;
  const conProblemas = con({ tei: [{ evento: "LLEGADA", efnc: "LLEGADA", efc: [] }] });

  it(`rechaza hasta ${RECHAZOS_POR_RESPUESTA} veces; después lo muestra igual, con los problemas como avisos`, async () => {
    const { verificar_analisis: herramienta } = crearToolsAnalisis();
    const intentos: AnalisisVerificado[] = [];
    for (let i = 0; i <= RECHAZOS_POR_RESPUESTA; i++) intentos.push(await verificar(herramienta));

    expect(intentos.map((intento) => intento.ok)).toEqual([...Array(RECHAZOS_POR_RESPUESTA).fill(false), true]);
    const ultimo = intentos.at(-1)!;
    expect(ultimo.problemas.length).toBeGreaterThan(0);
    expect(resumenDelAnalisis(ultimo)).toContain("No lo vuelvas a verificar");
  });

  it("cada respuesta empieza de cero: el tope no se arrastra a la próxima", async () => {
    const primera = crearToolsAnalisis().verificar_analisis;
    for (let i = 0; i < RECHAZOS_POR_RESPUESTA; i++) await verificar(primera);

    const nueva = crearToolsAnalisis().verificar_analisis;
    expect((await verificar(nueva)).ok).toBe(false);
  });
});

describe("problemasDelAnalisis — N puestos", () => {
  const conNPuestos = (cambios: Partial<Analisis>) =>
    con({
      variables: { ...CORRECTO.variables, control: [{ nombre: "N", descripcion: "cantidad de puestos de atención" }] },
      ...cambios,
    });

  it("si la cantidad de puestos es de control, lo de cada puesto va indexado", () => {
    expect(problemasDelAnalisis(conNPuestos({}))).toEqual([expect.stringContaining("nada está indexado por puesto")]);
  });

  it("con SALIDA(i) y TPS(i), o con TC(i) en tiempo comprometido, está bien", () => {
    const conTps = conNPuestos({
      eventos: [
        { nombre: "LLEGADA", tef: "TPLL", modifica: ["NS"] },
        { nombre: "SALIDA(i)", tef: "TPS(i)", modifica: ["NS"] },
      ],
      tei: [
        { evento: "LLEGADA", efnc: "LLEGADA", efc: [{ evento: "SALIDA(i)", condicion: "NS ≤ N" }] },
        { evento: "SALIDA(i)", efnc: null, efc: [{ evento: "SALIDA(i)", condicion: "NS ≥ N" }] },
      ],
    });
    const conTc = conNPuestos({
      variables: {
        ...CORRECTO.variables,
        control: [{ nombre: "N", descripcion: "cantidad de puestos" }],
        estado: [{ nombre: "TC(i)", descripcion: "tiempo comprometido de cada puesto" }],
      },
      eventos: [{ nombre: "LLEGADA", tef: "TPLL", modifica: ["TC(i)"] }],
      tei: [{ evento: "LLEGADA", efnc: "LLEGADA", efc: [] }],
    });

    expect(problemasDelAnalisis(conTps)).toEqual([]);
    expect(problemasDelAnalisis(conTc)).toEqual([]);
  });
});
