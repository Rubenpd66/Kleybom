import { describe, expect, it } from "vitest";
import type { Nutrients } from "./portion";
import { recipeNutrientsPerServing } from "./recipe";

const n = (o: Partial<Nutrients>): Nutrients => ({
  kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0, ...o,
});

describe("recipeNutrientsPerServing", () => {
  it("nutrientes por ración = suma de ingredientes / raciones", () => {
    // 200 g de 100 kcal/100 g (200 kcal) + 50 g de 800 kcal/100 g (400 kcal) = 600 kcal en 4 raciones
    const r = recipeNutrientsPerServing(
      [
        { food: n({ kcal: 100, protein_g: 10 }), grams: 200 },
        { food: n({ kcal: 800, protein_g: 0 }), grams: 50 },
      ],
      4,
    );
    expect(r.perServing.kcal).toBe(150);
    expect(r.perServing.protein_g).toBe(5);
    expect(r.total.kcal).toBe(600);
    expect(r.incomplete).toBe(false);
  });

  it("un ingrediente sin un dato marca la receta como incompleta", () => {
    const r = recipeNutrientsPerServing([{ food: n({ kcal: 100, fiber_g: null }), grams: 100 }], 1);
    expect(r.incomplete).toBe(true);
  });

  it("una receta sin ingredientes o con raciones imposibles da error", () => {
    expect(() => recipeNutrientsPerServing([], 2)).toThrow();
    expect(() => recipeNutrientsPerServing([{ food: n({ kcal: 100 }), grams: 100 }], 0)).toThrow(RangeError);
    expect(() => recipeNutrientsPerServing([{ food: n({ kcal: 100 }), grams: 100 }], 2.5)).toThrow(RangeError);
  });
});
