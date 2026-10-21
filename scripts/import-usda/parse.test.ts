import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseUsdaFood, type UsdaFood } from "./parse";

function fixture(nombre: string): UsdaFood {
  return JSON.parse(readFileSync(new URL(`./fixtures/${nombre}.json`, import.meta.url), "utf-8"));
}

describe("parseUsdaFood", () => {
  it("convierte un alimento completo (plátano) con sus nutrientes por 100 g", () => {
    const f = parseUsdaFood(fixture("completo"));
    expect(f).toMatchObject({
      name_en: "Bananas, raw",
      source: "usda",
      source_id: "173944",
      category: "Fruits and Fruit Juices",
      kcal: 89,
      protein_g: 1.09,
      carbs_g: 22.8,
      fat_g: 0.33,
      fiber_g: 2.6,
      sugar_g: 12.2,
      sodium_mg: 1,
    });
    expect(f?.slug).toBe("bananas-raw-173944");
  });

  it("un nutriente ausente queda null, nunca 0", () => {
    const f = parseUsdaFood(fixture("sin-fibra-ni-azucar"));
    expect(f?.fiber_g).toBeNull();
    expect(f?.sugar_g).toBeNull();
    expect(f?.kcal).toBe(202);
  });

  it("convierte las unidades a gramos y miligramos", () => {
    // Variante del plátano con unidades distintas (mismas cantidades reales).
    const raw = fixture("completo");
    for (const n of raw.foodNutrients) {
      if (n.nutrient.number === "307") Object.assign(n, { amount: 0.001, nutrient: { ...n.nutrient, unitName: "g" } });
      if (n.nutrient.number === "203") Object.assign(n, { amount: 1090, nutrient: { ...n.nutrient, unitName: "mg" } });
    }
    const f = parseUsdaFood(raw);
    expect(f?.sodium_mg).toBe(1);
    expect(f?.protein_g).toBe(1.09);
  });

  it("si solo hay energía en kJ, la pasa a kcal", () => {
    const raw = fixture("completo");
    raw.foodNutrients = raw.foodNutrients.filter((n) => n.nutrient.number !== "208");
    expect(parseUsdaFood(raw)?.kcal).toBe(88.7); // 371 kJ / 4,184
  });

  it("descarta los productos de marca", () => {
    expect(parseUsdaFood(fixture("marca"))).toBeNull();
  });

  it("descarta categorías que no son alimentos genéricos (bebé, comida rápida, restaurantes…)", () => {
    const raw = fixture("completo");
    raw.foodCategory = { description: "Baby Foods" };
    expect(parseUsdaFood(raw)).toBeNull();
  });

  it("un valor imposible (negativo o por encima del máximo por 100 g) queda null", () => {
    const raw = fixture("completo");
    for (const n of raw.foodNutrients) {
      if (n.nutrient.number === "204") n.amount = -1;
      if (n.nutrient.number === "205") n.amount = 130;
    }
    const f = parseUsdaFood(raw);
    expect(f?.fat_g).toBeNull();
    expect(f?.carbs_g).toBeNull();
  });
});
