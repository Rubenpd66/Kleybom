// Buscador de toda la web: secciones, ejercicios, rutinas, recetas, guías y alimentos, en el idioma pedido.
// Los datos son públicos: se leen con el cliente anónimo (sirve igual desde una acción o una página).
import { listExercises } from "@/lib/exercises/queries";
import { imagenDeAlimento } from "@/lib/foods/imagen";
import { searchFoods } from "@/lib/foods/queries";
import { listGuides } from "@/lib/guides";
import { diccionario, type Idioma } from "@/lib/i18n";
import { listRecipes } from "@/lib/recipes/queries";
import { listRoutines } from "@/lib/routines/queries";
import { createPublicClient } from "@/lib/supabase/public";
import { coincide, ordenarPorParecido } from "./coincide";
import { GRUPOS, type Resultados } from "./tipos";

export { GRUPOS, type Resultados } from "./tipos";

export const vacio = (): Resultados => ({ secciones: [], ejercicios: [], rutinas: [], recetas: [], guias: [], alimentos: [] });

export async function buscarEnTodo(busqueda: string, idioma: Idioma, limite: number): Promise<Resultados> {
  const q = busqueda.trim().slice(0, 80);
  if (q.length < 2) return vacio();
  const t = diccionario(idioma);
  const db = createPublicClient();

  // Secciones: el menú completo, más Mi panel y las páginas legales.
  const paginas = [
    { href: "/panel", label: t.nav.miPanel },
    ...t.nav.secciones,
    ...t.footer.enlaces,
  ];
  const secciones = ordenarPorParecido(paginas.filter((p) => coincide(p.label, q)), (p) => p.label, q)
    .slice(0, limite)
    .map((p) => ({ href: p.href, titulo: p.label }));

  const guias = ordenarPorParecido(
    listGuides(idioma).filter((g) => coincide(`${g.titulo} ${g.resumen}`, q)),
    (g) => g.titulo,
    q,
  )
    .slice(0, limite)
    .map((g) => ({ href: `/guias/${g.slug}`, titulo: g.titulo, detalle: g.resumen }));

  const [ejercicios, rutinas, recetas, alimentos] = await Promise.all([
    listExercises({ q }, db, idioma),
    listRoutines({}, db, idioma),
    listRecipes(db, idioma),
    searchFoods(q, 1, db, idioma),
  ]);

  return {
    secciones,
    guias,
    ejercicios: ordenarPorParecido(ejercicios.items, (e) => e.name_es, q)
      .slice(0, limite)
      .map((e) => ({ href: `/ejercicios/${e.slug}`, titulo: e.name_es, detalle: t.ejercicios.niveles[e.level] })),
    rutinas: rutinas
      .filter((r) => coincide(r.name, q))
      .slice(0, limite)
      .map((r) => ({ href: `/rutinas/${r.slug}`, titulo: r.name, detalle: t.rutinas.dias(r.days_per_week) })),
    recetas: ordenarPorParecido(recetas.filter((r) => coincide(`${r.name_es} ${r.description_es ?? ""}`, q)), (r) => r.name_es, q)
      .slice(0, limite)
      .map((r) => ({ href: `/recetas/${r.slug}`, titulo: r.name_es, detalle: t.recetas.raciones(r.servings) })),
    alimentos: alimentos.items.slice(0, limite).map((a) => ({
      href: `/alimentos/${a.slug}`,
      titulo: a.name_es,
      imagen: imagenDeAlimento(a.name_en, a.category)?.src ?? null,
    })),
  };
}

export const total = (r: Resultados) => GRUPOS.reduce((n, g) => n + r[g].length, 0);
