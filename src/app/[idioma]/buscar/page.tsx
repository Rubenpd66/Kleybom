import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { Suspense } from "react";
import CargandoLista from "@/components/layout/CargandoLista";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { buscarEnTodo, GRUPOS, total } from "@/lib/search/global";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.buscador.titulo} — ${es.marca}`, description: es.buscador.descripcion, robots: { index: false } };
}

type Params = Promise<Record<string, string | string[] | undefined>>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

async function Resultados({ searchParams }: { searchParams: Params }) {
  const [sp, es, idioma] = await Promise.all([searchParams, getT(), getIdioma()]);
  const t = es.buscador;
  const q = uno(sp.q).slice(0, 80);

  return (
    <>
      <form action="/buscar" method="get" role="search" aria-label={t.etiqueta} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="q">
          {t.etiqueta}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={t.ejemplo}
          autoComplete="off"
          className="h-11 flex-1 rounded-xl border-[1.5px] border-linea bg-papel/80 px-3 focus:border-temple"
        />
        <button type="submit" className="h-11 rounded-xl bg-hierro px-6 font-bold text-tiza">
          {t.buscar}
        </button>
      </form>
      {await lista()}
    </>
  );

  async function lista() {
    if (q.length < 2) return <p className="mt-6 text-acero">{t.minimo}</p>;
    const r = await buscarEnTodo(q, idioma, 20);
    if (total(r) === 0) return <p className="mt-6">{t.sinResultados(q)}</p>;
    return (
      <div className="mt-8 flex flex-col gap-10">
        <h2 className="sr-only">{t.resultados(q)}</h2>
        {GRUPOS.filter((g) => r[g].length > 0).map((g) => (
          <section key={g} aria-labelledby={`grupo-${g}`}>
            <h3 id={`grupo-${g}`} className="font-display text-[1.7rem] font-bold">
              {t.grupos[g]} <span className="text-base font-normal text-acero">({r[g].length})</span>
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {r[g].map((x) => (
                <li key={x.href}>
                  <Link href={x.href} className="tarjeta-hover flex h-full items-center gap-3 rounded-xl border border-linea bg-papel p-3 hover:bg-realce">
                    {x.imagen && <Image src={x.imagen} alt="" width={48} height={36} className="h-9 w-12 shrink-0 rounded object-cover" />}
                    <span className="min-w-0">
                      <span className="block font-bold">{x.titulo}</span>
                      {x.detalle && <span className="line-clamp-2 text-sm text-acero">{x.detalle}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }
}

export default async function BuscarPage(props: PageProps<"/[idioma]/buscar">) {
  const t = (await getT()).buscador;
  return (
    <main className="mx-auto w-full lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <Suspense fallback={<CargandoLista />}>
        <Resultados searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
