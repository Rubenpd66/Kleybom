import { CLAVES, scaleNutrients, sumNutrients, type Nutrients } from "./portion";

export type IngredienteConNutrientes = { food: Nutrients; grams: number };

// Nutrientes de la receta completa y de una ración (= total / raciones).
export function recipeNutrientsPerServing(
  ingredientes: IngredienteConNutrientes[],
  servings: number,
): { total: Nutrients; perServing: Nutrients; incomplete: boolean } {
  if (ingredientes.length === 0) throw new Error("La receta no tiene ingredientes.");
  if (!Number.isInteger(servings) || servings < 1 || servings > 20) {
    throw new RangeError(`Raciones no válidas: ${servings}`);
  }
  const { totals, incomplete } = sumNutrients(ingredientes.map((i) => scaleNutrients(i.food, i.grams)));
  const perServing = {} as Nutrients;
  for (const k of CLAVES) {
    const v = totals[k];
    perServing[k] = v === null ? null : Math.round((v / servings) * 10) / 10;
  }
  return { total: totals, perServing, incomplete };
}
