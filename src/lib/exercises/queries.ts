import type { SupabaseClient } from "@supabase/supabase-js";
import type { Idioma } from "@/lib/i18n";
import { createServerClient } from "@/lib/supabase/server";
import { normalizeText } from "@/lib/text/normalize";

export type Level = "principiante" | "intermedio" | "avanzado";

export type ExerciseFilters = {
  q?: string;
  muscle?: string;
  equipment?: string;
  level?: Level;
  page?: number;
};

export type ExerciseSummary = {
  id: number;
  slug: string;
  name_es: string;
  level: Level;
  image_url: string | null;
  muscles: { slug: string; role: "principal" | "secundario" }[];
};

export type ExerciseDetail = Omit<ExerciseSummary, "muscles"> & {
  description_es: string | null;
  instructions_es: string[];
  tips_es: string[];
  common_mistakes_es: string[];
  license: string | null;
  author: string | null;
  image_author: string | null;
  image_license: string | null;
  image_source: string | null;
  source: string | null;
  source_id: string | null;
  needs_translation: boolean;
  muscles: { slug: string; name_es: string; role: "principal" | "secundario" }[];
  equipment: { slug: string; name_es: string }[];
};

export const PAGE_SIZE = 24;

// Los campos *_es llevan el texto que se muestra: en inglés, el original de wger si existe.
// Así el resto de la web no cambia según el idioma.
const enIdioma = (idioma: Idioma, es: string, en: string | null | undefined) => (idioma === "en" && en ? en : es);

// Ids de ejercicios que tienen el músculo/equipamiento con ese slug.
async function idsDeEjercicios(
  db: SupabaseClient,
  catalogo: "muscles" | "equipment",
  slug: string,
): Promise<number[]> {
  const union = catalogo === "muscles" ? "exercise_muscles" : "exercise_equipment";
  const columna = catalogo === "muscles" ? "muscle_id" : "equipment_id";
  const { data: items, error } = await db.from(catalogo).select("id").eq("slug", slug);
  if (error) throw error;
  const ids = (items ?? []).map((i) => i.id as number);
  if (ids.length === 0) return [];
  const { data, error: e2 } = await db.from(union).select("exercise_id").in(columna, ids);
  if (e2) throw e2;
  return (data ?? []).map((r) => r.exercise_id as number);
}

export async function listExercises(
  f: ExerciseFilters,
  client?: SupabaseClient,
  idioma: Idioma = "es",
): Promise<{ items: ExerciseSummary[]; total: number }> {
  const db = client ?? (await createServerClient());
  const vacio = { items: [], total: 0 };

  let ids: number[] | null = null;
  for (const [catalogo, slug] of [
    ["muscles", f.muscle],
    ["equipment", f.equipment],
  ] as const) {
    if (!slug) continue;
    const encontrados = await idsDeEjercicios(db, catalogo, slug);
    const previos = ids as number[] | null;
    const comunes: number[] = previos
      ? encontrados.filter((id) => previos.includes(id))
      : encontrados;
    if (comunes.length === 0) return vacio;
    ids = comunes;
  }

  const pagina = Math.max(1, Math.floor(f.page ?? 1));
  const desde = (pagina - 1) * PAGE_SIZE;

  let consulta = db
    .from("exercises")
    .select("id, slug, name_es, name_en, level, image_url, exercise_muscles(role, muscles(slug))", { count: "exact" });
  if (ids) consulta = consulta.in("id", ids);
  if (f.level) consulta = consulta.eq("level", f.level);
  const q = normalizeText(f.q ?? "");
  // En español se busca en el nombre sin tildes; en inglés, también en el nombre original.
  if (q) consulta = idioma === "en" ? consulta.or(`search_text.like.%${q}%,name_en.ilike.%${q}%`) : consulta.like("search_text", `%${q}%`);

  const { data, error, count } = await consulta
    .order("name_es")
    .range(desde, desde + PAGE_SIZE - 1);
  if (error) throw error;
  type Fila = Omit<ExerciseSummary, "muscles"> & {
    name_en: string | null;
    exercise_muscles: { role: "principal" | "secundario"; muscles: { slug: string } | null }[];
  };
  const items = ((data ?? []) as unknown as Fila[]).map(({ exercise_muscles, name_en, ...resto }) => ({
    ...resto,
    name_es: enIdioma(idioma, resto.name_es, name_en),
    muscles: (exercise_muscles ?? []).flatMap((m) => (m.muscles ? [{ slug: m.muscles.slug, role: m.role }] : [])),
  }));
  return { items, total: count ?? 0 };
}

export async function getExerciseBySlug(
  slug: string,
  client?: SupabaseClient,
  idioma: Idioma = "es",
): Promise<ExerciseDetail | null> {
  const db = client ?? (await createServerClient());
  const { data: ej, error } = await db
    .from("exercises")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!ej) return null;

  const [{ data: um, error: e1 }, { data: ue, error: e2 }] = await Promise.all([
    db.from("exercise_muscles").select("muscle_id, role").eq("exercise_id", ej.id),
    db.from("exercise_equipment").select("equipment_id").eq("exercise_id", ej.id),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;

  const muscleIds = (um ?? []).map((r) => r.muscle_id as number);
  const equipIds = (ue ?? []).map((r) => r.equipment_id as number);
  const [{ data: ms, error: e3 }, { data: es, error: e4 }] = await Promise.all([
    muscleIds.length
      ? db.from("muscles").select("id, slug, name_es, name_en").in("id", muscleIds)
      : Promise.resolve({ data: [], error: null }),
    equipIds.length
      ? db.from("equipment").select("id, slug, name_es, name_en").in("id", equipIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (e3) throw e3;
  if (e4) throw e4;

  const muscles = (um ?? []).flatMap((r) => {
    const m = (ms ?? []).find((x) => x.id === r.muscle_id);
    return m ? [{ slug: m.slug, name_es: enIdioma(idioma, m.name_es, m.name_en), role: r.role }] : [];
  });
  const equipment = (es ?? []).map((x) => ({ slug: x.slug, name_es: enIdioma(idioma, x.name_es, x.name_en) }));

  // En inglés: el nombre, la descripción y los pasos originales de wger (si los hay).
  const textos =
    idioma === "en" && ej.name_en
      ? {
          name_es: ej.name_en,
          description_es: ej.description_en ?? ej.description_es,
          instructions_es: ej.instructions_en?.length ? ej.instructions_en : ej.instructions_es,
          tips_es: ej.tips_en?.length ? ej.tips_en : [],
          common_mistakes_es: ej.common_mistakes_en?.length ? ej.common_mistakes_en : [],
          needs_translation: false,
        }
      : {};
  return { ...ej, ...textos, muscles, equipment } as ExerciseDetail;
}

export type CatalogItem = { slug: string; name_es: string };

export async function listCatalog(
  tabla: "muscles" | "equipment",
  client?: SupabaseClient,
  idioma: Idioma = "es",
): Promise<CatalogItem[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db.from(tabla).select("slug, name_es, name_en");
  if (error) throw error;
  return (data ?? [])
    .map((f) => ({ slug: f.slug as string, name_es: enIdioma(idioma, f.name_es, f.name_en) }))
    .sort((a, b) => a.name_es.localeCompare(b.name_es, idioma));
}
