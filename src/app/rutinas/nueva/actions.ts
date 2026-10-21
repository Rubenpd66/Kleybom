"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listExercises } from "@/lib/exercises/queries";
import { es } from "@/lib/i18n/es";
import { createServerClient } from "@/lib/supabase/server";
import { validateRoutine, type RoutineDraft } from "@/lib/routines/validate";

const MAX_RUTINAS_PROPIAS = 50;
const MAX_EJERCICIOS = 150;

export type ResultadoBusqueda = { id: number; name_es: string }[];

// El catálogo es público, pero se limita el texto para no aceptar entradas absurdas.
export async function buscarEjercicios(texto: string): Promise<ResultadoBusqueda> {
  const q = String(texto ?? "").slice(0, 60);
  const { items } = await listExercises({ q });
  return items.slice(0, 8).map((e) => ({ id: e.id, name_es: e.name_es }));
}

export async function guardarRutina(borrador: RoutineDraft): Promise<{ errores: string[] }> {
  const usuario = await getCurrentUser();
  if (!usuario) return { errores: [es.constructor.errorSesion] };

  // Se vuelve a validar aquí: el navegador no es de fiar.
  const exercises = Array.isArray(borrador?.exercises) ? borrador.exercises : [];
  if (exercises.length > MAX_EJERCICIOS) return { errores: [es.constructor.errorGeneral] };
  const limpio: RoutineDraft = { ...borrador, name: String(borrador?.name ?? "").trim(), exercises };
  const v = validateRoutine(limpio);
  if (!v.ok) return { errores: v.errors };

  const supabase = await createServerClient();
  const { count } = await supabase
    .from("routines")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", usuario.id);
  if ((count ?? 0) >= MAX_RUTINAS_PROPIAS) return { errores: [es.constructor.errorLimite] };

  const { data: rutina, error } = await supabase
    .from("routines")
    .insert({
      owner_id: usuario.id,
      name: limpio.name,
      goal: limpio.goal,
      level: limpio.level,
      days_per_week: limpio.days_per_week,
    })
    .select("id")
    .single();
  if (error || !rutina) return { errores: [es.constructor.errorGeneral] };

  // La posición se recalcula aquí (por orden dentro de cada día), no se toma del navegador.
  const contador = new Map<number, number>();
  const filas = [...limpio.exercises]
    .map((e, i) => ({ e, i }))
    .sort((a, b) => a.e.day_index - b.e.day_index || a.i - b.i)
    .map(({ e }) => {
      const posicion = (contador.get(e.day_index) ?? 0) + 1;
      contador.set(e.day_index, posicion);
      return {
        routine_id: rutina.id,
        exercise_id: e.exercise_id,
        day_index: e.day_index,
        position: posicion,
        sets: e.sets,
        reps_min: e.reps_min,
        reps_max: e.reps_max,
        rest_seconds: e.rest_seconds,
      };
    });

  const { error: e2 } = await supabase.from("routine_exercises").insert(filas);
  if (e2) {
    // Si fallan los ejercicios no se deja una rutina vacía a medias.
    await supabase.from("routines").delete().eq("id", rutina.id);
    return { errores: [es.constructor.errorGeneral] };
  }

  revalidatePath("/panel/rutinas");
  redirect("/panel/rutinas");
}
