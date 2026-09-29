import type { Analisis } from "@/backend/models/dominio/analisis";

/** El análisis de N puestos con N colas (clase de la cátedra): cumple todas las reglas de verificar_analisis. */
export const ANALISIS_DE_PRUEBA: Analisis = {
  metodologia: "Evento a Evento",
  variables: {
    datos: [
      { nombre: "IA", descripcion: "intervalo entre arribos" },
      { nombre: "TA", descripcion: "tiempo de atención" },
    ],
    control: [{ nombre: "N", descripcion: "cantidad de puestos" }],
    resultado: [
      { nombre: "PPS", descripcion: "promedio de permanencia" },
      { nombre: "PTO(i)", descripcion: "porcentaje de tiempo ocioso de cada puesto" },
    ],
    estado: [{ nombre: "NS(i)", descripcion: "clientes en cada cola" }],
  },
  eventos: [
    { nombre: "LLEGADA", tef: "TPLL", modifica: ["NS(i)"] },
    { nombre: "SALIDA(i)", tef: "TPS(i)", modifica: ["NS(i)"] },
  ],
  tei: [
    { evento: "LLEGADA", efnc: "LLEGADA", efc: [{ evento: "SALIDA(i)", condicion: "NS(i) = 1" }] },
    { evento: "SALIDA(i)", efnc: null, efc: [{ evento: "SALIDA(i)", condicion: "NS(i) > 0" }] },
  ],
};
