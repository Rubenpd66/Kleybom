import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import { normalizeText } from "@/lib/text/normalize";

export const FOODS_PAGE_SIZE = 24;

export type Nutrientes = {
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
};

export type FoodSummary = Nutrientes & { id: number; slug: string; name_es: string };

export type FoodDetail = FoodSummary & {
  name_en: string | null;
  category: string | null;
  source: "usda" | "openfoodfacts" | "manual";
  source_id: string | null;
};

const NUTRIENTES = ["kcal", "protein_g", "carbs_g", "fat_g", "fiber_g", "sugar_g", "sodium_mg"] as const;
const COLUMNAS: string = `id, slug, name_es, ${NUTRIENTES.join(", ")}`;

// La base devuelve las columnas numeric como texto: se pasan a número y el vacío sigue siendo null.
function conNumeros<T extends Record<string, unknown>>(fila: T): T & Nutrientes {
  const copia: Record<string, unknown> = { ...fila };
  for (const n of NUTRIENTES) copia[n] = fila[n] === null || fila[n] === undefined ? null : Number(fila[n]);
  return copia as T & Nutrientes;
}

export async function searchFoods(
  q: string,
  page = 1,
  client?: SupabaseClient,
): Promise<{ items: FoodSummary[]; total: number }> {
  const db = client ?? (await createServerClient());
  const pagina = Math.max(1, Math.floor(page) || 1);
  const desde = (pagina - 1) * FOODS_PAGE_SIZE;

  let consulta = db.from("foods").select(COLUMNAS, { count: "exact" });
  // Cada palabra debe aparecer (en cualquier orden): "pollo pechuga" encuentra "Pollo, …, pechuga".
  for (const palabra of normalizeText(q).split(" ").filter(Boolean).slice(0, 6)) {
    consulta = consulta.like("search_text", `%${palabra}%`);
  }
  const { data, error, count } = await consulta
    .order("name_len")
    .order("name_es")
    .range(desde, desde + FOODS_PAGE_SIZE - 1);
  if (error) throw error;
  return {
    items: (data ?? []).map((f) => conNumeros(f as unknown as Record<string, unknown>) as unknown as FoodSummary),
    total: count ?? 0,
  };
}

export async function getFoodBySlug(slug: string, client?: SupabaseClient): Promise<FoodDetail | null> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db
    .from("foods")
    .select(`${COLUMNAS}, name_en, category, source, source_id`)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? (conNumeros(data as unknown as Record<string, unknown>) as unknown as FoodDetail) : null;
}
