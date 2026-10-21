// node scripts/seed-recetas/run.ts --dry-run   comprueba ingredientes y calcula nutrientes por ración (no escribe)
// node scripts/seed-recetas/run.ts             carga las recetas (repetible: actualiza por slug)
import { createClient } from "@supabase/supabase-js";
import { RECETAS } from "./recetas.ts";

// Solo para el informe del --dry-run (la web usa recipeNutrientsPerServing de src/lib/nutrition).
const CLAVES = ["kcal", "protein_g", "carbs_g", "fat_g", "fiber_g", "sugar_g", "sodium_mg"] as const;
const SELECCION: string = `id, slug, ${CLAVES.join(", ")}`;

const dryRun = process.argv.includes("--dry-run");
process.loadEnvFile(".env.local");

async function main() {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, { auth: { persistSession: false } });

  const slugs = [...new Set(RECETAS.flatMap((r) => r.ingredientes.map((i) => i.slug)))];
  const { data, error } = await db.from("foods").select(SELECCION).in("slug", slugs);
  if (error) throw new Error(error.message);
  const filas = (data ?? []) as unknown as Record<string, unknown>[];
  const porSlug = new Map(filas.map((f) => [f.slug as string, f]));
  const faltan = slugs.filter((s) => !porSlug.has(s));
  if (faltan.length) throw new Error(`Ingredientes que no existen: ${faltan.join(", ")}`);

  for (const r of RECETAS) {
    const total: Record<string, number> = {};
    let incompleto = false;
    for (const i of r.ingredientes) {
      const f = porSlug.get(i.slug)!;
      for (const k of CLAVES) {
        if (f[k] === null) incompleto = true;
        else total[k] = (total[k] ?? 0) + (Number(f[k]) * i.gramos) / 100;
      }
    }
    const racion = (k: string) => Math.round(((total[k] ?? 0) / r.servings) * 10) / 10;
    console.log(
      `${r.name_es}: ${racion("kcal")} kcal/ración, P ${racion("protein_g")} g, H ${racion("carbs_g")} g, G ${racion("fat_g")} g${incompleto ? " (incompleto)" : ""}`,
    );
  }
  if (dryRun) return;

  for (const r of RECETAS) {
    const { data: fila, error: e1 } = await db
      .from("recipes")
      .upsert(
        {
          slug: r.slug,
          name_es: r.name_es,
          description_es: r.description_es,
          steps_es: r.pasos,
          servings: r.servings,
          prep_minutes: r.prep_minutes,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (e1) throw new Error(`${r.slug}: ${e1.message}`);
    const { error: e2 } = await db.from("recipe_ingredients").delete().eq("recipe_id", fila.id);
    if (e2) throw new Error(e2.message);
    const { error: e3 } = await db.from("recipe_ingredients").insert(
      r.ingredientes.map((i, j) => ({
        recipe_id: fila.id,
        food_id: porSlug.get(i.slug)!.id,
        grams: i.gramos,
        position: j + 1,
        note: i.nota ?? null,
      })),
    );
    if (e3) throw new Error(`${r.slug}: ${e3.message}`);
  }
  console.log(`Cargadas ${RECETAS.length} recetas.`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
