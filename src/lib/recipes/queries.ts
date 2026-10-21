import type { SupabaseClient } from "@supabase/supabase-js";
import { CLAVES, type Nutrients } from "@/lib/nutrition/portion";
import { createServerClient } from "@/lib/supabase/server";

export type RecipeSummary = {
  id: number;
  slug: string;
  name_es: string;
  description_es: string | null;
  servings: number;
  prep_minutes: number | null;
};

export type RecipeIngredient = {
  grams: number;
  note: string | null;
  food: Nutrients & { slug: string; name_es: string };
};

export type RecipeDetail = RecipeSummary & { steps_es: string[]; ingredientes: RecipeIngredient[] };

const RESUMEN = "id, slug, name_es, description_es, servings, prep_minutes";
const INGREDIENTES: string = `grams, note, position, foods(slug, name_es, ${CLAVES.join(", ")})`;

export async function listRecipes(client?: SupabaseClient): Promise<RecipeSummary[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db.from("recipes").select(RESUMEN).order("id");
  if (error) throw error;
  return (data ?? []) as RecipeSummary[];
}

export async function getRecipeBySlug(slug: string, client?: SupabaseClient): Promise<RecipeDetail | null> {
  const db = client ?? (await createServerClient());
  const { data: r, error } = await db.from("recipes").select(`${RESUMEN}, steps_es`).eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!r) return null;

  const { data: filas, error: e2 } = await db
    .from("recipe_ingredients")
    .select(INGREDIENTES)
    .eq("recipe_id", r.id)
    .order("position");
  if (e2) throw e2;

  const ingredientes = ((filas ?? []) as unknown as Record<string, unknown>[]).flatMap((i) => {
    const f = (Array.isArray(i.foods) ? i.foods[0] : i.foods) as Record<string, unknown> | null;
    if (!f) return [];
    const food = { slug: String(f.slug), name_es: String(f.name_es) } as RecipeIngredient["food"];
    for (const k of CLAVES) food[k] = f[k] === null || f[k] === undefined ? null : Number(f[k]);
    return [{ grams: Number(i.grams), note: (i.note as string | null) ?? null, food }];
  });
  return { ...(r as RecipeSummary & { steps_es: string[] }), ingredientes };
}
