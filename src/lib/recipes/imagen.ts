// Foto de cada receta (Wikimedia Commons, con su autoría en ./imagenes.json). Clave: el slug de la receta.
import type { Foto } from "@/lib/foods/imagen";
import FOTOS from "./imagenes.json" with { type: "json" };

const fotos = FOTOS as Record<string, Foto>;

export function imagenDeReceta(slug: string): { src: string; foto: Foto } | null {
  const foto = fotos[slug];
  return foto ? { src: `/img/recetas/${slug}.webp`, foto } : null;
}
