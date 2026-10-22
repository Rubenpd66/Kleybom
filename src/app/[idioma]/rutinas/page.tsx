import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { Suspense } from "react";
import RoutineCard from "@/components/routines/RoutineCard";
import RoutineFilters from "@/components/routines/RoutineFilters";
import CargandoLista from "@/components/layout/CargandoLista";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { listRoutines, type RoutineFilters as Filtros } from "@/lib/routines/queries";
import { GOALS, LEVELS } from "@/lib/routines/validate";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.rutinas.titulo} — ${es.marca}`, description: es.rutinas.descripcion };
}

type Params = Promise<Record<string, string | string[] | undefined>>;

function uno(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() || undefined;
}

async function Contenido({ searchParams }: { searchParams: Params }) {
  const [sp, es, idioma] = await Promise.all([searchParams, getT(), getIdioma()]);
  const t = es.rutinas;
  const goal = uno(sp.goal);
  const level = uno(sp.level);
  const filtros: Filtros = {
    goal: GOALS.find((g) => g === goal),
    level: LEVELS.find((l) => l === level),
  };
  const rutinas = await listRoutines(filtros, undefined, idioma);

  return (
    <>
      <div className="mt-8">
        <RoutineFilters filtros={filtros} />
      </div>
      <p className="mt-8 text-sm text-acero" aria-live="polite">
        {t.resultados(rutinas.length)}
      </p>
      {rutinas.length === 0 ? (
        <div className="mt-4 rounded-xl border border-linea bg-papel p-6">
          <p>{t.vacio}</p>
          <Link href="/rutinas" className="mt-4 inline-block font-bold text-azul underline">
            {t.quitarFiltros}
          </Link>
        </div>
      ) : (
        <ul aria-label={t.listaEtiqueta} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rutinas.map((r) => (
            <RoutineCard key={r.id} rutina={r} />
          ))}
        </ul>
      )}
    </>
  );
}

export default async function RutinasPage(props: PageProps<"/[idioma]/rutinas">) {
  const es = await getT();
  const t = es.rutinas;
  return (
    <main className="mx-auto w-full lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {t.titulo}
      </h1>
      <p className="mt-3">
        <Link href="/rutinas/nueva" className="font-bold text-azul underline">
          {es.constructor.crear}
        </Link>
      </p>
      <Suspense fallback={<CargandoLista />}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
