import { normalizeText } from "../../src/lib/text/normalize";

const ES = 4;
const EN = 2;

type WgerMusculo = { id: number; name: string; name_en: string };

export type WgerExerciseInfo = {
  id: number;
  license: { short_name: string } | null;
  license_author: string | null;
  muscles: WgerMusculo[];
  muscles_secondary: WgerMusculo[];
  equipment: { id: number; name: string }[];
  images: {
    image: string;
    is_main: boolean;
    license: number | null;
    license_author: string | null;
  }[];
  translations: { language: number; name: string; description: string }[];
};

export type ExerciseRow = {
  slug: string;
  name_es: string;
  description_es: string | null;
  level: "principiante" | "intermedio" | "avanzado";
  instructions_es: string[];
  tips_es: string[];
  common_mistakes_es: string[];
  image_url: string | null;
  license: string;
  author: string;
  source: "wger";
  source_id: string;
  search_text: string;
  // Solo para el importador (no son columnas de la tabla exercises):
  needs_translation: boolean;
  needs_level_review: boolean;
  muscles: { source_id: number; name: string; role: "principal" | "secundario" }[];
  equipment: { source_id: number; name: string }[];
};

const ENTIDADES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function limpiar(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|nbsp|#39);/g, (m) => ENTIDADES[m])
    .replace(/\s+/g, " ")
    .trim();
}

function pasos(html: string): string[] {
  const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => limpiar(m[1]));
  const lista = items.length
    ? items
    : [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => limpiar(m[1]));
  return lista.filter(Boolean);
}

function slugify(s: string): string {
  return normalizeText(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseWgerExercise(raw: WgerExerciseInfo): ExerciseRow | null {
  const licencia = raw.license?.short_name?.trim();
  const autor = raw.license_author?.trim();
  if (!licencia || !autor) return null;

  const es = raw.translations.find((t) => t.language === ES && t.name.trim());
  const traduccion = es ?? raw.translations.find((t) => t.language === EN && t.name.trim());
  if (!traduccion) return null;

  const nombre = traduccion.name.trim();
  const slug = slugify(nombre);
  if (!slug) return null;

  // La imagen solo se usa si tiene licencia y autoría propias.
  const principal = raw.images.find((i) => i.is_main) ?? raw.images[0];
  const imagen =
    principal && principal.license && principal.license_author?.trim()
      ? principal.image
      : null;

  const nombreMusculo = (m: WgerMusculo) => m.name_en || m.name;

  return {
    slug,
    name_es: nombre,
    description_es: limpiar(traduccion.description) || null,
    // wger no indica nivel: valor provisional hasta revisarlo.
    level: "intermedio",
    instructions_es: pasos(traduccion.description),
    tips_es: [],
    common_mistakes_es: [],
    image_url: imagen,
    license: licencia,
    author: autor,
    source: "wger",
    source_id: String(raw.id),
    search_text: normalizeText(nombre),
    needs_translation: !es,
    needs_level_review: true,
    muscles: [
      ...raw.muscles.map((m) => ({ source_id: m.id, name: nombreMusculo(m), role: "principal" as const })),
      ...raw.muscles_secondary.map((m) => ({ source_id: m.id, name: nombreMusculo(m), role: "secundario" as const })),
    ],
    equipment: raw.equipment.map((e) => ({ source_id: e.id, name: e.name })),
  };
}
