// Uso:
//   node scripts/seed-rutinas/run.ts --dry-run   comprueba que los ejercicios existen y escribe docs/contenido-rutinas.md (no toca la base)
//   node scripts/seed-rutinas/run.ts             carga las plantillas (necesita SUPABASE_SERVICE_ROLE_KEY en .env.local)
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { validateRoutine } from "../../src/lib/routines/validate.ts";
import { PLANTILLAS, aBorrador } from "./rutinas.ts";

const dryRun = process.argv.includes("--dry-run");
process.loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const sinSesion = { auth: { persistSession: false } };

const OBJETIVOS: Record<string, string> = {
  fuerza: "Fuerza",
  hipertrofia: "Ganar músculo",
  perdida_grasa: "Pérdida de grasa",
  resistencia: "Resistencia",
  movilidad: "Movilidad",
};
const NIVELES: Record<string, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

async function main() {
  // El catálogo de ejercicios es público: se lee con la clave pública.
  const lector = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, sinSesion);
  const slugs = [...new Set(PLANTILLAS.flatMap((p) => p.dias.flat().map((x) => x.slug)))];
  const { data, error } = await lector.from("exercises").select("id, slug, name_es").in("slug", slugs);
  if (error) throw new Error(error.message);
  const porSlug = new Map((data ?? []).map((x) => [x.slug as string, x]));

  const faltan = slugs.filter((s) => !porSlug.has(s));
  if (faltan.length) throw new Error(`Ejercicios que no existen en la base: ${faltan.join(", ")}`);

  for (const p of PLANTILLAS) {
    const v = validateRoutine(aBorrador(p, (s) => porSlug.get(s)!.id));
    if (!v.ok) throw new Error(`${p.slug} no es válida:\n${v.errors.join("\n")}`);
  }
  console.log(`Comprobado: ${PLANTILLAS.length} plantillas válidas, ${slugs.length} ejercicios distintos, todos existen.`);

  const doc = [
    "# Contenido de las plantillas de rutinas",
    "",
    "Generado por `scripts/seed-rutinas/run.ts --dry-run`. Para cambiar algo, se edita `scripts/seed-rutinas/rutinas.ts` y se vuelve a generar.",
    "Las series y repeticiones son recomendaciones generales, no una prescripción personalizada.",
    "",
    ...PLANTILLAS.flatMap((p) => [
      `## ${p.name}`,
      "",
      `- **Objetivo:** ${OBJETIVOS[p.goal]} · **Nivel:** ${NIVELES[p.level]} · **Días por semana:** ${p.dias.length}`,
      "",
      p.description,
      "",
      ...p.dias.flatMap((dia, i) => [
        `### Día ${i + 1}`,
        "",
        ...dia.map((x) => {
          const reps = x.reps[0] === x.reps[1] ? `${x.reps[0]}` : `${x.reps[0]}-${x.reps[1]}`;
          const nombre = porSlug.get(x.slug)!.name_es;
          return `- ${nombre}: ${x.series} × ${reps}, descanso ${x.descanso} s${x.nota ? `. ${x.nota}` : ""}`;
        }),
        "",
      ]),
    ]),
  ].join("\n");
  writeFileSync("docs/contenido-rutinas.md", doc, "utf-8");
  console.log("Escrito docs/contenido-rutinas.md");
  if (dryRun) return;

  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const db = createClient(url, clave, sinSesion);

  for (const p of PLANTILLAS) {
    const { data: r, error: e1 } = await db
      .from("routines")
      .upsert(
        {
          slug: p.slug,
          owner_id: null,
          name: p.name,
          description: p.description,
          goal: p.goal,
          level: p.level,
          days_per_week: p.dias.length,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (e1) throw new Error(`${p.slug}: ${e1.message}`);

    const { error: e2 } = await db.from("routine_exercises").delete().eq("routine_id", r.id);
    if (e2) throw new Error(`${p.slug}: ${e2.message}`);

    const filas = p.dias.flatMap((dia, i) =>
      dia.map((x, j) => ({
        routine_id: r.id,
        exercise_id: porSlug.get(x.slug)!.id,
        day_index: i + 1,
        position: j + 1,
        sets: x.series,
        reps_min: x.reps[0],
        reps_max: x.reps[1],
        rest_seconds: x.descanso,
        notes: x.nota ?? null,
      })),
    );
    const { error: e3 } = await db.from("routine_exercises").insert(filas);
    if (e3) throw new Error(`${p.slug}: ${e3.message}`);
    console.log(`Cargada: ${p.slug} (${filas.length} ejercicios)`);
  }
  console.log("Carga terminada.");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
