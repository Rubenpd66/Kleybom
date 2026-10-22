import type { SupabaseClient } from "@supabase/supabase-js";
import type { Idioma } from "@/lib/i18n";
import { createServerClient } from "@/lib/supabase/server";

export type Workout = {
  id: number;
  date: string;
  routine_id: number | null;
  routine_day_index: number | null;
  planned_session_id: number | null;
  finished_at: string | null;
  routine_name: string | null;
};

export type SerieGuardada = { id: number; exercise_id: number; set_index: number; weight_kg: number; reps: number };

export type EjercicioDelDia = {
  exercise_id: number;
  slug: string;
  name_es: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
};

export async function getWorkout(id: number, userId: string, client?: SupabaseClient, idioma: Idioma = "es"): Promise<Workout | null> {
  const db = client ?? (await createServerClient());
  const { data } = await db
    .from("workout_logs")
    .select("id, date, routine_id, routine_day_index, planned_session_id, finished_at, routines(name, name_en)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  const r = Array.isArray(data.routines) ? data.routines[0] : data.routines;
  return {
    id: data.id,
    date: data.date,
    routine_id: data.routine_id,
    routine_day_index: data.routine_day_index,
    planned_session_id: data.planned_session_id,
    finished_at: data.finished_at,
    routine_name: (idioma === "en" && (r as { name_en?: string | null } | null)?.name_en) || ((r as { name?: string } | null)?.name ?? null),
  };
}

export async function getSets(workoutId: number, client?: SupabaseClient): Promise<SerieGuardada[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db
    .from("set_logs")
    .select("id, exercise_id, set_index, weight_kg, reps")
    .eq("workout_log_id", workoutId)
    .order("id");
  if (error) throw error;
  return (data ?? []).map((s) => ({ ...s, weight_kg: Number(s.weight_kg) }));
}

export async function getDayExercises(routineId: number, day: number, client?: SupabaseClient, idioma: Idioma = "es"): Promise<EjercicioDelDia[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db
    .from("routine_exercises")
    .select("exercise_id, sets, reps_min, reps_max, rest_seconds, position, exercises(slug, name_es, name_en)")
    .eq("routine_id", routineId)
    .eq("day_index", day)
    .order("position");
  if (error) throw error;
  return (data ?? []).flatMap((r) => {
    const e = (Array.isArray(r.exercises) ? r.exercises[0] : r.exercises) as { slug: string; name_es: string; name_en: string | null } | null;
    return e
      ? [{ exercise_id: r.exercise_id, slug: e.slug, name_es: (idioma === "en" && e.name_en) || e.name_es, sets: r.sets, reps_min: r.reps_min, reps_max: r.reps_max, rest_seconds: r.rest_seconds }]
      : [];
  });
}

// Series de la sesión terminada más reciente en la que apareció cada ejercicio (sin contar la actual).
export async function getPreviousSets(
  userId: string,
  exerciseIds: number[],
  excludeWorkoutId: number,
  client?: SupabaseClient,
): Promise<Map<number, SerieGuardada[]>> {
  const resultado = new Map<number, SerieGuardada[]>();
  if (exerciseIds.length === 0) return resultado;
  const db = client ?? (await createServerClient());
  const { data: recientes } = await db
    .from("workout_logs")
    .select("id")
    .eq("user_id", userId)
    .neq("id", excludeWorkoutId)
    .not("finished_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(30);
  const ids = (recientes ?? []).map((w) => w.id as number);
  if (ids.length === 0) return resultado;

  const { data: series } = await db
    .from("set_logs")
    .select("id, workout_log_id, exercise_id, set_index, weight_kg, reps")
    .in("workout_log_id", ids)
    .in("exercise_id", exerciseIds)
    .order("set_index");
  const orden = new Map(ids.map((id, i) => [id, i]));
  for (const ej of exerciseIds) {
    const delEjercicio = (series ?? []).filter((s) => s.exercise_id === ej);
    if (delEjercicio.length === 0) continue;
    const masReciente = Math.min(...delEjercicio.map((s) => orden.get(s.workout_log_id as number) ?? Infinity));
    resultado.set(
      ej,
      delEjercicio
        .filter((s) => orden.get(s.workout_log_id as number) === masReciente)
        .map((s) => ({ id: s.id, exercise_id: s.exercise_id, set_index: s.set_index, weight_kg: Number(s.weight_kg), reps: s.reps })),
    );
  }
  return resultado;
}

export type PlanificadaHoy = { id: number; routine_id: number; routine_day_index: number | null; routine_name: string };

export async function listPlannedWithRoutine(userId: string, date: string, client?: SupabaseClient, idioma: Idioma = "es"): Promise<PlanificadaHoy[]> {
  const db = client ?? (await createServerClient());
  const { data } = await db
    .from("planned_sessions")
    .select("id, routine_id, routine_day_index, status, routines(name, name_en)")
    .eq("user_id", userId)
    .eq("date", date)
    .not("routine_id", "is", null)
    .neq("status", "hecha")
    .order("id");
  return (data ?? []).flatMap((s) => {
    const r = (Array.isArray(s.routines) ? s.routines[0] : s.routines) as { name: string; name_en: string | null } | null;
    const nombre = r ? (idioma === "en" && r.name_en) || r.name : "";
    return r && s.routine_id ? [{ id: s.id, routine_id: s.routine_id, routine_day_index: s.routine_day_index, routine_name: nombre }] : [];
  });
}
