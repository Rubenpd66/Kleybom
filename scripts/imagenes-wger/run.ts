// Copia en public/img/ejercicios las fotos de wger que tienen licencia y autor propios, y guarda
// en Supabase su autoría y los textos originales en inglés (para el selector de idioma).
// Uso:
//   node scripts/imagenes-wger/run.ts --dry-run   (cuenta; no escribe nada)
//   node scripts/imagenes-wger/run.ts             (necesita SUPABASE_SERVICE_ROLE_KEY en .env.local)
import { mkdir, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { limpiar, pasos, type WgerExerciseInfo } from "../import-wger/parse.ts";

const dryRun = process.argv.includes("--dry-run");
const EN = 2;
const CARPETA = "public/img/ejercicios";

// Fotos revisadas a mano (22/10/2026) que muestran logotipos, marcas de agua o avisos de copyright
// de otras webs: aunque en wger figuren con licencia libre, no está claro que quien las subió fuera el autor.
const FOTOS_EXCLUIDAS = new Set([
  "biceps-con-trx",
  "curl-de-biceps-con-barra-z",
  "curl-de-biceps-con-press-de-hombros-con-mancuernas",
  "elevacion-de-gemelos-sentado-con-mancuerna",
  "elevacion-de-talones-a-dos-piernas",
  "estiramiento-de-triceps-derecho",
  "estiramiento-de-triceps-izquierdo",
  "explosive-push-ups",
  "extension-de-triceps-en-polea-con-cuerda",
  "extension-de-triceps-por-encima-de-la-cabeza",
  "extensiones-de-triceps-con-cuerda-en-polea",
  "flexiones-con-peso",
  "foam-roller-aductores",
  "foam-roller-gluteo",
  "one-arm-bent-row",
  "remo-al-menton-en-multipower",
  "remo-maquina-agarre-estrecho-supino",
  "remo-para-deltoides-posterior-con-mancuernas",
  "remo-unilateral-en-polea",
  "russian-push-ups",
  "sitting-calf-stretch-dorsiflexion",
]);

async function json<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`wger respondió ${r.status} en ${url}`);
  return r.json() as Promise<T>;
}

async function descargar(): Promise<WgerExerciseInfo[]> {
  const todos: WgerExerciseInfo[] = [];
  let url: string | null = "https://wger.de/api/v2/exerciseinfo/?limit=100&format=json";
  while (url) {
    const j: { next: string | null; results: WgerExerciseInfo[] } = await json(url);
    todos.push(...j.results);
    url = j.next;
  }
  return todos;
}

async function main() {
  process.loadEnvFile(".env.local");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

  const licencias = await json<{ results: { id: number; short_name: string }[] }>("https://wger.de/api/v2/license/?format=json");
  const nombreLicencia = new Map(licencias.results.map((l) => [l.id, l.short_name]));
  const porId = new Map((await descargar()).map((e) => [String(e.id), e]));

  const { data: ejercicios, error } = await db.from("exercises").select("id, slug, source_id").eq("source", "wger");
  if (error) throw error;
  await mkdir(CARPETA, { recursive: true });

  let fotos = 0;
  let ingles = 0;
  for (const ej of ejercicios) {
    const crudo = porId.get(ej.source_id);
    if (!crudo) continue;
    const cambios: Record<string, unknown> = {};

    const en = crudo.translations.find((t) => t.language === EN && t.name.trim());
    if (en) {
      cambios.name_en = en.name.trim();
      cambios.description_en = limpiar(en.description) || null;
      cambios.instructions_en = pasos(en.description);
      ingles++;
    }

    // Misma regla que el importador: la foto solo vale si trae licencia y autor.
    const principal = crudo.images.find((i) => i.is_main) ?? crudo.images[0];
    const licencia = principal?.license ? nombreLicencia.get(principal.license) : undefined;
    const autor = principal?.license_author?.trim();
    if (principal && licencia && autor && !FOTOS_EXCLUIDAS.has(ej.slug)) {
      fotos++;
      if (!dryRun) {
        const r = await fetch(principal.image);
        if (!r.ok) {
          console.warn(`Sin foto para ${ej.slug}: ${r.status}`);
        } else {
          // Fondo blanco: muchas son PNG transparentes y en modo oscuro no se verían.
          const webp = await sharp(Buffer.from(await r.arrayBuffer()))
            .flatten({ background: "#ffffff" })
            .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 78 })
            .toBuffer();
          await writeFile(`${CARPETA}/${ej.slug}.webp`, webp);
          Object.assign(cambios, {
            image_url: `/img/ejercicios/${ej.slug}.webp`,
            image_author: autor,
            image_license: licencia,
            image_source: principal.image,
          });
        }
      }
    } else if (!dryRun) {
      Object.assign(cambios, { image_url: null, image_author: null, image_license: null, image_source: null });
    }

    if (!dryRun && Object.keys(cambios).length) {
      const { error: e } = await db.from("exercises").update(cambios).eq("id", ej.id);
      if (e) throw new Error(`${ej.slug}: ${e.message}`);
    }
  }
  console.log(`Ejercicios: ${ejercicios.length} · con foto: ${fotos} · con inglés: ${ingles}${dryRun ? " (sin escribir)" : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
