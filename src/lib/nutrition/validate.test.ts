import { describe, expect, it } from "vitest";
import { validarGramos } from "./validate";

describe("validarGramos", () => {
  it("acepta números de 0,1 a 5000 g, con coma o punto", () => {
    expect(validarGramos("150")).toEqual({ gramos: 150 });
    expect(validarGramos(" 150,5 ")).toEqual({ gramos: 150.5 });
    expect(validarGramos("5000")).toEqual({ gramos: 5000 });
  });

  it("redondea a un decimal", () => {
    expect(validarGramos("12.345")).toEqual({ gramos: 12.3 });
  });

  it("rechaza vacío, 0, negativos, más de 5000 y texto", () => {
    for (const malo of ["", "0", "-5", "5001", "abc", "1e9", "12,5,5"]) {
      expect(validarGramos(malo), malo).toHaveProperty("error");
    }
  });
});
