import type { SupabaseClient } from "@supabase/supabase-js";
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

const COLUMNAS = "id, slug, name, goal, level, days_per_week";

// Plantillas públicas (sin dueño). Las rutinas propias del usuario se listan en su panel.
export async function listRoutines(
  f: RoutineFilters,
  client?: SupabaseClient,
): Promise<RoutineSummary[]> {
  const db = client ?? (await createServerClient());
  let consulta = db.from("routines").select(COLUMNAS).is("owner_id", null);
  if (f.goal) consulta = consulta.eq("goal", f.goal);
  if (f.level) consulta = consulta.eq("level", f.level);
  const { data, error } = await consulta.order("id");
  if (error) throw error;
  return (data ?? []) as RoutineSummary[];
}

export async function getRoutineBySlug(
  slug: string,
  client?: SupabaseClient,
): Promise<RoutineDetail | null> {
  const db = client ?? (await createServerClient());
  const { data: rutina, error } = await db
    .from("routines")
    .select(`${COLUMNAS}, description`)
    .eq("slug", slug)
    .is("owner_id", null)
    .maybeSingle();
  if (error) throw error;
  if (!rutina) return null;

  const { data: filas, error: e2 } = await db
    .from("routine_exercises")
    .select("exercise_id, day_index, position, sets, reps_min, reps_max, rest_seconds, notes")
    .eq("routine_id", rutina.id)
    .order("position");
  if (e2) throw e2;

  const ids = [...new Set((filas ?? []).map((r) => r.exercise_id as number))];
  const { data: ejercicios, error: e3 } = ids.length
    ? await db.from("exercises").select("id, slug, name_es").in("id", ids)
    : { data: [], error: null };
  if (e3) throw e3;
  const porId = new Map((ejercicios ?? []).map((x) => [x.id as number, x]));

  const dias = new Map<number, RoutineDayExercise[]>();
  const ordenadas = [...(filas ?? [])].sort(
    (a, b) => a.day_index - b.day_index || a.position - b.position,
  );
  for (const r of ordenadas) {
    const ej = porId.get(r.exercise_id as number);
    if (!ej) continue;
    const lista = dias.get(r.day_index) ?? [];
    lista.push({
      exercise: { slug: ej.slug, name_es: ej.name_es },
      sets: r.sets,
      reps_min: r.reps_min,
      reps_max: r.reps_max,
      rest_seconds: r.rest_seconds,
      notes: r.notes,
    });
    dias.set(r.day_index, lista);
  }

  return {
    ...(rutina as RoutineSummary & { description: string | null }),
    dias: [...dias.entries()].map(([dia, ejercicios]) => ({ dia, ejercicios })),
  };
}
