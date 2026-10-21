import type { Metadata } from "next";
import Link from "next/link";
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
import { es } from "@/lib/i18n/es";

const t = es.ejercicios;
const NIVELES: Level[] = ["principiante", "intermedio", "avanzado"];

export const metadata: Metadata = {
  title: `${t.titulo} — ${es.marca}`,
  description: t.descripcion,
};

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
  const sp = await searchParams;
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
    listExercises(filtros),
    listCatalog("muscles"),
    listCatalog("equipment"),
  ]);
  const paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <ExerciseFilters
          // Al elegir en el mapa cambia la URL sin recargar: la key rehace el formulario con los filtros nuevos.
          key={JSON.stringify(filtros)}
          filtros={filtros}
          musculos={musculos}
          material={material}
        />
        <BodyMap
          seleccionado={filtros.muscle}
          nombre={musculos.find((m) => m.slug === filtros.muscle)?.name_es}
        />
      </div>

      <p className="mt-8 text-sm text-acero" aria-live="polite">
        {t.resultados(total)}
      </p>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-linea bg-papel p-6">
          <p>{t.vacio}</p>
          <Link
            href="/ejercicios"
            className="mt-4 inline-block font-bold text-azul underline"
          >
            {t.quitarFiltros}
          </Link>
        </div>
      ) : (
        <ul
          aria-label={t.listaEtiqueta}
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((e) => (
            <ExerciseCard key={e.id} ejercicio={e} />
          ))}
        </ul>
      )}

      {(pagina > 1 || pagina < paginas) && (
        <nav
          aria-label="Paginación"
          className="mt-8 flex items-center justify-between gap-4"
        >
          {pagina > 1 ? (
            <Link
              href={enlace(filtros, pagina - 1)}
              className="font-bold text-azul underline"
            >
              {t.anterior}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-acero">
            {t.pagina(pagina, paginas)}
          </span>
          {pagina < paginas ? (
            <Link
              href={enlace(filtros, pagina + 1)}
              className="font-bold text-azul underline"
            >
              {t.siguiente}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

export default function EjerciciosPage(props: PageProps<"/ejercicios">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {t.titulo}
      </h1>
      <p className="mt-3 max-w-[62ch] text-acero">{t.descripcion}</p>
      <Suspense fallback={<CargandoLista />}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
