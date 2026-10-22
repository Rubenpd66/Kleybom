import { normalizeText } from "@/lib/text/normalize";

// ¿Aparecen todas las palabras de la búsqueda en el texto? Sin tildes ni mayúsculas y en cualquier orden:
// "banca press" encuentra "Press de banca".
export function coincide(texto: string, busqueda: string): boolean {
  const palabras = normalizeText(busqueda).split(" ").filter(Boolean);
  if (palabras.length === 0) return false;
  const t = normalizeText(texto);
  return palabras.every((p) => t.includes(p));
}

// Las que empiezan por la búsqueda van primero ("arroz" antes que "pudin de arroz").
export function ordenarPorParecido<T>(lista: T[], texto: (x: T) => string, busqueda: string): T[] {
  const q = normalizeText(busqueda);
  const peso = (x: T) => (normalizeText(texto(x)).startsWith(q) ? 0 : 1);
  return [...lista].sort((a, b) => peso(a) - peso(b));
}
