import { cacheLife } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Ejercicios del selector de la portada: elegidos entre los que usan las rutinas plantilla
// (nombres en español y conocidos). El músculo es el del filtro de /ejercicios.
export const GRUPOS = [
  { clave: "pecho", nombre: "Pecho", musculo: "pectoral", slugs: ["press-de-banca-con-mancuernas", "press-de-banca", "flexiones-de-rodillas"] },
  { clave: "espalda", nombre: "Espalda", musculo: "dorsal-ancho", slugs: ["dominadas", "remo-con-mancuernas", "jalon-al-pecho"] },
  { clave: "piernas", nombre: "Piernas", musculo: "cuadriceps", slugs: ["sentadillas", "prensa-de-piernas", "zancadas-con-mancuernas"] },
  { clave: "hombros", nombre: "Hombros", musculo: "deltoides-anterior", slugs: ["press-militar-mancuerna", "press-de-hombros-con-barra", "face-pull-inclinado-con-mancuernas"] },
  { clave: "brazos", nombre: "Brazos", musculo: "biceps", slugs: ["curl-con-barra", "curl-con-mancuerna", "fondos-en-paralelas"] },
  { clave: "abdomen", nombre: "Abdomen", musculo: "abdominales", slugs: ["plancha-frontal", "abdominales", "bird-dog"] },
] as const;

export type EjercicioBreve = { slug: string; name_es: string; principales: string[] };
export type GrupoPortada = { clave: string; nombre: string; musculo: string; ejercicios: EjercicioBreve[] };
export type Cifras = { ejercicios: number; alimentos: number; rutinas: number; recetas: number };
export type DatosPortada = { grupos: GrupoPortada[]; cifras: Cifras };

const SELECCION: string = "slug, name_es, exercise_muscles(role, muscles(name_es))";
type Fila = { slug: string; name_es: string; exercise_muscles: { role: string; muscles: { name_es: string } | null }[] };

// Datos públicos que cambian poco: se guardan en caché un día.
export async function getHomeData(): Promise<DatosPortada> {
  "use cache";
  cacheLife("days");
  const db = createPublicClient();
  const todos = GRUPOS.flatMap((g) => g.slugs);
  const contar = (tabla: string) => db.from(tabla).select("id", { count: "exact", head: true });
  const [{ data, error }, ejercicios, alimentos, rutinas, recetas] = await Promise.all([
    db.from("exercises").select(SELECCION).in("slug", todos),
    contar("exercises"),
    contar("foods"),
    db.from("routines").select("id", { count: "exact", head: true }).is("owner_id", null),
    contar("recipes"),
  ]);
  if (error) throw error;
  const porSlug = new Map((data as unknown as Fila[]).map((f) => [f.slug, f]));

  const grupos = GRUPOS.map((g) => ({
    clave: g.clave,
    nombre: g.nombre,
    musculo: g.musculo,
    // Si un ejercicio deja de existir en el catálogo, simplemente no se muestra.
    ejercicios: g.slugs.flatMap((s) => {
      const f = porSlug.get(s);
      if (!f) return [];
      const principales = f.exercise_muscles.filter((m) => m.role === "principal" && m.muscles).map((m) => m.muscles!.name_es);
      return [{ slug: f.slug, name_es: f.name_es, principales }];
    }),
  }));
  const cifras = { ejercicios: ejercicios.count ?? 0, alimentos: alimentos.count ?? 0, rutinas: rutinas.count ?? 0, recetas: recetas.count ?? 0 };
  return { grupos, cifras };
}
