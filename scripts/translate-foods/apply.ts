// Aplica las traducciones a los alimentos de USDA.
//   node scripts/translate-foods/apply.ts --dry-run   informe y muestra de 100 nombres (no escribe en la base)
//   node scripts/translate-foods/apply.ts             escribe name_es, search_text y slug; quita las marcas
// Necesita SUPABASE_SERVICE_ROLE_KEY en .env.local.
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { normalizeText } from "../../src/lib/text/normalize.ts";
import {
  MARCA,
  cargarCabezas,
  cargarDiccionario,
  cargarTraduccionesManuales,
  traducirNombre,
} from "./traducir.ts";

const dryRun = process.argv.includes("--dry-run");
const dir = new URL("./", import.meta.url);

const slugify = (s: string) =>
  normalizeText(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

async function main() {
  process.loadEnvFile(".env.local");
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, { auth: { persistSession: false } });

  type Fila = { id: number; source_id: string; name_en: string };
  const alimentos: Fila[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await db
      .from("foods")
      .select("id, source_id, name_en")
      .eq("source", "usda")
      .order("id")
      .range(desde, desde + 999);
    if (error) throw new Error(error.message);
    alimentos.push(...((data ?? []) as Fila[]));
    if (!data || data.length < 1000) break;
  }

  const cabezas = cargarCabezas(dir);
  const diccionario = cargarDiccionario(dir);
  const manuales = cargarTraduccionesManuales(dir);

  const faltan = new Map<string, number>();
  const marcas: Fila[] = [];
  const cambios: { id: number; source_id: string; name_en: string; name_es: string }[] = [];
  for (const a of alimentos) {
    const manual = manuales.get(a.source_id);
    const r = manual
      ? { nombre: manual, faltan: [], marca: manual === MARCA }
      : traducirNombre(a.name_en, cabezas, diccionario);
    r.faltan.forEach((f) => faltan.set(f, (faltan.get(f) ?? 0) + 1));
    if (r.marca) marcas.push(a);
    else cambios.push({ ...a, name_es: r.nombre });
  }

  console.log(`Alimentos: ${alimentos.length}. Traducidos: ${cambios.length}. Marcas a quitar: ${marcas.length}.`);
  console.log(`Segmentos sin traducir: ${faltan.size}`);
  [...faltan.entries()].sort((x, y) => y[1] - x[1]).slice(0, 40).forEach(([s, n]) => console.log(`  ${n}× ${s}`));

  // Muestra fija (cada n-ésimo) para que el usuario la revise.
  const paso = Math.max(1, Math.floor(cambios.length / 100));
  const muestra = cambios.filter((_, i) => i % paso === 0).slice(0, 100);
  writeFileSync(
    "docs/muestra-traduccion-alimentos.md",
    [
      "# Muestra de 100 nombres de alimentos traducidos",
      "",
      "Generada por `scripts/translate-foods/apply.ts`. Si ves un error que se repite, corrígelo en `scripts/translate-foods/` (cabezas o diccionario) y vuelve a aplicar.",
      "",
      "| Inglés (USDA) | Español |",
      "|---|---|",
      ...muestra.map((c) => `| ${c.name_en.replaceAll("|", "/")} | ${c.name_es.replaceAll("|", "/")} |`),
      "",
    ].join("\n"),
    "utf-8",
  );
  console.log("Escrito docs/muestra-traduccion-alimentos.md");
  if (dryRun) return;

  const filas = cambios.map((c) => ({
    source: "usda",
    source_id: c.source_id,
    name_es: c.name_es,
    slug: `${slugify(c.name_es)}-${c.source_id}`,
    search_text: normalizeText(`${c.name_es} ${c.name_en}`),
  }));
  for (let i = 0; i < filas.length; i += 500) {
    const { error } = await db.from("foods").upsert(filas.slice(i, i + 500), { onConflict: "source,source_id" });
    if (error) throw new Error(error.message);
  }
  if (marcas.length) {
    const { error } = await db.from("foods").delete().in("id", marcas.map((m) => m.id));
    if (error) throw new Error(`No se pudieron quitar las marcas: ${error.message}`);
  }
  console.log(`Actualizados ${filas.length}. Quitadas ${marcas.length} marcas.`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
