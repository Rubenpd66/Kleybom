import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { Suspense } from "react";
import BodyMap from "@/components/exercises/BodyMap";
import ExerciseCard from "@/components/exercises/ExerciseCard";
import ExerciseFilters from "@/components/exercises/ExerciseFilters";
import {
  PAGE_SIZE,
  listCatalog,
  listExercises,
  type ExerciseFilters as Filtros,
  type Level,
} from "@/lib/exercises/queries";
import CargandoLista from "@/components/layout/CargandoLista";
import { getIdioma, getT } from "@/lib/i18n/servidor";

const NIVELES: Level[] = ["principiante", "intermedio", "avanzado"];

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.ejercicios.titulo} — ${es.marca}`, description: es.ejercicios.descripcion };
}

function uno(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() || undefined;
}

function enlace(filtros: Filtros, pagina: number): string {
  const p = new URLSearchParams();
  if (filtros.q) p.set("q", filtros.q);
  if (filtros.muscle) p.set("muscle", filtros.muscle);
  if (filtros.equipment) p.set("equipment", filtros.equipment);
  if (filtros.level) p.set("level", filtros.level);
  if (pagina > 1) p.set("page", String(pagina));
  const qs = p.toString();
  return qs ? `/ejercicios?${qs}` : "/ejercicios";
}

type Params = Promise<Record<string, string | string[] | undefined>>;

async function Contenido({ searchParams }: { searchParams: Params }) {
  const [sp, es, idioma] = await Promise.all([searchParams, getT(), getIdioma()]);
  const t = es.ejercicios;
  const nivel = uno(sp.level);
  const pagina = Math.max(1, Math.floor(Number(uno(sp.page))) || 1);
  const filtros: Filtros = {
    q: uno(sp.q),
    muscle: uno(sp.muscle),
    equipment: uno(sp.equipment),
    level: NIVELES.find((n) => n === nivel),
    page: pagina,
  };

  const [{ items, total }, musculos, material] = await Promise.all([
    listExercises(filtros, undefined, idioma),
    listCatalog("muscles", undefined, idioma),
    listCatalog("equipment", undefined, idioma),
  ]);
  const paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    // Escritorio: filtros y catálogo a la izquierda, el cuerpo fijo a la derecha. Móvil: filtros, cuerpo y catálogo.
    <div className="mt-8 grid items-start gap-x-8 gap-y-6 lg:grid-cols-[1fr_20rem]">
      <div className="lg:col-start-1">
        <ExerciseFilters
          // Al elegir en el mapa cambia la URL: la key rehace el formulario con los filtros nuevos.
          // No incluye el texto, para no perder el foco mientras se escribe.
          key={[filtros.muscle, filtros.equipment, filtros.level].join("|")}
          filtros={filtros}
          musculos={musculos}
          material={material}
        />
      </div>

      <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <BodyMap seleccionado={filtros.muscle} nombre={musculos.find((m) => m.slug === filtros.muscle)?.name_es} />
      </aside>

      <section aria-label={t.listaEtiqueta} className="lg:col-start-1">
        <p className="text-sm text-acero" aria-live="polite">
          {t.resultados(total)}
        </p>

        {items.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-linea bg-papel/80 p-6">
            <p>{t.vacio}</p>
            <Link href="/ejercicios" className="mt-4 inline-block font-bold text-azul underline">
              {t.quitarFiltros}
            </Link>
          </div>
        ) : (
          <ul aria-label={t.listaEtiqueta} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((e) => (
              <ExerciseCard key={e.id} ejercicio={e} />
            ))}
          </ul>
        )}

        {(pagina > 1 || pagina < paginas) && (
          <nav aria-label={es.comun.paginacion} className="mt-8 flex items-center justify-between gap-4">
            {pagina > 1 ? (
              <Link href={enlace(filtros, pagina - 1)} className="font-bold text-azul underline">
                {t.anterior}
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-acero">{t.pagina(pagina, paginas)}</span>
            {pagina < paginas ? (
              <Link href={enlace(filtros, pagina + 1)} className="font-bold text-azul underline">
                {t.siguiente}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </div>
  );
}

export default async function EjerciciosPage(props: PageProps<"/[idioma]/ejercicios">) {
  const t = (await getT()).ejercicios;
  return (
    <main className="mx-auto w-full max-w-[1520px] lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {t.titulo}
      </h1>
      <Suspense fallback={<CargandoLista />}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
