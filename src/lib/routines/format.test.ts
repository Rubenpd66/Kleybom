import { describe, expect, it } from "vitest";
import { formatearSeries } from "./format";

describe("formatearSeries", () => {
  it("muestra series × rango de repeticiones", () => {
    expect(formatearSeries(3, 10, 12)).toBe("3 × 10-12");
  });

  it("si mínimo y máximo coinciden, muestra un solo número", () => {
    expect(formatearSeries(5, 5, 5)).toBe("5 × 5");
  });

  it("un ejercicio por tiempo (1 repetición) muestra solo las series", () => {
    expect(formatearSeries(3, 1, 1)).toBe("3 series");
    expect(formatearSeries(1, 1, 1)).toBe("1 serie");
  });
});
