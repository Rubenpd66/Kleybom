import type { SupabaseClient } from "@supabase/supabase-js";
import type { Idioma } from "@/lib/i18n";
import { createServerClient } from "@/lib/supabase/server";
import type { MealEntryWithFood, Meal } from "./diary";
import { CLAVES } from "./portion";

export type Goals = { kcal: number; protein_g: number; carbs_g: number; fat_g: number };

const SELECCION: string = `id, meal, grams, foods(slug, name_es, name_en, ${CLAVES.join(", ")})`;

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

// Entradas del diario de un día, con los nutrientes por 100 g de cada alimento.
export async function listEntries(userId: string, date: string, client?: SupabaseClient, idioma: Idioma = "es"): Promise<MealEntryWithFood[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db
    .from("meal_entries")
    .select(SELECCION)
    .eq("user_id", userId)
    .eq("date", date)
    .order("id");
  if (error) throw error;
  return ((data ?? []) as unknown as Record<string, unknown>[]).flatMap((e) => {
    const f = (Array.isArray(e.foods) ? e.foods[0] : e.foods) as Record<string, unknown> | null;
    if (!f) return [];
    // En inglés se muestra el nombre original de USDA.
    const nombre = idioma === "en" && f.name_en ? String(f.name_en) : String(f.name_es);
    const food = { slug: String(f.slug), name_es: nombre } as MealEntryWithFood["food"];
    for (const k of CLAVES) food[k] = num(f[k]);
    return [{ id: e.id as number, meal: e.meal as Meal, grams: Number(e.grams), food }];
  });
}

export async function getGoals(userId: string, client?: SupabaseClient): Promise<Goals | null> {
  const db = client ?? (await createServerClient());
  const { data } = await db
    .from("nutrition_goals")
    .select("kcal, protein_g, carbs_g, fat_g")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as Goals | null) ?? null;
}
