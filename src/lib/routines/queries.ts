import type { SupabaseClient } from "@supabase/supabase-js";
import type { Idioma } from "@/lib/i18n";
import { createServerClient } from "@/lib/supabase/server";
import type { Goal, RoutineLevel } from "./validate";

export type RoutineFilters = { goal?: Goal; level?: RoutineLevel };

export type RoutineSummary = {
  id: number;
  slug: string;
  name: string;
  goal: Goal;
  level: RoutineLevel;
  days_per_week: number;
};

export type RoutineDayExercise = {
  exercise: { slug: string; name_es: string };
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  notes: string | null;
};

export type RoutineDetail = RoutineSummary & {
  description: string | null;
  dias: { dia: number; ejercicios: RoutineDayExercise[] }[];
};

const COLUMNAS = "id, slug, name, name_en, goal, level, days_per_week";

// Las plantillas tienen nombre y descripción en inglés; las rutinas propias se muestran como las escribió su dueño.
type ConIngles = { name: string; name_en?: string | null; description?: string | null; description_en?: string | null };
function enIdioma<T extends ConIngles>({ name_en, description_en, ...r }: T, idioma: Idioma): Omit<T, "name_en" | "description_en"> {
  if (idioma !== "en" || !name_en) return r;
  return { ...r, name: name_en, ...("description" in r ? { description: description_en ?? r.description } : {}) };
}

// Plantillas públicas (sin dueño). Las rutinas propias del usuario se listan en su panel.
export async function listRoutines(
  f: RoutineFilters,
  client?: SupabaseClient,
  idioma: Idioma = "es",
): Promise<RoutineSummary[]> {
  const db = client ?? (await createServerClient());
  let consulta = db.from("routines").select(COLUMNAS).is("owner_id", null);
  if (f.goal) consulta = consulta.eq("goal", f.goal);
  if (f.level) consulta = consulta.eq("level", f.level);
  const { data, error } = await consulta.order("id");
  if (error) throw error;
  return ((data ?? []) as (RoutineSummary & ConIngles)[]).map((r) => enIdioma(r, idioma));
}

type Dia = { dia: number; ejercicios: RoutineDayExercise[] };

// Días y ejercicios de varias rutinas a la vez (una sola consulta por tabla).
async function diasDeRutinas(db: SupabaseClient, ids: number[], idioma: Idioma = "es"): Promise<Map<number, Dia[]>> {
  const resultado = new Map<number, Dia[]>();
  if (ids.length === 0) return resultado;

  const { data: filas, error } = await db
    .from("routine_exercises")
    .select("routine_id, exercise_id, day_index, position, sets, reps_min, reps_max, rest_seconds, notes, notes_en")
    .in("routine_id", ids)
    .order("position");
  if (error) throw error;

  const idsEj = [...new Set((filas ?? []).map((r) => r.exercise_id as number))];
  const { data: ejercicios, error: e2 } = idsEj.length
    ? await db.from("exercises").select("id, slug, name_es, name_en").in("id", idsEj)
    : { data: [], error: null };
  if (e2) throw e2;
  const porId = new Map((ejercicios ?? []).map((x) => [x.id as number, x]));

  const ordenadas = [...(filas ?? [])].sort(
    (a, b) => a.day_index - b.day_index || a.position - b.position,
  );
  const porRutina = new Map<number, Map<number, RoutineDayExercise[]>>();
  for (const r of ordenadas) {
    const ej = porId.get(r.exercise_id as number);
    if (!ej) continue;
    const dias = porRutina.get(r.routine_id) ?? new Map<number, RoutineDayExercise[]>();
    const lista = dias.get(r.day_index) ?? [];
    lista.push({
      exercise: { slug: ej.slug, name_es: (idioma === "en" && ej.name_en) || ej.name_es },
      sets: r.sets,
      reps_min: r.reps_min,
      reps_max: r.reps_max,
      rest_seconds: r.rest_seconds,
      notes: (idioma === "en" && r.notes_en) || r.notes,
    });
    dias.set(r.day_index, lista);
    porRutina.set(r.routine_id, dias);
  }
  for (const [id, dias] of porRutina) {
    resultado.set(id, [...dias.entries()].map(([dia, ejercicios]) => ({ dia, ejercicios })));
  }
  return resultado;
}

export async function getRoutineBySlug(
  slug: string,
  client?: SupabaseClient,
  idioma: Idioma = "es",
): Promise<RoutineDetail | null> {
  const db = client ?? (await createServerClient());
  const { data: rutina, error } = await db
    .from("routines")
    .select(`${COLUMNAS}, description, description_en`)
    .eq("slug", slug)
    .is("owner_id", null)
    .maybeSingle();
  if (error) throw error;
  if (!rutina) return null;

  const dias = await diasDeRutinas(db, [rutina.id as number], idioma);
  return {
    ...enIdioma(rutina as RoutineSummary & ConIngles & { description: string | null }, idioma),
    dias: dias.get(rutina.id as number) ?? [],
  };
}

// Rutinas propias de un usuario (no tienen slug), las más recientes primero.
export type MyRoutine = Omit<RoutineDetail, "slug">;

export async function getMyRoutines(userId: string, client?: SupabaseClient, idioma: Idioma = "es"): Promise<MyRoutine[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db
    .from("routines")
    .select("id, name, goal, level, days_per_week, description")
    .eq("owner_id", userId)
    .order("id", { ascending: false });
  if (error) throw error;
  const rutinas = (data ?? []) as Omit<MyRoutine, "dias">[];
  const dias = await diasDeRutinas(db, rutinas.map((r) => r.id), idioma);
  return rutinas.map((r) => ({ ...r, dias: dias.get(r.id) ?? [] }));
}
