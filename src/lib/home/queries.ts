import { cacheLife } from "next/cache";
import { getExerciseBySlug, type ExerciseDetail } from "@/lib/exercises/queries";
import { getFoodBySlug, type FoodDetail } from "@/lib/foods/queries";
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

export const EJERCICIO_EJEMPLO = "press-de-banca-con-mancuernas";
export const ALIMENTO_EJEMPLO = "platanos-crudos-173944";

export type EjercicioBreve = { slug: string; name_es: string; principales: string[] };
export type GrupoPortada = { clave: string; nombre: string; musculo: string; ejercicios: EjercicioBreve[] };
export type DatosPortada = { grupos: GrupoPortada[]; ejemplo: ExerciseDetail | null; alimento: FoodDetail | null };

const SELECCION: string = "slug, name_es, exercise_muscles(role, muscles(name_es))";
type Fila = { slug: string; name_es: string; exercise_muscles: { role: string; muscles: { name_es: string } | null }[] };

// Datos públicos que cambian poco: se guardan en caché un día.
export async function getHomeData(): Promise<DatosPortada> {
  "use cache";
  cacheLife("days");
  const db = createPublicClient();
  const todos = GRUPOS.flatMap((g) => g.slugs);
  const [{ data, error }, ejemplo, alimento] = await Promise.all([
    db.from("exercises").select(SELECCION).in("slug", todos),
    getExerciseBySlug(EJERCICIO_EJEMPLO, db),
    getFoodBySlug(ALIMENTO_EJEMPLO, db),
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
  return { grupos, ejemplo, alimento };
}
