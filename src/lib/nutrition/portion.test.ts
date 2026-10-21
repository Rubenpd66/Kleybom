import { describe, expect, it } from "vitest";
import { scaleNutrients, sumNutrients, type Nutrients } from "./portion";

const vacio: Nutrients = {
  kcal: null,
  protein_g: null,
  carbs_g: null,
  fat_g: null,
  fiber_g: null,
  sugar_g: null,
  sodium_mg: null,
};
const n = (o: Partial<Nutrients>): Nutrients => ({ ...vacio, ...o });

describe("scaleNutrients", () => {
  it("150 g de un alimento con 200 kcal/100 g son 300 kcal", () => {
    expect(scaleNutrients(n({ kcal: 200, protein_g: 10 }), 150)).toMatchObject({ kcal: 300, protein_g: 15 });
  });

  it("los null siguen siendo null (la fibra desconocida no pasa a 0)", () => {
    expect(scaleNutrients(n({ kcal: 100, fiber_g: null }), 50).fiber_g).toBeNull();
  });

  it("no arrastra errores de coma flotante", () => {
    expect(scaleNutrients(n({ protein_g: 1.09 }), 30).protein_g).toBe(0.33);
  });

  it("0 g, cantidades negativas, de más de 5000 g o que no son número dan error", () => {
    for (const g of [0, -10, 5001, 100000, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => scaleNutrients(n({ kcal: 100 }), g)).toThrow(RangeError);
    }
    expect(scaleNutrients(n({ kcal: 100 }), 5000).kcal).toBe(5000);
  });
});

describe("sumNutrients", () => {
  it("suma los valores conocidos", () => {
    const r = sumNutrients([n({ kcal: 100, protein_g: 5 }), n({ kcal: 250.5, protein_g: 2.25 })]);
    expect(r.totals.kcal).toBe(350.5);
    expect(r.totals.protein_g).toBe(7.25);
  });

  it("con algún nulo marca incomplete y suma solo los conocidos", () => {
    const r = sumNutrients([n({ kcal: 100, fiber_g: 2 }), n({ kcal: 50, fiber_g: null })]);
    expect(r.incomplete).toBe(true);
    expect(r.totals.fiber_g).toBe(2);
    expect(r.totals.kcal).toBe(150);
  });

  it("si nadie tiene el dato, el total es null", () => {
    const r = sumNutrients([n({ kcal: 100 }), n({ kcal: 50 })]);
    expect(r.totals.sugar_g).toBeNull();
    expect(r.incomplete).toBe(true);
  });

  it("una lista vacía son ceros y no está incompleta", () => {
    const r = sumNutrients([]);
    expect(r.incomplete).toBe(false);
    expect(Object.values(r.totals)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});
