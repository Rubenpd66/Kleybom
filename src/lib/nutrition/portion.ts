import type { Nutrientes } from "@/lib/foods/queries";

export type Nutrients = Nutrientes;

export const CLAVES = ["kcal", "protein_g", "carbs_g", "fat_g", "fiber_g", "sugar_g", "sodium_mg"] as const;
export const MAX_GRAMOS = 5000;

const redondear = (v: number) => Math.round(v * 100) / 100;

// Nutrientes de una ración a partir de los valores por 100 g. Un dato desconocido sigue siendo null.
export function scaleNutrients(per100g: Nutrients, grams: number): Nutrients {
  if (!Number.isFinite(grams) || grams <= 0 || grams > MAX_GRAMOS) {
    throw new RangeError(`Cantidad no válida: ${grams} g (debe estar entre 1 y ${MAX_GRAMOS})`);
  }
  const r = {} as Nutrients;
  for (const k of CLAVES) {
    const v = per100g[k];
    r[k] = v === null ? null : redondear((v * grams) / 100);
  }
  return r;
}

// Suma de varias raciones. Los nulos no suman; "incomplete" avisa de que faltaba algún dato.
// Si ninguna ración tiene un nutriente, su total es null (desconocido, no 0).
export function sumNutrients(list: Nutrients[]): { totals: Nutrients; incomplete: boolean } {
  const totals = {} as Nutrients;
  let incomplete = false;
  for (const k of CLAVES) {
    const conocidos = list.map((n) => n[k]).filter((v): v is number => v !== null);
    if (conocidos.length < list.length) incomplete = true;
    totals[k] = list.length > 0 && conocidos.length === 0 ? null : redondear(conocidos.reduce((a, b) => a + b, 0));
  }
  return { totals, incomplete };
}
