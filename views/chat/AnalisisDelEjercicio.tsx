import { AvisosDeRevision } from "./AvisosDeRevision";
import type { AnalisisParaMostrar } from "./tipos";

// El análisis previo que el tutor verificó con las reglas de la cátedra, en el formato de la cátedra: metodología,
// clasificación de variables, T.E.I. (EVENTO | E.F.NO C. | E.F.C. | CONDICIÓN) y T.E.F. Se arma desde los datos
// validados, así el formato es siempre el mismo aunque el modelo lo escriba distinto.

type Variable = AnalisisParaMostrar["variables"]["datos"][number];

const CATEGORIAS = [
  { clave: "datos", titulo: "Datos" },
  { clave: "control", titulo: "Control" },
  { clave: "resultado", titulo: "Resultado" },
  { clave: "estado", titulo: "Estado" },
] as const;

const celda = "border border-slate-300 px-2 py-1 align-top";
const encabezado = "border border-slate-300 bg-slate-100 px-2 py-1 font-semibold";

/** "IA (intervalo entre arribos), TA (tiempo de atención)", o "---" si la categoría está vacía. */
function listaDeVariables(variables: Variable[], siNoHay = "---"): string {
  if (variables.length === 0) return siNoHay;
  return variables.map((variable) => `${variable.nombre} (${variable.descripcion})`).join(", ");
}

export function AnalisisDelEjercicio({ analisis, avisos }: { analisis: AnalisisParaMostrar; avisos: string[] }) {
  return (
    <section aria-label="Análisis del ejercicio" className="my-2 space-y-3 text-sm">
      <p>
        <span className="font-semibold">Metodología:</span> {analisis.metodologia}
      </p>

      <div>
        <p className="mb-1 font-semibold">Clasificación de variables</p>
        <ul className="space-y-0.5">
          {CATEGORIAS.map(({ clave, titulo }) => (
            <li key={clave}>
              {/* Como en la cátedra: sin variable de control se escribe "implícita". */}
              <span className="font-medium">{titulo}:</span>{" "}
              {listaDeVariables(analisis.variables[clave], clave === "control" ? "implícita" : "---")}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1 font-semibold">T.E.I. (Tabla de Eventos Independientes)</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className={encabezado}>EVENTO</th>
                <th className={encabezado}>E.F.NO C.</th>
                <th className={encabezado}>E.F.C.</th>
                <th className={encabezado}>CONDICIÓN</th>
              </tr>
            </thead>
            <tbody>
              {analisis.tei.map((fila) => (
                <tr key={fila.evento}>
                  <td className={celda}>{fila.evento}</td>
                  <td className={celda}>{fila.efnc ?? "---"}</td>
                  {/* Varios E.F.C. van en la misma fila, uno por línea, alineados con su condición. */}
                  <td className={celda}>
                    {fila.efc.length === 0 ? "---" : fila.efc.map((efc, i) => <div key={i}>{efc.evento}</div>)}
                  </td>
                  <td className={celda}>
                    {fila.efc.length === 0 ? "---" : fila.efc.map((efc, i) => <div key={i}>{efc.condicion}</div>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="mb-1 font-semibold">T.E.F. (Tabla de Eventos Futuros)</p>
        <div className="overflow-x-auto">
          <table className="border-collapse text-left">
            <thead>
              <tr>
                <th className={encabezado}>EVENTO</th>
                <th className={encabezado}>T.E.F.</th>
              </tr>
            </thead>
            <tbody>
              {analisis.eventos.map((evento) => (
                <tr key={evento.nombre}>
                  <td className={celda}>{evento.nombre}</td>
                  <td className={celda}>{evento.tef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AvisosDeRevision avisos={avisos} />
    </section>
  );
}
