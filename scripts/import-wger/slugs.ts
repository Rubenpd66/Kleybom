// Si dos ejercicios dan el mismo slug, el segundo y siguientes llevan su source_id al final.
export function uniqueSlugs<T extends { slug: string; source_id: string }>(rows: T[]): T[] {
  const usados = new Set<string>();
  return rows.map((r) => {
    let slug = r.slug;
    if (usados.has(slug)) slug = `${r.slug}-${r.source_id}`;
    usados.add(slug);
    return { ...r, slug };
  });
}
