// Uso:
//   npx tsx scripts/import-wger/run.ts --dry-run   (descarga y cuenta; no escribe nada)
//   npx tsx scripts/import-wger/run.ts             (escribe en Supabase; necesita SUPABASE_SERVICE_ROLE_KEY en .env.local)
import { createClient } from "@supabase/supabase-js";
import { MATERIAL_ES, MUSCULOS_ES } from "./catalogo-es.ts";
import { parseWgerExercise, type WgerExerciseInfo } from "./parse.ts";
import { uniqueSlugs } from "./slugs.ts";

const dryRun = process.argv.includes("--dry-run");

async function descargar(): Promise<WgerExerciseInfo[]> {
  const todos: WgerExerciseInfo[] = [];
  let url: string | null = "https://wger.de/api/v2/exerciseinfo/?limit=100&format=json";
  while (url) {
    const r: Response = await fetch(url);
    if (!r.ok) throw new Error(`wger respondió ${r.status} en ${url}`);
    const j: { next: string | null; results: WgerExerciseInfo[] } = await r.json();
    todos.push(...j.results);
    url = j.next;
  }
  return todos;
}

async function main() {
  const crudos = await descargar();
  const filas = uniqueSlugs(
    crudos.flatMap((c) => {
      const f = parseWgerExercise(c);
      return f ? [f] : [];
    }),
  );
  const descartados = crudos.length - filas.length;

  // Todo músculo o material debe estar en el catálogo en español.
  const sinNombre = new Set<string>();
  for (const f of filas) {
    for (const m of f.muscles) if (!MUSCULOS_ES[m.source_id]) sinNombre.add(`músculo ${m.source_id} (${m.name})`);
    for (const e of f.equipment) if (!MATERIAL_ES[e.source_id]) sinNombre.add(`material ${e.source_id} (${e.name})`);
  }
  if (sinNombre.size) throw new Error(`Faltan en catalogo-es.ts: ${[...sinNombre].join(", ")}`);

  const aTraducir = filas.filter((f) => f.needs_translation).length;
  console.log(`Descargados: ${crudos.length}`);
  console.log(`A importar: ${filas.length} (${aTraducir} sin traducción al español)`);
  console.log(`Descartados por falta de licencia/autor/nombre: ${descartados}`);
  const vistos = new Map<string, string>();
  for (const f of filas) {
    for (const m of f.muscles) vistos.set(`músculo ${m.source_id}`, `${m.name} -> ${MUSCULOS_ES[m.source_id].name_es}`);
    for (const e of f.equipment) vistos.set(`material ${e.source_id}`, `${e.name} -> ${MATERIAL_ES[e.source_id].name_es}`);
  }
  console.log([...vistos.entries()].sort().map(([k, v]) => `  ${k}: ${v}`).join("\n"));
  if (dryRun) return;

  process.loadEnvFile(".env.local");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const db = createClient(url, clave, { auth: { persistSession: false } });

  const ok = async <T>(p: PromiseLike<{ data: T; error: { message: string } | null }>) => {
    const { data, error } = await p;
    if (error) throw new Error(error.message);
    return data;
  };

  await ok(db.from("muscles").upsert(Object.values(MUSCULOS_ES), { onConflict: "slug" }));
  await ok(db.from("equipment").upsert(Object.values(MATERIAL_ES), { onConflict: "slug" }));
  const muscles = await ok(db.from("muscles").select("id, slug"));
  const equipment = await ok(db.from("equipment").select("id, slug"));
  const idMusculo = new Map((muscles ?? []).map((m) => [m.slug, m.id as number]));
  const idMaterial = new Map((equipment ?? []).map((e) => [e.slug, e.id as number]));

  const columnas = filas.map(({ muscles: _m, equipment: _e, ...resto }) => resto);
  for (let i = 0; i < columnas.length; i += 100) {
    await ok(db.from("exercises").upsert(columnas.slice(i, i + 100), { onConflict: "source,source_id" }));
  }
  const guardados = await ok(db.from("exercises").select("id, source_id").eq("source", "wger"));
  const idEjercicio = new Map((guardados ?? []).map((g) => [g.source_id as string, g.id as number]));

  const relMusculos = filas.flatMap((f) =>
    f.muscles.map((m) => ({
      exercise_id: idEjercicio.get(f.source_id)!,
      muscle_id: idMusculo.get(MUSCULOS_ES[m.source_id].slug)!,
      role: m.role,
    })),
  );
  const relMaterial = filas.flatMap((f) =>
    f.equipment.map((e) => ({
      exercise_id: idEjercicio.get(f.source_id)!,
      equipment_id: idMaterial.get(MATERIAL_ES[e.source_id].slug)!,
    })),
  );
  // Si un músculo sale como principal y secundario, gana el principal.
  const unicos = new Map(relMusculos.map((r) => [`${r.exercise_id}-${r.muscle_id}`, r]));
  const porRol = [...relMusculos].sort((a) => (a.role === "principal" ? 1 : -1));
  porRol.forEach((r) => unicos.set(`${r.exercise_id}-${r.muscle_id}`, r));
  await ok(db.from("exercise_muscles").upsert([...unicos.values()], { onConflict: "exercise_id,muscle_id" }));
  await ok(db.from("exercise_equipment").upsert(relMaterial, { onConflict: "exercise_id,equipment_id" }));
  console.log("Importación terminada.");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
