import { describe, expect, it } from "vitest";
import { MINIMO_KCAL, computeTargets, type TargetsInput } from "./targets";

const hombre: TargetsInput = { sex: "hombre", age: 30, height_cm: 180, weight_kg: 80, activity: "moderado", goal: "mantener" };
const mujer: TargetsInput = { sex: "mujer", age: 25, height_cm: 165, weight_kg: 60, activity: "sedentario", goal: "perder" };

describe("computeTargets (ejemplos calculados a mano en docs/formulas.md)", () => {
  it("ejemplo 1: hombre, moderado, mantener", () => {
    expect(computeTargets(hombre)).toEqual({ kcal: 3290, protein_g: 112, carbs_g: 464, fat_g: 110, floorApplied: false });
  });

  it("ejemplo 2: mujer, sedentaria, perder", () => {
    expect(computeTargets(mujer)).toEqual({ kcal: 1600, protein_g: 60, carbs_g: 220, fat_g: 53, floorApplied: false });
  });

  it("ejemplo 3: nunca baja del mínimo de seguridad y lo avisa", () => {
    const r = computeTargets({ sex: "mujer", age: 70, height_cm: 150, weight_kg: 45, activity: "sedentario", goal: "perder" });
    expect(r.kcal).toBe(MINIMO_KCAL.mujer);
    expect(r.floorApplied).toBe(true);
    expect(MINIMO_KCAL).toEqual({ mujer: 1200, hombre: 1500 });
  });

  it("ganar da más calorías que mantener, y mantener más que perder", () => {
    const k = (goal: TargetsInput["goal"]) => computeTargets({ ...hombre, goal }).kcal;
    expect(k("ganar")).toBeGreaterThan(k("mantener"));
    expect(k("mantener")).toBeGreaterThan(k("perder"));
  });

  it("los macros cuadran con las calorías (±10 kcal por el redondeo)", () => {
    for (const p of [hombre, mujer, { ...hombre, goal: "ganar" as const, activity: "alto" as const }]) {
      const r = computeTargets(p);
      expect(Math.abs(r.protein_g * 4 + r.carbs_g * 4 + r.fat_g * 9 - r.kcal)).toBeLessThanOrEqual(10);
    }
  });

  it("rechaza edad fuera de 18–100, peso o altura imposibles", () => {
    for (const malo of [
      { age: 17 },
      { age: 13 },
      { age: 101 },
      { weight_kg: 20 },
      { weight_kg: 400 },
      { height_cm: 90 },
      { height_cm: 260 },
      { age: Number.NaN },
    ]) {
      expect(() => computeTargets({ ...hombre, ...malo })).toThrow(RangeError);
    }
  });
});
