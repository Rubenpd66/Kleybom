import type { SupabaseClient } from "@supabase/supabase-js";
import type { Idioma } from "@/lib/i18n";
import { createServerClient } from "@/lib/supabase/server";

export const ZONA_POR_DEFECTO = "Europe/Madrid";

export type Estado = "planificada" | "hecha" | "saltada";

export type Sesion = {
  id: number;
  date: string;
  status: Estado;
  note: string | null;
  routine_day_index: number | null;
  routine: { name: string; slug: string | null } | null;
};

export type OpcionRutina = { id: number; name: string; days_per_week: number; propia: boolean };

export async function getUserTimezone(userId: string, client?: SupabaseClient): Promise<string> {
  const db = client ?? (await createServerClient());
  const { data } = await db.from("profiles").select("timezone").eq("id", userId).maybeSingle();
  return data?.timezone || ZONA_POR_DEFECTO;
}

// Sesiones del usuario entre dos días (incluidos), con el nombre de su rutina.
export async function listSessions(
  userId: string,
  desde: string,
  hasta: string,
  client?: SupabaseClient,
  idioma: Idioma = "es",
): Promise<Sesion[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db
    .from("planned_sessions")
    .select("id, date, status, note, routine_day_index, routines(name, name_en, slug)")
    .eq("user_id", userId)
    .gte("date", desde)
    .lte("date", hasta)
    .order("date")
    .order("id");
  if (error) throw error;
  return (data ?? []).map((s) => {
    const r = Array.isArray(s.routines) ? s.routines[0] : s.routines;
    return {
      id: s.id,
      date: s.date,
      status: s.status as Estado,
      note: s.note,
      routine_day_index: s.routine_day_index,
      // Las plantillas tienen nombre en inglés; las rutinas propias, el que les puso su dueño.
      routine: r ? { name: (idioma === "en" && r.name_en) || r.name, slug: r.slug } : null,
    };
  });
}

export async function countSessions(userId: string, client?: SupabaseClient): Promise<number> {
  const db = client ?? (await createServerClient());
  const { count } = await db
    .from("planned_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}

// Rutinas que el usuario puede planificar: las plantillas públicas y las suyas (lo filtra la base).
export async function listRoutineOptions(client?: SupabaseClient, idioma: Idioma = "es"): Promise<OpcionRutina[]> {
  const db = client ?? (await createServerClient());
  const { data, error } = await db
    .from("routines")
    .select("id, name, name_en, days_per_week, owner_id")
    .order("id");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: (idioma === "en" && r.name_en) || r.name,
    days_per_week: r.days_per_week,
    propia: r.owner_id !== null,
  }));
}
