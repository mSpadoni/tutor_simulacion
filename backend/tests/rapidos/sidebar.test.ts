import type { ParteDelTutor, TutorUIMessage } from "@/shared/chat";
import { describe, expect, it } from "vitest";
import {
  conActividad,
  conEjercicios,
  ejerciciosGuardadosEn,
  MAX_EJERCICIOS_EN_SIDEBAR,
  sinConversacion,
  type EstadoSidebar,
} from "@/views/chat/sidebar";

// Sin mocks: funciones puras con los mismos datos que maneja el sidebar.

const ESTADO: EstadoSidebar = {
  conversaciones: [
    { id: "a", titulo: "Colas" },
    { id: "b", titulo: "Stock" },
  ],
  ejercicios: [{ id: "e1", titulo: "Garage", conversacionId: "b" }],
};

describe("conActividad", () => {
  it("la conversación con actividad sube arriba, sin duplicarse ni cambiar su título", () => {
    expect(conActividad(ESTADO, { id: "b", titulo: "otro título" }).conversaciones).toEqual([
      { id: "b", titulo: "Stock" },
      { id: "a", titulo: "Colas" },
    ]);
  });

  it("una conversación nueva aparece arriba con su título", () => {
    expect(conActividad(ESTADO, { id: "c", titulo: "Dame un ejercicio" }).conversaciones[0]).toEqual({
      id: "c",
      titulo: "Dame un ejercicio",
    });
  });
});

describe("conEjercicios", () => {
  it("los ejercicios nuevos van arriba, sin repetir y sin pasar el máximo", () => {
    const muchos = Array.from({ length: MAX_EJERCICIOS_EN_SIDEBAR }, (_, i) => ({
      id: `n${i}`,
      titulo: `Nuevo ${i}`,
      conversacionId: "a",
    }));

    const estado = conEjercicios(ESTADO, [...muchos, { id: "e1", titulo: "Garage", conversacionId: "b" }]);

    expect(estado.ejercicios).toHaveLength(MAX_EJERCICIOS_EN_SIDEBAR);
    expect(estado.ejercicios[0].id).toBe("n0");
  });

  it("sin ejercicios nuevos, el estado no cambia", () => {
    expect(conEjercicios(ESTADO, [])).toBe(ESTADO);
  });
});

describe("sinConversacion", () => {
  it("la saca de la lista y sus ejercicios quedan sin enlace (como en la base)", () => {
    expect(sinConversacion(ESTADO, "b")).toEqual({
      conversaciones: [{ id: "a", titulo: "Colas" }],
      ejercicios: [{ id: "e1", titulo: "Garage", conversacionId: null }],
    });
  });
});

describe("ejerciciosGuardadosEn", () => {
  const mensaje = (parts: ParteDelTutor[]): TutorUIMessage => ({ id: "m", role: "assistant", parts });
  const datos = (titulo: string) => ({
    tema: "colas",
    dificultad: "media" as const,
    titulo,
    enunciado: "Un taller de bicicletas atiende a los clientes que llegan con un intervalo entre arribos.",
    sePide: ["El tiempo medio de espera en cola"],
    datosAleatorios: [{ sigla: "IA", fdp: "uniforme entre 5 y 15 minutos" }],
    seDecide: "la cantidad de mecánicos",
  });

  it("toma los ejercicios que la tool guardó bien (id del resultado, título de lo que le pasó el modelo)", () => {
    const guardado: ParteDelTutor = {
      type: "tool-generar_ejercicio",
      toolCallId: "t1",
      state: "output-available",
      input: datos("Taller de bicicletas"),
      output: {
        ok: true,
        id: "e9",
        ejercicio: { titulo: "Taller de bicicletas", enunciado: "…", sePide: [] },
        avisos: [],
      },
    };

    expect(ejerciciosGuardadosEn(mensaje([{ type: "text", text: "Acá va" }, guardado]), "c")).toEqual([
      { id: "e9", titulo: "Taller de bicicletas", conversacionId: "c" },
    ]);
  });

  it("ignora los que no se guardaron, los que están en curso y otras tools", () => {
    const partes: ParteDelTutor[] = [
      {
        type: "tool-generar_ejercicio",
        toolCallId: "t1",
        state: "output-available",
        input: datos("X"),
        output: { ok: false, error: "sin base" },
      },
      { type: "tool-generar_ejercicio", toolCallId: "t2", state: "input-available", input: datos("Y") },
      {
        type: "tool-consultar_modelos",
        toolCallId: "t3",
        state: "output-available",
        input: { tema: "colas" },
        output: "texto",
      },
    ];

    expect(ejerciciosGuardadosEn(mensaje(partes), "c")).toEqual([]);
  });
});
