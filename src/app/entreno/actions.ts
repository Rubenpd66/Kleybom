"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { toLocalDateKey } from "@/lib/calendar/dates";
import { getUserTimezone } from "@/lib/calendar/queries";
import { es } from "@/lib/i18n/es";
import { ERRORES } from "@/lib/training/session";
import { createServerClient } from "@/lib/supabase/server";

const t = es.entreno;

export type EstadoEntreno = { error?: string };

async function crearEntreno(routineId: number, day: number, plannedId: number | null): Promise<EstadoEntreno> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: es.constructor.errorSesion };
  const supabase = await createServerClient();

  const { data: rutina } = await supabase.from("routines").select("days_per_week").eq("id", routineId).maybeSingle();
  if (!rutina) return { error: t.errorRutina };
  if (!Number.isInteger(day) || day < 1 || day > rutina.days_per_week) return { error: t.errorRutina };

  const hoy = toLocalDateKey(new Date(), await getUserTimezone(usuario.id));
  const { data, error } = await supabase
    .from("workout_logs")
    .insert({ user_id: usuario.id, date: hoy, routine_id: routineId, routine_day_index: day, planned_session_id: plannedId })
    .select("id")
    .single();
  if (error || !data) return { error: t.errorGeneral };
  redirect(`/entreno?id=${data.id}`);
}

// Desde una sesión planificada del calendario.
export async function empezarPlanificada(plannedId: number) {
  const usuario = await getCurrentUser();
  if (!usuario) return;
  const supabase = await createServerClient();
  const { data: s } = await supabase
    .from("planned_sessions")
    .select("routine_id, routine_day_index")
    .eq("id", plannedId)
    .eq("user_id", usuario.id)
    .maybeSingle();
  if (!s?.routine_id) return;
  await crearEntreno(s.routine_id, s.routine_day_index ?? 1, plannedId);
}

// Desde el formulario (rutina + día).
export async function empezarConRutina(_: EstadoEntreno, form: FormData): Promise<EstadoEntreno> {
  return crearEntreno(Number(form.get("rutina")), Number(form.get("dia") || 1), null);
}

// Cada serie se guarda al momento (si se cierra la pestaña no se pierde nada).
export async function registrarSerie(datos: {
  workout_log_id: number;
  exercise_id: number;
  weight_kg: number;
  reps: number;
}): Promise<{ id?: number; error?: string }> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: es.constructor.errorSesion };
  const { workout_log_id, exercise_id, weight_kg, reps } = datos;
  if (!Number.isFinite(weight_kg) || weight_kg < 0 || weight_kg > 1000) return { error: ERRORES.peso };
  if (!Number.isInteger(reps) || reps < 1 || reps > 200) return { error: ERRORES.reps };

  const supabase = await createServerClient();
  const { data: w } = await supabase
    .from("workout_logs")
    .select("finished_at")
    .eq("id", workout_log_id)
    .eq("user_id", usuario.id)
    .maybeSingle();
  if (!w || w.finished_at) return { error: t.errorGeneral };

  // Número de serie siguiente según lo ya guardado (con huecos si se borró alguna).
  const { data: ultima } = await supabase
    .from("set_logs")
    .select("set_index")
    .eq("workout_log_id", workout_log_id)
    .eq("exercise_id", exercise_id)
    .order("set_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data, error } = await supabase
    .from("set_logs")
    .insert({ workout_log_id, exercise_id, set_index: (ultima?.set_index ?? 0) + 1, weight_kg, reps })
    .select("id")
    .single();
  if (error || !data) return { error: t.errorGeneral };
  return { id: data.id };
}

export async function borrarSerie(id: number): Promise<{ error?: string }> {
  const usuario = await getCurrentUser();
  if (!usuario || !Number.isInteger(id)) return { error: t.errorGeneral };
  const supabase = await createServerClient();
  // La política de la base solo deja borrar series de entrenos propios.
  const { error } = await supabase.from("set_logs").delete().eq("id", id);
  return error ? { error: t.errorGeneral } : {};
}

export async function terminarEntreno(id: number): Promise<{ error?: string }> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: es.constructor.errorSesion };
  const supabase = await createServerClient();
  const { count } = await supabase.from("set_logs").select("id", { count: "exact", head: true }).eq("workout_log_id", id);
  if (!count) return { error: ERRORES.sinSeries };

  const { data: w, error } = await supabase
    .from("workout_logs")
    .update({ finished_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", usuario.id)
    .is("finished_at", null)
    .select("planned_session_id")
    .maybeSingle();
  if (error) return { error: t.errorGeneral };
  if (w?.planned_session_id) {
    await supabase.from("planned_sessions").update({ status: "hecha" }).eq("id", w.planned_session_id).eq("user_id", usuario.id);
  }
  revalidatePath("/entreno");
  revalidatePath("/calendario");
  return {};
}
