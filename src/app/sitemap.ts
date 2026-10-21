import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { slugsPublicos } from "@/lib/cache/publico";
import { listGuides } from "@/lib/guides";
import { PAGINAS_ESTATICAS, url } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("days"); // el catálogo cambia poco: se regenera como mucho una vez al día
  const [ejercicios, rutinas, alimentos, recetas] = await Promise.all([
    slugsPublicos("exercises"),
    slugsPublicos("routines"),
    slugsPublicos("foods"),
    slugsPublicos("recipes"),
  ]);
  return [
    ...PAGINAS_ESTATICAS.map((r) => ({ url: url(r) })),
    ...listGuides().map((g) => ({ url: url(`/guias/${g.slug}`), lastModified: g.actualizada })),
    ...rutinas.map((s) => ({ url: url(`/rutinas/${s}`) })),
    ...recetas.map((s) => ({ url: url(`/recetas/${s}`) })),
    ...ejercicios.map((s) => ({ url: url(`/ejercicios/${s}`) })),
    ...alimentos.map((s) => ({ url: url(`/alimentos/${s}`) })),
  ];
}
