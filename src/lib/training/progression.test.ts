import { describe, expect, it } from "vitest";
import { compareSessions, estimate1RM, type SetLog } from "./progression";

describe("estimate1RM (Epley)", () => {
  it("con 1 repetición devuelve el propio peso", () => {
    expect(estimate1RM(100, 1)).toBe(100);
  });
  it("100 kg × 10 ≈ 133,3 kg", () => {
    expect(estimate1RM(100, 10)).toBeCloseTo(133.3, 1);
  });
  it("peso 0 está permitido (peso corporal)", () => {
    expect(estimate1RM(0, 12)).toBe(0);
  });
  it("reps 0, reps > 30 o peso negativo dan error", () => {
    expect(() => estimate1RM(100, 0)).toThrow(RangeError);
    expect(() => estimate1RM(100, 31)).toThrow(RangeError);
    expect(() => estimate1RM(-5, 5)).toThrow(RangeError);
    expect(() => estimate1RM(100, 2.5)).toThrow(RangeError);
  });
});

const s = (weight_kg: number, reps: number, exercise_id = 1): SetLog => ({ exercise_id, weight_kg, reps });

describe("compareSessions", () => {
  it("si la sesión anterior está vacía, los deltas son los de la actual", () => {
    const actual = [s(100, 5), s(100, 5)];
    expect(compareSessions([], actual)).toEqual({ volumeDelta: 1000, best1RMDelta: estimate1RM(100, 5) });
  });

  it("calcula la diferencia de volumen (peso × reps) y del mejor 1RM", () => {
    const antes = [s(100, 5), s(90, 8)]; // volumen 1220; mejor 1RM = 116,67 (100×5) vs 114 (90×8)
    const ahora = [s(105, 5), s(90, 8)]; // volumen 1245; mejor 1RM = 122,5
    const r = compareSessions(antes, ahora);
    expect(r.volumeDelta).toBe(25);
    expect(r.best1RMDelta).toBeCloseTo(122.5 - 116.67, 1);
  });

  it("dos sesiones vacías dan cero", () => {
    expect(compareSessions([], [])).toEqual({ volumeDelta: 0, best1RMDelta: 0 });
  });

  it("ignora series con reps fuera del rango de la fórmula para el 1RM, pero cuenta su volumen", () => {
    const r = compareSessions([], [s(20, 40)]);
    expect(r.volumeDelta).toBe(800);
    expect(r.best1RMDelta).toBe(0);
  });
});
