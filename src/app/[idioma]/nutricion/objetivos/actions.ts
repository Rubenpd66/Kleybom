"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { tDeCookie } from "@/lib/i18n/servidor";
import { computeTargets, FACTOR_ACTIVIDAD, AJUSTE_OBJETIVO, type TargetsInput } from "@/lib/nutrition/targets";
import { createServerClient } from "@/lib/supabase/server";

export type EstadoObjetivos = { error?: string; aviso?: string };

// Se vuelve a calcular en el servidor: nunca se guardan números que vengan del navegador.
export async function guardarObjetivos(entrada: TargetsInput): Promise<EstadoObjetivos> {
  const [usuario, es] = await Promise.all([getCurrentUser(), tDeCookie()]);
  if (!usuario) return { error: es.constructor.errorSesion };

  const valido =
    (entrada?.sex === "hombre" || entrada?.sex === "mujer") &&
    entrada.activity in FACTOR_ACTIVIDAD &&
    entrada.goal in AJUSTE_OBJETIVO;
  if (!valido) return { error: es.objetivos.errorGeneral };

  let r;
  try {
    r = computeTargets({
      sex: entrada.sex,
      age: Number(entrada.age),
      height_cm: Number(entrada.height_cm),
      weight_kg: Number(entrada.weight_kg),
      activity: entrada.activity,
      goal: entrada.goal,
    });
  } catch {
    return { error: es.objetivos.errorGeneral };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("nutrition_goals").upsert({
    user_id: usuario.id,
    kcal: r.kcal,
    protein_g: r.protein_g,
    carbs_g: r.carbs_g,
    fat_g: r.fat_g,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: es.objetivos.errorGeneral };

  revalidatePath("/nutricion/objetivos");
  revalidatePath("/nutricion");
  return { aviso: es.objetivos.guardadosOk };
}
