import { z } from "zod";

// El análisis previo de un ejercicio (variables, eventos, T.E.I. y T.E.F.) y las reglas de la cátedra que tiene
// que cumplir (sección 2 y 3 de la base de conocimiento). Lógica pura: el modelo arma el análisis razonando sobre
// el enunciado, y acá se revisa que respete las reglas antes de mostrárselo al alumno.

const Nombre = z.string().trim().min(1).max(40);

const VariableSchema = z.object({
  nombre: Nombre.describe("Como la escribe la cátedra, ej: 'IA', 'NS', 'TPS(i)', 'PTO'"),
  descripcion: z.string().trim().min(1).max(200).describe("Qué es, ej: 'intervalo entre arribos (min)'"),
});

export const AnalisisSchema = z.object({
  metodologia: z.string().trim().min(3).max(60).describe("La metodología que corresponde, ej: 'Evento a Evento'"),
  variables: z.object({
    datos: z.array(VariableSchema).max(10).describe("Exógenas no controlables: responden a una f.d.p."),
    control: z.array(VariableSchema).max(10).describe("Exógenas de control; vacío si el enunciado no tiene"),
    resultado: z.array(VariableSchema).min(1).max(10).describe("Lo que pide medir el enunciado"),
    estado: z.array(VariableSchema).min(1).max(10).describe("Describen el estado del sistema, ej: NS"),
  }),
  eventos: z
    .array(
      z.object({
        nombre: Nombre.describe("El evento, ej: 'LLEGADA', 'SALIDA'"),
        tef: Nombre.describe("Su variable de la T.E.F., ej: 'TPLL', 'TPS'"),
        modifica: z
          .array(Nombre)
          .min(1)
          .max(10)
          .describe("Las variables de estado que cambia este evento, ej: ['NS']. Si no cambia ninguna, no es evento"),
      })
    )
    .min(1)
    .max(10),
  tei: z
    .array(
      z.object({
        evento: Nombre,
        efnc: Nombre.nullable().describe("E.F.NO C.: el mismo evento de la fila, o null si no genera ninguno"),
        efc: z
          .array(
            z.object({
              evento: Nombre.describe("El evento que se genera si se cumple la condición"),
              condicion: z.string().trim().min(1).max(100).describe("Con variables de estado, ej: 'NS = 1'"),
            })
          )
          .max(6)
          .describe("E.F.C.: cada uno con su condición; vacío si no genera ninguno"),
      })
    )
    .min(1)
    .max(10)
    .describe("Una fila por evento"),
});

export type Analisis = z.infer<typeof AnalisisSchema>;

type FilaTei = Analisis["tei"][number];

/**
 * La T.E.I. con cada evento una sola vez: si un evento vino en varias filas (una por E.F.C., como se escribe en la
 * cátedra cuando genera dos eventos condicionados), se juntan sus E.F.C. en una. Así la vista las muestra ordenadas.
 */
export function teiPorEvento(tei: FilaTei[]): FilaTei[] {
  const porEvento = new Map<string, FilaTei>();
  for (const fila of tei) {
    const anterior = porEvento.get(clave(fila.evento));
    if (!anterior) {
      porEvento.set(clave(fila.evento), { ...fila, efc: [...fila.efc] });
    } else {
      anterior.efnc ??= fila.efnc;
      anterior.efc.push(...fila.efc);
    }
  }
  return [...porEvento.values()];
}

/** Para comparar nombres: sin tildes, sin espacios de más, en mayúsculas ("Llegada" = "LLEGADA"). */
function clave(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toUpperCase();
}

/** El nombre de una variable sin su índice: "TPS(i)" → "TPS". */
function base(nombre: string): string {
  return clave(nombre).replace(/\s*\(.*\)\s*$/, "");
}

/** Los nombres (en clave) que aparecen en una condición: "NS(i) >= 1 y TPLL < TF" → NS, TPLL, TF. */
function identificadores(condicion: string): string[] {
  return [...clave(condicion).matchAll(/[A-Z_][A-Z0-9_]*/g)].map((m) => m[0]);
}

const CATEGORIAS = ["datos", "control", "resultado", "estado"] as const;
const NOMBRE_DE_CATEGORIA = { datos: "un dato", control: "de control", resultado: "de resultado", estado: "de estado" };

/**
 * Las reglas de la cátedra que el análisis no cumple, explicadas para que el modelo las corrija. Vacío si cumple
 * todas. Solo se revisa la forma: si el análisis interpreta bien el enunciado lo decide el modelo razonando.
 */
export function problemasDelAnalisis(analisis: Analisis): string[] {
  const problemas: string[] = [];
  const { variables, eventos, tei } = analisis;

  // --- Variables
  const categoriaDe = new Map<string, (typeof CATEGORIAS)[number]>();
  for (const categoria of CATEGORIAS) {
    for (const variable of variables[categoria]) {
      const nombre = base(variable.nombre);
      if (nombre === "T") {
        problemas.push("T es el reloj de la simulación: no se clasifica como variable (sacala de las variables).");
        continue;
      }
      const anterior = categoriaDe.get(nombre);
      if (anterior && anterior !== categoria) {
        problemas.push(
          `${variable.nombre} está como ${NOMBRE_DE_CATEGORIA[anterior]} y como ${NOMBRE_DE_CATEGORIA[categoria]}: ` +
            "cada variable va en una sola categoría."
        );
      }
      categoriaDe.set(nombre, categoria);
    }
  }

  // --- Eventos y T.E.F.
  const nombresDeEventos = new Set<string>();
  const variablesTef = new Set<string>();
  for (const evento of eventos) {
    const nombre = clave(evento.nombre);
    if (nombresDeEventos.has(nombre))
      problemas.push(`El evento ${evento.nombre} está repetido en la lista de eventos.`);
    nombresDeEventos.add(nombre);
    const tef = base(evento.tef);
    if (variablesTef.has(tef)) {
      problemas.push(`${evento.tef} es la variable de la T.E.F. de más de un evento: cada evento tiene la suya.`);
    }
    variablesTef.add(tef);
  }

  // --- Con N puestos (la cantidad es de control), lo de cada puesto va indexado: TPS(i), NS(i) o TC(i).
  const hayNPuestos = variables.control.some((variable) =>
    /puesto|servidor|caja|maquina|mecanico|empleado|cajero|box|consultorio/i.test(clave(variable.descripcion))
  );
  const hayIndexadas = [...variables.estado.map((v) => v.nombre), ...eventos.map((e) => e.tef)].some((nombre) =>
    /\(\s*\w+\s*\)/.test(nombre)
  );
  if (hayNPuestos && !hayIndexadas) {
    problemas.push(
      "La cantidad de puestos es de control (N), pero nada está indexado por puesto: con N puestos, lo de cada " +
        "puesto va con su índice (TPS(i) y SALIDA(i), NS(i) si cada uno tiene su cola, o TC(i) con tiempo comprometido)."
    );
  }

  // --- Un evento es lo que modifica al menos una variable de estado; una de estado es la que modifica un evento.
  const modificadas = new Set<string>();
  for (const evento of eventos) {
    const deEstado = evento.modifica.filter((nombre) => categoriaDe.get(base(nombre)) === "estado");
    for (const nombre of evento.modifica) {
      if (categoriaDe.get(base(nombre)) !== "estado") {
        problemas.push(
          `${evento.nombre} modifica ${nombre}, que no está entre las variables de estado: lo que cambia un evento ` +
            "es una variable de estado (o no es algo que cambie el evento)."
        );
      }
    }
    if (deEstado.length === 0) {
      problemas.push(
        `${evento.nombre} no modifica ninguna variable de estado: un evento es solo lo que cambia el estado del ` +
          "sistema. Si no cambia ninguna, es una decisión dentro de otro evento."
      );
    }
    for (const nombre of deEstado) modificadas.add(base(nombre));
  }
  for (const variable of variables.estado) {
    if (base(variable.nombre) !== "T" && !modificadas.has(base(variable.nombre))) {
      problemas.push(
        `${variable.nombre} está como variable de estado, pero ningún evento la modifica: las de estado son las que ` +
          "cambian con los eventos."
      );
    }
  }

  // --- T.E.I.: solo eventos, y cada evento con su E.F.NO C. (sus E.F.C. pueden venir en varias filas)
  for (const fila of tei) {
    if (!nombresDeEventos.has(clave(fila.evento))) {
      problemas.push(
        `La fila «${fila.evento}» de la T.E.I. no es un evento de la lista: en la T.E.I. solo van eventos independientes.`
      );
    }
  }
  for (const evento of eventos) {
    const filas = tei.filter((fila) => clave(fila.evento) === clave(evento.nombre));
    if (filas.length === 0) problemas.push(`Falta la fila del evento ${evento.nombre} en la T.E.I.`);
    const efncDistintos = new Set(filas.flatMap((fila) => (fila.efnc === null ? [] : [clave(fila.efnc)])));
    if (efncDistintos.size > 1) {
      problemas.push(
        `El evento ${evento.nombre} tiene dos E.F.NO C. distintos en la T.E.I.: tiene uno solo (el mismo evento) o ` +
          "ninguno. Si genera varios eventos con condición, cada uno va en su fila como E.F.C."
      );
    }
  }

  // --- E.F.NO C., E.F.C. y condiciones
  const generados = new Set<string>();
  for (const fila of tei) {
    if (fila.efnc !== null) {
      if (clave(fila.efnc) === clave(fila.evento)) {
        generados.add(clave(fila.efnc));
      } else {
        problemas.push(
          `En la fila ${fila.evento}, el E.F.NO C. es ${fila.efnc}: tiene que ser el mismo evento de la fila ` +
            `(${fila.evento}) o nada. Un evento no genera otro distinto sin que medie una condición (eso es un E.F.C.).`
        );
      }
    }
    for (const { evento, condicion } of fila.efc) {
      if (!nombresDeEventos.has(clave(evento))) {
        problemas.push(`En la fila ${fila.evento}, el E.F.C. «${evento}» no es un evento de la lista.`);
      } else {
        generados.add(clave(evento));
      }
      const usadas = identificadores(condicion).map((nombre) => ({ nombre, categoria: categoriaDe.get(nombre) }));
      for (const { nombre, categoria } of usadas) {
        if (categoria === "datos" || categoria === "resultado") {
          problemas.push(
            `La condición «${condicion}» (fila ${fila.evento}) usa ${nombre}, que es ${NOMBRE_DE_CATEGORIA[categoria]}: ` +
              "en CONDICIÓN van variables de estado (y, si hace falta, de control o de la T.E.F.)."
          );
        }
      }
      const usaEstado = usadas.some(({ nombre, categoria }) => categoria === "estado" || variablesTef.has(nombre));
      if (!usaEstado) {
        problemas.push(
          `La condición «${condicion}» (fila ${fila.evento}) no usa ninguna variable de estado: la condición que ` +
            "encadena eventos se escribe con las variables de estado."
        );
      }
    }
  }
  if (!tei.some((fila) => fila.efnc !== null)) {
    problemas.push("Ninguna fila tiene E.F.NO C.: sin un evento que se genere a sí mismo, la simulación no avanza.");
  }
  for (const evento of eventos) {
    if (!generados.has(clave(evento.nombre))) {
      problemas.push(
        `El evento ${evento.nombre} no lo genera ninguna fila (ni como E.F.NO C. ni como E.F.C.): así nunca sucede.`
      );
    }
  }

  return problemas;
}
