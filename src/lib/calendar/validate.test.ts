import { describe, expect, it } from "vitest";
import { esClaveDeDia, esClaveDeMes, validarSesion } from "./validate";

describe("esClaveDeDia / esClaveDeMes", () => {
  it("acepta fechas reales en formato AAAA-MM-DD", () => {
    expect(esClaveDeDia("2026-11-02")).toBe(true);
    expect(esClaveDeDia("2028-02-29")).toBe(true);
  });

  it("rechaza fechas imposibles o con otro formato", () => {
    for (const f of ["2026-02-29", "2026-13-01", "2026-1-5", "05/01/2026", "", "2026-11-02x"]) {
      expect(esClaveDeDia(f)).toBe(false);
    }
  });

  it("acepta meses AAAA-MM", () => {
    expect(esClaveDeMes("2026-11")).toBe(true);
    expect(esClaveDeMes("2026-13")).toBe(false);
    expect(esClaveDeMes("2026-1")).toBe(false);
  });
});

describe("validarSesion", () => {
  const ok = { fecha: "2026-11-02", rutina: "", dia: "", nota: "" };

  it("una sesión solo con fecha es válida (por ejemplo, salir a correr)", () => {
    expect(validarSesion({ ...ok, nota: "  Salir a correr " })).toEqual({
      datos: { date: "2026-11-02", routine_id: null, routine_day_index: null, note: "Salir a correr" },
    });
  });

  it("convierte la rutina y el día a números", () => {
    expect(validarSesion({ ...ok, rutina: "7", dia: "2" })).toEqual({
      datos: { date: "2026-11-02", routine_id: 7, routine_day_index: 2, note: null },
    });
  });

  it("rechaza fecha inválida, rutina o día raros, y nota larga", () => {
    expect(validarSesion({ ...ok, fecha: "2026-02-30" })).toHaveProperty("error");
    expect(validarSesion({ ...ok, rutina: "abc" })).toHaveProperty("error");
    expect(validarSesion({ ...ok, rutina: "7", dia: "8" })).toHaveProperty("error");
    expect(validarSesion({ ...ok, nota: "x".repeat(301) })).toHaveProperty("error");
  });

  it("un día de rutina sin rutina no tiene sentido", () => {
    expect(validarSesion({ ...ok, dia: "1" })).toHaveProperty("error");
  });
});
