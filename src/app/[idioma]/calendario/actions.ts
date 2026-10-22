"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { validarSesion } from "@/lib/calendar/validate";
import { tDeCookie } from "@/lib/i18n/servidor";
import { createServerClient } from "@/lib/supabase/server";

const ESTADOS = ["planificada", "hecha", "saltada"] as const;

export type EstadoPlanificar = { error?: string };

export async function planificarSesion(_: EstadoPlanificar, datos: FormData): Promise<EstadoPlanificar> {
  const [usuario, es] = await Promise.all([getCurrentUser(), tDeCookie()]);
  const t = es.calendario;
  if (!usuario) return { error: es.constructor.errorSesion };

  const campo = (n: string) => String(datos.get(n) ?? "");
  const r = validarSesion({
    fecha: campo("fecha"),
    rutina: campo("rutina"),
    dia: campo("dia"),
    nota: campo("nota"),
  }, t.errores);
  if ("error" in r) return { error: r.error };

  const supabase = await createServerClient();
  if (r.datos.routine_id !== null) {
    // La rutina debe ser visible para el usuario (plantilla o suya); la base lo vuelve a exigir.
    const { data: rutina } = await supabase
      .from("routines")
      .select("days_per_week")
      .eq("id", r.datos.routine_id)
      .maybeSingle();
    if (!rutina) return { error: t.errorRutina };
    if (r.datos.routine_day_index !== null && r.datos.routine_day_index > rutina.days_per_week)
      return { error: t.errorDia(rutina.days_per_week) };
  }

  const { error } = await supabase.from("planned_sessions").insert({ user_id: usuario.id, ...r.datos });
  if (error) return { error: t.errorGeneral };

  revalidatePath("/calendario");
  redirect(`/calendario?mes=${r.datos.date.slice(0, 7)}&dia=${r.datos.date}`);
}

export async function cambiarEstado(id: number, estado: string) {
  const usuario = await getCurrentUser();
  if (!usuario || !Number.isInteger(id) || !ESTADOS.includes(estado as (typeof ESTADOS)[number])) return;
  const supabase = await createServerClient();
  await supabase.from("planned_sessions").update({ status: estado }).eq("id", id).eq("user_id", usuario.id);
  revalidatePath("/calendario");
}

export async function borrarSesion(id: number) {
  const usuario = await getCurrentUser();
  if (!usuario || !Number.isInteger(id)) return;
  const supabase = await createServerClient();
  await supabase.from("planned_sessions").delete().eq("id", id).eq("user_id", usuario.id);
  revalidatePath("/calendario");
}
