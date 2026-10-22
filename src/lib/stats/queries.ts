import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import type { Punto, SetConFecha } from "./aggregate";

// Fechas de los entrenos terminados del usuario desde una fecha.
export async function getTrainedDates(userId: string, desde: string, client?: SupabaseClient): Promise<string[]> {
  const db = client ?? (await createServerClient());
  const { data } = await db
    .from("workout_logs")
    .select("date")
    .eq("user_id", userId)
    .gte("date", desde)
    .not("finished_at", "is", null);
  return (data ?? []).map((w) => w.date as string);
}

// Series de entrenos terminados desde una fecha, con la fecha del entreno.
export async function getSetsSince(userId: string, desde: string, client?: SupabaseClient): Promise<SetConFecha[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db
    .from("set_logs")
    .select("exercise_id, weight_kg, reps, workout_logs!inner(date, user_id, finished_at)")
    .eq("workout_logs.user_id", userId)
    .gte("workout_logs.date", desde)
    .not("workout_logs.finished_at", "is", null)
    .limit(5000);
  if (error) throw error;
  return (data ?? []).flatMap((s) => {
    const w = (Array.isArray(s.workout_logs) ? s.workout_logs[0] : s.workout_logs) as { date: string } | null;
    return w ? [{ date: w.date, exercise_id: s.exercise_id, weight_kg: Number(s.weight_kg), reps: s.reps }] : [];
  });
}

export async function getWeightSeries(userId: string, desde: string, client?: SupabaseClient): Promise<Punto[]> {
  const db = client ?? (await createServerClient());
  const { data } = await db
    .from("body_measurements")
    .select("date, weight_kg")
    .eq("user_id", userId)
    .gte("date", desde)
    .not("weight_kg", "is", null)
    .order("date");
  return (data ?? []).map((m) => ({ date: m.date as string, value: Number(m.weight_kg) }));
}

export async function getExerciseNames(ids: number[], client?: SupabaseClient, idioma: "es" | "en" = "es"): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();
  const db = client ?? (await createServerClient());
  const { data } = await db.from("exercises").select("id, name_es, name_en").in("id", ids);
  return new Map((data ?? []).map((e) => [e.id as number, ((idioma === "en" && e.name_en) || e.name_es) as string]));
}
