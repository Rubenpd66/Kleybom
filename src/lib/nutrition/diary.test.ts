import { describe, expect, it } from "vitest";
import { MEALS, summarizeDay, type MealEntryWithFood } from "./diary";

const alimento = (o: Partial<MealEntryWithFood["food"]> = {}): MealEntryWithFood["food"] => ({
  slug: "x",
  name_es: "X",
  kcal: 100,
  protein_g: 10,
  carbs_g: 20,
  fat_g: 1,
  fiber_g: 2,
  sugar_g: 5,
  sodium_mg: 50,
  ...o,
});
const entrada = (meal: MealEntryWithFood["meal"], grams: number, food = alimento()): MealEntryWithFood => ({
  id: Math.random(),
  meal,
  grams,
  food,
});

describe("summarizeDay", () => {
  it("un día vacío son ceros y no está incompleto", () => {
    const r = summarizeDay([]);
    expect(r.incomplete).toBe(false);
    expect(r.total.kcal).toBe(0);
    for (const m of MEALS) expect(r.byMeal[m].kcal).toBe(0);
  });

  it("los totales coinciden con la suma hecha a mano", () => {
    // desayuno: 50 g (50 kcal, 5 g prot) + comida: 200 g (200 kcal, 20 g prot) + 100 g de otro (300 kcal)
    const r = summarizeDay([
      entrada("desayuno", 50),
      entrada("comida", 200),
      entrada("comida", 100, alimento({ kcal: 300, protein_g: 0 })),
    ]);
    expect(r.byMeal.desayuno.kcal).toBe(50);
    expect(r.byMeal.comida.kcal).toBe(500);
    expect(r.byMeal.cena.kcal).toBe(0);
    expect(r.total.kcal).toBe(550);
    expect(r.total.protein_g).toBe(25);
    expect(r.incomplete).toBe(false);
  });

  it("una comida con un alimento de fibra nula marca el día como incompleto", () => {
    const r = summarizeDay([entrada("cena", 100), entrada("cena", 100, alimento({ fiber_g: null }))]);
    expect(r.incomplete).toBe(true);
    expect(r.total.fiber_g).toBe(2);
    expect(r.byMeal.cena.fiber_g).toBe(2);
  });

  it("ignora entradas con gramos imposibles en lugar de romper", () => {
    const r = summarizeDay([entrada("snack", 100), { ...entrada("snack", 0) }]);
    expect(r.total.kcal).toBe(100);
  });
});
