import { GUIAS, type Guia } from "./content";

export type { Bloque, Guia } from "./content";

export function listGuides(): Guia[] {
  return GUIAS;
}

export function getGuideBySlug(slug: string): Guia | undefined {
  return GUIAS.find((g) => g.slug === slug);
}

// Minutos de lectura a unas 200 palabras por minuto (mínimo 1).
export function readingMinutes(guia: Guia): number {
  const textos = guia.secciones.flatMap((s) => [s.titulo, ...s.bloques.flatMap((b) => (b.tipo === "p" ? [b.texto] : b.items))]);
  const palabras = textos.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}
