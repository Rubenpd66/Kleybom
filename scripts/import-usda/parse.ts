import { normalizeText } from "../../src/lib/text/normalize.ts";

// Formato de "SR Legacy" de USDA FoodData Central (descarga JSON). Solo lo que usamos.
export type UsdaFood = {
  fdcId: number;
  description: string;
  dataType?: string;
  foodCategory?: { description?: string } | null;
  foodNutrients: { amount?: number | null; nutrient: { number?: string; name?: string; unitName?: string } }[];
};

export type FoodRow = {
  slug: string;
  name_es: string;
  name_en: string;
  category: string | null;
  source: "usda";
  source_id: string;
  search_text: string;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
};

// Solo alimentos genéricos: fuera comida de bebé, comida rápida, restaurantes, platos preparados
// y alimentos tradicionales de Alaska (poco útiles para el público de la web).
export const CATEGORIAS_EXCLUIDAS = new Set([
  "Baby Foods",
  "Fast Foods",
  "Restaurant Foods",
  "American Indian/Alaska Native Foods",
  "Meals, Entrees, and Side Dishes",
]);

// Marcas: palabras en mayúsculas (KRAFT, NESTLE…), símbolos de marca o nombres comerciales conocidos.
const MARCA =
  /\b[A-Z][A-Z'&.]{2,}\b|®|™|\b(Pillsbury|Kraft|Kellogg|General Mills|Nabisco|Oscar Mayer|Campbell|Hormel|Quaker|Nestle|Hershey|Mars|Keebler|Heinz|Betty Crocker|Mission|Tyson|Kashi|Post|Ralston|Malt-O-Meal|Arnold|Pepperidge|Gerber|Ocean Spray|Lipton|Martha White|Ener-G|Glutino|Schar|Udi|Rudi|Van's|Sara Lee|Mrs\.|Archway|Murray|Pepsi|Coca|Starbucks|Kentucky|Burger|Wendy|Subway|Taco Bell|Domino|Pizza Hut|Papa John|Little Caesars|Applebee|Denny|Olive Garden|Carrabba|Cracker Barrel|Chick-fil-A|Popeyes|Boston Market|McDonald)\b/;

const KJ_POR_KCAL = 4.184;

function slugify(s: string): string {
  return normalizeText(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

const redondear = (n: number, decimales: number) => Math.round(n * 10 ** decimales) / 10 ** decimales;

// Cantidad de un nutriente pasada a la unidad pedida; null si no está o no se puede convertir.
function cantidad(raw: UsdaFood, numeros: string[], unidad: "g" | "mg" | "kcal"): number | null {
  for (const numero of numeros) {
    const n = raw.foodNutrients.find((x) => x.nutrient.number === numero);
    if (!n || typeof n.amount !== "number" || !Number.isFinite(n.amount)) continue;
    const de = (n.nutrient.unitName ?? "").toLowerCase().replace("µ", "u");
    const factor: Record<string, Record<string, number>> = {
      g: { g: 1, mg: 0.001, ug: 0.000001 },
      mg: { g: 1000, mg: 1, ug: 0.001 },
      kcal: { kcal: 1, kj: 1 / KJ_POR_KCAL },
    };
    const f = factor[unidad][de];
    if (f !== undefined) return n.amount * f;
  }
  return null;
}

// Devuelve null si el valor no es posible por 100 g (así nunca se guarda un dato falso).
const enRango = (n: number | null, max: number, decimales: number) =>
  n === null || n < 0 || n > max ? null : redondear(n, decimales);

export function parseUsdaFood(raw: UsdaFood): FoodRow | null {
  const nombre = raw.description?.trim();
  if (!nombre || !raw.fdcId) return null;
  const categoria = raw.foodCategory?.description ?? null;
  if (categoria && CATEGORIAS_EXCLUIDAS.has(categoria)) return null;
  if (MARCA.test(nombre)) return null;

  return {
    slug: `${slugify(nombre)}-${raw.fdcId}`,
    // Hasta que se traduzca (Tarea 26), el nombre en español es el inglés.
    name_es: nombre,
    name_en: nombre,
    category: categoria,
    source: "usda",
    source_id: String(raw.fdcId),
    search_text: normalizeText(nombre),
    // 208 = energía en kcal; si falta, 268 = energía en kJ.
    kcal: enRango(cantidad(raw, ["208", "268"], "kcal"), 1000, 1),
    protein_g: enRango(cantidad(raw, ["203"], "g"), 100, 2),
    carbs_g: enRango(cantidad(raw, ["205"], "g"), 100, 2),
    fat_g: enRango(cantidad(raw, ["204"], "g"), 100, 2),
    fiber_g: enRango(cantidad(raw, ["291"], "g"), 100, 2),
    sugar_g: enRango(cantidad(raw, ["269", "269.3"], "g"), 100, 2),
    sodium_mg: enRango(cantidad(raw, ["307"], "mg"), 100000, 1),
  };
}
