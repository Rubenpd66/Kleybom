import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { slugsPublicos } from "@/lib/cache/publico";
import { listGuides } from "@/lib/guides";
import { conIdioma } from "@/lib/i18n/ruta";
import { ENLACE_DONACIONES } from "@/lib/donaciones";
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
  // Cada página va dos veces (español e inglés), y cada una dice cuál es su versión en el otro idioma (hreflang).
  const bilingue = (ruta: string, lastModified?: string): MetadataRoute.Sitemap =>
    (["es", "en"] as const).map((idioma) => ({
      url: url(conIdioma(idioma, ruta)),
      ...(lastModified && { lastModified }),
      alternates: { languages: { es: url(ruta), en: url(conIdioma("en", ruta)), "x-default": url(ruta) } },
    }));
  return [
    ...[...PAGINAS_ESTATICAS, ...(ENLACE_DONACIONES ? ["/apoya"] : [])].flatMap((r) => bilingue(r)),
    ...listGuides().flatMap((g) => bilingue(`/guias/${g.slug}`, g.actualizada)),
    ...rutinas.flatMap((s) => bilingue(`/rutinas/${s}`)),
    ...recetas.flatMap((s) => bilingue(`/recetas/${s}`)),
    ...ejercicios.flatMap((s) => bilingue(`/ejercicios/${s}`)),
    ...alimentos.flatMap((s) => bilingue(`/alimentos/${s}`)),
  ];
}
