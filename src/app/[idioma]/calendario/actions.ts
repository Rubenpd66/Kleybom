"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { planDeRutina, REPETIR, type Repetir } from "@/lib/calendar/plan";
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
  // Repetir el plan de la rutina (hasta fin de mes o cuatro semanas); sin rutina, solo ese día.
  const textoRepetir = campo("repetir");
  const repetir: Repetir = (REPETIR as string[]).includes(textoRepetir) ? (textoRepetir as Repetir) : "dia";

  const supabase = await createServerClient();
  let diasPorSemana = 0;
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
    diasPorSemana = rutina.days_per_week;
  }

  let filas = [{ user_id: usuario.id, ...r.datos }];
  if (r.datos.routine_id !== null && repetir !== "dia" && diasPorSemana > 0) {
    const plan = planDeRutina(r.datos.date, diasPorSemana, repetir, r.datos.routine_day_index ?? 1);
    // Los días que ya tienen esta misma rutina se dejan como están (volver a planificar no duplica).
    const { data: yaHay } = await supabase
      .from("planned_sessions")
      .select("date")
      .eq("user_id", usuario.id)
      .eq("routine_id", r.datos.routine_id)
      .gte("date", plan[0].fecha)
      .lte("date", plan.at(-1)!.fecha);
    const ocupados = new Set((yaHay ?? []).map((s) => s.date));
    filas = plan
      .filter((p) => !ocupados.has(p.fecha))
      .map((p) => ({ user_id: usuario.id, ...r.datos, date: p.fecha, routine_day_index: p.dia }));
    if (filas.length === 0) return { error: t.yaPlanificado };
  }

  const { error } = await supabase.from("planned_sessions").insert(filas);
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
