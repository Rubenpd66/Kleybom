// Importa alimentos genéricos de USDA FoodData Central (SR Legacy, dominio público CC0).
// 1. Descarga "SR Legacy" en JSON de https://fdc.nal.usda.gov/download-datasets y descomprímelo.
// 2. node scripts/import-usda/run.ts <ruta al .json> --dry-run   (cuenta, no escribe)
//    node scripts/import-usda/run.ts <ruta al .json>             (escribe; necesita SUPABASE_SERVICE_ROLE_KEY)
// Se puede repetir: actualiza por (source, source_id). No pisa name_es ni search_text ya traducidos.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { parseUsdaFood, type FoodRow, type UsdaFood } from "./parse.ts";

const ruta = process.argv.slice(2).find((a) => !a.startsWith("--"));
const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!ruta) throw new Error("Indica la ruta del JSON de SR Legacy.");
  const json = JSON.parse(readFileSync(ruta, "utf-8")) as Record<string, UsdaFood[]>;
  const crudos = json.SRLegacyFoods ?? json[Object.keys(json)[0]];
  const filas = crudos.flatMap((c) => {
    const f = parseUsdaFood(c);
    return f ? [f] : [];
  });

  const nulos = (k: keyof FoodRow) => filas.filter((f) => f[k] === null).length;
  console.log(`Leídos: ${crudos.length}. A importar: ${filas.length}. Descartados: ${crudos.length - filas.length}.`);
  console.log(
    `Sin dato: kcal ${nulos("kcal")}, proteína ${nulos("protein_g")}, hidratos ${nulos("carbs_g")}, grasa ${nulos("fat_g")}, fibra ${nulos("fiber_g")}, azúcar ${nulos("sugar_g")}, sodio ${nulos("sodium_mg")}.`,
  );
  if (dryRun) return;

  process.loadEnvFile(".env.local");
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, { auth: { persistSession: false } });

  // Los ya existentes conservan su nombre en español, su texto de búsqueda y su slug (pueden estar traducidos).
  const existentes = new Set<string>();
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await db.from("foods").select("source_id").eq("source", "usda").range(desde, desde + 999);
    if (error) throw new Error(error.message);
    (data ?? []).forEach((d) => existentes.add(d.source_id as string));
    if (!data || data.length < 1000) break;
  }

  const nuevos = filas.filter((f) => !existentes.has(f.source_id));
  const actualizar = filas
    .filter((f) => existentes.has(f.source_id))
    .map(({ name_es: _n, search_text: _s, slug: _g, ...resto }) => resto);

  for (let i = 0; i < nuevos.length; i += 500) {
    const { error } = await db.from("foods").insert(nuevos.slice(i, i + 500));
    if (error) throw new Error(error.message);
  }
  for (let i = 0; i < actualizar.length; i += 500) {
    const { error } = await db.from("foods").upsert(actualizar.slice(i, i + 500), { onConflict: "source,source_id" });
    if (error) throw new Error(error.message);
  }
  console.log(`Insertados ${nuevos.length}, actualizados ${actualizar.length}.`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
