import { describe, expect, it } from "vitest";
import { LIMITES_DE_USO, motivoDeLimite } from "@/backend/models/dominio/limiteDeUso";

describe("motivoDeLimite", () => {
  const limites = { porMinuto: 3, porDia: 10 };

  it("por debajo de los dos límites, puede seguir", () => {
    expect(motivoDeLimite({ ultimoMinuto: 2, ultimoDia: 9 }, limites)).toBeNull();
  });

  it("al llegar al límite por minuto, le pide esperar un minuto", () => {
    expect(motivoDeLimite({ ultimoMinuto: 3, ultimoDia: 3 }, limites)).toContain("Esperá un minuto");
  });

  it("al llegar al límite del día, se lo dice con el número (aunque el del minuto también esté lleno)", () => {
    expect(motivoDeLimite({ ultimoMinuto: 3, ultimoDia: 10 }, limites)).toContain("máximo de 10 mensajes por día");
  });

  it("los límites de la app dejan estudiar tranquilo", () => {
    expect(motivoDeLimite({ ultimoMinuto: 5, ultimoDia: 60 })).toBeNull();
    expect(LIMITES_DE_USO.porMinuto).toBeLessThan(LIMITES_DE_USO.porDia);
  });
});
