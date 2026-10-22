import type { SupabaseClient } from "@supabase/supabase-js";
import type { Idioma } from "@/lib/i18n";
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

const RESUMEN = "id, slug, name_es, description_es, name_en, description_en, servings, prep_minutes";
const INGREDIENTES: string = `grams, note, note_en, position, foods(slug, name_es, name_en, ${CLAVES.join(", ")})`;

type FilaResumen = RecipeSummary & { name_en: string | null; description_en: string | null };

// Los campos *_es llevan el texto que se muestra: en inglés, la traducción si la hay.
function resumenEnIdioma({ name_en, description_en, ...r }: FilaResumen, idioma: Idioma): RecipeSummary {
  return idioma === "en" && name_en ? { ...r, name_es: name_en, description_es: description_en ?? r.description_es } : r;
}

export async function listRecipes(client?: SupabaseClient, idioma: Idioma = "es"): Promise<RecipeSummary[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db.from("recipes").select(RESUMEN).order("id");
  if (error) throw error;
  return ((data ?? []) as FilaResumen[]).map((r) => resumenEnIdioma(r, idioma));
}

export async function getRecipeBySlug(slug: string, client?: SupabaseClient, idioma: Idioma = "es"): Promise<RecipeDetail | null> {
  const db = client ?? (await createServerClient());
  const { data: r, error } = await db.from("recipes").select(`${RESUMEN}, steps_es, steps_en`).eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!r) return null;
  const en = idioma === "en";

  const { data: filas, error: e2 } = await db
    .from("recipe_ingredients")
    .select(INGREDIENTES)
    .eq("recipe_id", r.id)
    .order("position");
  if (e2) throw e2;

  const ingredientes = ((filas ?? []) as unknown as Record<string, unknown>[]).flatMap((i) => {
    const f = (Array.isArray(i.foods) ? i.foods[0] : i.foods) as Record<string, unknown> | null;
    if (!f) return [];
    const nombre = en && f.name_en ? String(f.name_en) : String(f.name_es);
    const food = { slug: String(f.slug), name_es: nombre } as RecipeIngredient["food"];
    for (const k of CLAVES) food[k] = f[k] === null || f[k] === undefined ? null : Number(f[k]);
    const nota = ((en && (i.note_en as string | null)) || (i.note as string | null)) ?? null;
    return [{ grams: Number(i.grams), note: nota, food }];
  });
  const { steps_es, steps_en, ...resumen } = r as FilaResumen & { steps_es: string[]; steps_en: string[] };
  const pasos = en && steps_en?.length ? steps_en : steps_es;
  return { ...resumenEnIdioma(resumen, idioma), steps_es: pasos, ingredientes };
}
