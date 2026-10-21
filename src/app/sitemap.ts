import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { listGuides } from "@/lib/guides";
import { PAGINAS_ESTATICAS, url } from "@/lib/seo/site";

const POR_PAGINA = 1000; // máximo de filas que devuelve Supabase por consulta

// Todos los slugs públicos de una tabla, en tandas de 1000.
async function slugs(tabla: "exercises" | "routines" | "foods" | "recipes"): Promise<string[]> {
  // Cliente público sin cookies: solo ve lo que ve un visitante anónimo.
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
  const todos: string[] = [];
  for (let desde = 0; ; desde += POR_PAGINA) {
    let consulta = db.from(tabla).select("slug").order("id").range(desde, desde + POR_PAGINA - 1);
    if (tabla === "routines") consulta = consulta.is("owner_id", null);
    const { data, error } = await consulta;
    if (error) throw new Error(`sitemap: no se pudo leer ${tabla}: ${error.message}`);
    todos.push(...data.map((f) => f.slug as string).filter(Boolean));
    if (data.length < POR_PAGINA) return todos;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("days"); // el catálogo cambia poco: se regenera como mucho una vez al día
  const [ejercicios, rutinas, alimentos, recetas] = await Promise.all([
    slugs("exercises"),
    slugs("routines"),
    slugs("foods"),
    slugs("recipes"),
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
