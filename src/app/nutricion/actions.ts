"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { esClaveDeDia } from "@/lib/calendar/validate";
import { imagenDeAlimento } from "@/lib/foods/imagen";
import { searchFoods } from "@/lib/foods/queries";
import { es } from "@/lib/i18n/es";
import { MEALS, type Meal } from "@/lib/nutrition/diary";
import { validarGramos } from "@/lib/nutrition/validate";
import { createServerClient } from "@/lib/supabase/server";

const t = es.diario;

export type AlimentoEncontrado = { id: number; name_es: string; kcal: number | null; imagen: string | null };
export type EstadoDiario = { error?: string };

export async function buscarAlimentos(texto: string): Promise<AlimentoEncontrado[]> {
  const { items } = await searchFoods(String(texto ?? "").slice(0, 80), 1);
  return items.slice(0, 8).map((a) => ({ id: a.id, name_es: a.name_es, kcal: a.kcal, imagen: imagenDeAlimento(a.name_en, a.category)?.src ?? null }));
}

export async function anadirEntrada(datos: {
  date: string;
  meal: Meal;
  food_id: number;
  grams: string;
}): Promise<EstadoDiario> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: es.constructor.errorSesion };
  if (!esClaveDeDia(String(datos?.date ?? ""))) return { error: t.errorFecha };
  if (!MEALS.includes(datos.meal)) return { error: t.errorComida };
  if (!Number.isInteger(datos.food_id) || datos.food_id < 1) return { error: t.errorAlimento };
  const g = validarGramos(datos.grams);
  if ("error" in g) return { error: g.error };

  const supabase = await createServerClient();
  const { error } = await supabase.from("meal_entries").insert({
    user_id: usuario.id,
    date: datos.date,
    meal: datos.meal,
    food_id: datos.food_id,
    grams: g.gramos,
  });
  if (error) return { error: error.code === "23503" ? t.errorAlimento : t.errorGeneral };
  revalidatePath("/nutricion");
  return {};
}

export async function editarGramos(id: number, _: EstadoDiario, form: FormData): Promise<EstadoDiario> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: es.constructor.errorSesion };
  const g = validarGramos(String(form.get("gramos") ?? ""));
  if ("error" in g) return { error: g.error };
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("meal_entries")
    .update({ grams: g.gramos })
    .eq("id", id)
    .eq("user_id", usuario.id);
  if (error) return { error: t.errorGeneral };
  revalidatePath("/nutricion");
  return {};
}

export async function borrarEntrada(id: number) {
  const usuario = await getCurrentUser();
  if (!usuario || !Number.isInteger(id)) return;
  const supabase = await createServerClient();
  await supabase.from("meal_entries").delete().eq("id", id).eq("user_id", usuario.id);
  revalidatePath("/nutricion");
}
