import { describe, expect, it } from "vitest";
import { escalaY, niceMax } from "./chart";

describe("niceMax", () => {
  it("redondea hacia arriba a 1, 2, 2,5 o 5 × 10^n", () => {
    expect(niceMax(0)).toBe(1);
    expect(niceMax(7)).toBe(10);
    expect(niceMax(1250)).toBe(2000);
    expect(niceMax(2100)).toBe(2500);
    expect(niceMax(1800)).toBe(2000);
    expect(niceMax(450)).toBe(500);
    expect(niceMax(0.3)).toBe(0.5);
  });
});

describe("escalaY", () => {
  it("con mínimo 0 da 5 marcas de 0 al máximo redondeado", () => {
    expect(escalaY([120, 870], { desdeCero: true })).toEqual({ min: 0, max: 1000, marcas: [0, 250, 500, 750, 1000] });
  });
  it("sin desdeCero ajusta el rango a los datos con un margen", () => {
    const e = escalaY([72.5, 74]);
    expect(e.min).toBeLessThanOrEqual(72.5);
    expect(e.max).toBeGreaterThanOrEqual(74);
    expect(e.marcas[0]).toBe(e.min);
    expect(e.marcas.at(-1)).toBe(e.max);
  });
  it("sin datos no falla", () => {
    expect(escalaY([], { desdeCero: true })).toEqual({ min: 0, max: 1, marcas: [0, 0.25, 0.5, 0.75, 1] });
  });
});
