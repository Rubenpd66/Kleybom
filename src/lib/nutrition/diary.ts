import { MAX_GRAMOS, scaleNutrients, sumNutrients, type Nutrients } from "./portion";

export const MEALS = ["desayuno", "comida", "cena", "snack"] as const;
export type Meal = (typeof MEALS)[number];

export type MealEntryWithFood = {
  id: number;
  meal: Meal;
  grams: number;
  food: Nutrients & { slug: string; name_es: string };
};

export type DaySummary = { byMeal: Record<Meal, Nutrients>; total: Nutrients; incomplete: boolean };

// Resumen de un día: nutrientes por comida y total, y si faltaba algún dato.
export function summarizeDay(entries: MealEntryWithFood[]): DaySummary {
  // Una cantidad imposible (no debería llegar: la base la impide) no rompe el resumen.
  const validas = entries.filter((e) => Number.isFinite(e.grams) && e.grams > 0 && e.grams <= MAX_GRAMOS);
  const raciones = validas.map((e) => ({ meal: e.meal, n: scaleNutrients(e.food, e.grams) }));

  let incomplete = false;
  const byMeal = {} as Record<Meal, Nutrients>;
  for (const m of MEALS) {
    const r = sumNutrients(raciones.filter((x) => x.meal === m).map((x) => x.n));
    byMeal[m] = r.totals;
    incomplete ||= r.incomplete;
  }
  const total = sumNutrients(raciones.map((x) => x.n));
  return { byMeal, total: total.totals, incomplete: incomplete || total.incomplete };
}
