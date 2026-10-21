// Datos públicos (iguales para todo el mundo) leídos con el cliente anónimo y guardados en caché un día.
// Así las fichas se generan enteras en el servidor: rápidas, sin saltos y con sus metadatos en el <head>.
import { cacheLife } from "next/cache";
import { getExerciseBySlug } from "@/lib/exercises/queries";
import { getFoodBySlug } from "@/lib/foods/queries";
import { getRecipeBySlug } from "@/lib/recipes/queries";
import { getRoutineBySlug } from "@/lib/routines/queries";
import { createPublicClient } from "@/lib/supabase/public";

export async function ejercicioPublico(slug: string) {
  "use cache";
  cacheLife("days");
  return getExerciseBySlug(slug, createPublicClient());
}

export async function rutinaPublica(slug: string) {
  "use cache";
  cacheLife("days");
  return getRoutineBySlug(slug, createPublicClient());
}

export async function alimentoPublico(slug: string) {
  "use cache";
  cacheLife("days");
  return getFoodBySlug(slug, createPublicClient());
}

export async function recetaPublica(slug: string) {
  "use cache";
  cacheLife("days");
  return getRecipeBySlug(slug, createPublicClient());
}

const POR_PAGINA = 1000; // máximo de filas que devuelve Supabase por consulta

// Slugs públicos de una tabla (todos, o los `limite` primeros), en tandas de 1000.
export async function slugsPublicos(tabla: "exercises" | "routines" | "foods" | "recipes", limite = Infinity): Promise<string[]> {
  "use cache";
  cacheLife("days");
  const db = createPublicClient();
  const todos: string[] = [];
  for (let desde = 0; todos.length < limite; desde += POR_PAGINA) {
    let consulta = db.from(tabla).select("slug").order("id").range(desde, desde + Math.min(POR_PAGINA, limite - todos.length) - 1);
    if (tabla === "routines") consulta = consulta.is("owner_id", null);
    const { data, error } = await consulta;
    if (error) throw new Error(`No se pudo leer ${tabla}: ${error.message}`);
    todos.push(...data.map((f) => f.slug as string).filter(Boolean));
    if (data.length < POR_PAGINA) break;
  }
  return todos;
}
