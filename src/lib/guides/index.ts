import type { Idioma } from "@/lib/i18n";
import { GUIAS, type Guia } from "./content";
import { GUIAS_EN } from "./content-en";

export type { Bloque, Guia } from "./content";

const POR_IDIOMA: Record<Idioma, Guia[]> = { es: GUIAS, en: GUIAS_EN };

export function listGuides(idioma: Idioma = "es"): Guia[] {
  return POR_IDIOMA[idioma];
}

export function getGuideBySlug(slug: string, idioma: Idioma = "es"): Guia | undefined {
  return POR_IDIOMA[idioma].find((g) => g.slug === slug);
}

// Minutos de lectura a unas 200 palabras por minuto (mínimo 1).
export function readingMinutes(guia: Guia): number {
  const textos = guia.secciones.flatMap((s) => [s.titulo, ...s.bloques.flatMap((b) => (b.tipo === "p" ? [b.texto] : b.items))]);
  const palabras = textos.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}
