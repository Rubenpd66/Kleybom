import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FiltrosEnVivo from "@/components/search/FiltrosEnVivo";
import { Suspense } from "react";
import { imagenDeAlimento } from "@/lib/foods/imagen";
import { formatNutriente } from "@/lib/foods/format";
import { FOODS_PAGE_SIZE, searchFoods } from "@/lib/foods/queries";
import CargandoLista from "@/components/layout/CargandoLista";
import { es } from "@/lib/i18n/es";

const t = es.alimentos;

export const metadata: Metadata = { title: `${t.titulo} — ${es.marca}`, description: t.descripcion };

type Params = Promise<Record<string, string | string[] | undefined>>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

function enlace(q: string, pagina: number) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (pagina > 1) p.set("page", String(pagina));
  const qs = p.toString();
  return qs ? `/alimentos?${qs}` : "/alimentos";
}

async function Contenido({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const q = uno(sp.q).slice(0, 80);
  const pagina = Math.max(1, Math.floor(Number(uno(sp.page))) || 1);
  const { items, total } = await searchFoods(q, pagina);
  const paginas = Math.max(1, Math.ceil(total / FOODS_PAGE_SIZE));

  return (
    <>
      <FiltrosEnVivo etiqueta={t.titulo} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm font-bold">
          {t.buscarEtiqueta}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t.buscarEjemplo}
            autoComplete="off"
            className="h-11 w-full rounded-xl border-[1.5px] border-linea bg-papel/80 px-3 font-normal backdrop-blur-sm focus:border-temple"
          />
        </label>
        <button type="submit" className="solo-sin-js h-11 rounded-xl bg-hierro px-6 font-bold text-tiza">
          {t.buscar}
        </button>
      </FiltrosEnVivo>
      <p className="mt-4 text-sm">
        <Link href="/alimentos/codigo" className="font-bold text-azul underline">
          {t.codigoBuscar}
        </Link>
      </p>

      <p className="mt-8 text-sm text-acero" aria-live="polite">
        {t.resultados(total)}
      </p>
      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-linea bg-papel p-6">
          <p>{t.vacio}</p>
        </div>
      ) : (
        <ul aria-label={t.listaEtiqueta} className="mt-4 flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
          {items.map((a) => {
            const img = imagenDeAlimento(a.name_en, a.category);
            return (
              <li key={a.id} className="flex items-center gap-4 p-3 sm:p-4">
                {img && <Image src={img.src} alt="" width={64} height={48} className="h-12 w-16 shrink-0 rounded-md object-cover" />}
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <Link href={`/alimentos/${a.slug}`} className="font-bold text-azul underline">
                    {a.name_es}
                  </Link>
                  <span className="shrink-0 text-sm text-acero">
                    {formatNutriente(a.kcal, "kcal")} {t.porCien}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {(pagina > 1 || pagina < paginas) && (
        <nav aria-label="Paginación" className="mt-8 flex items-center justify-between gap-4">
          {pagina > 1 ? (
            <Link href={enlace(q, pagina - 1)} className="font-bold text-azul underline">
              {t.anterior}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-acero">{t.pagina(pagina, paginas)}</span>
          {pagina < paginas ? (
            <Link href={enlace(q, pagina + 1)} className="font-bold text-azul underline">
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

export default function AlimentosPage(props: PageProps<"/alimentos">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <Suspense fallback={<CargandoLista />}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
