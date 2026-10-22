import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CalorieBar from "@/components/foods/CalorieBar";
import NutritionTable from "@/components/foods/NutritionTable";
import { esCodigoDeBarras, fetchOffProduct } from "@/lib/foods/openfoodfacts";
import { getT } from "@/lib/i18n/servidor";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.alimentos.codigoTitulo} — ${es.marca}`, robots: { index: false } };
}

type Params = Promise<Record<string, string | string[] | undefined>>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

async function Resultado({ searchParams }: { searchParams: Params }) {
  const t = (await getT()).alimentos;
  const codigo = uno((await searchParams).c).replace(/\s/g, "");
  if (!codigo) return null;
  if (!esCodigoDeBarras(codigo)) {
    return <p role="alert" className="mt-6 rounded-xl border-[1.5px] border-hierro bg-papel p-4">{t.codigoNoValido}</p>;
  }

  const r = await fetchOffProduct(codigo);
  if (!r.ok) {
    const mensaje =
      r.motivo === "no-encontrado" ? t.codigoNoEncontrado : r.motivo === "sin-nutrientes" ? t.codigoSinNutrientes : t.codigoError;
    return (
      <div role="alert" className="mt-6 rounded-xl border-[1.5px] border-hierro bg-papel p-4">
        <p>{mensaje}</p>
        <Link href="/alimentos" className="mt-3 inline-block font-bold text-azul underline">
          {t.verTodos}
        </Link>
      </div>
    );
  }

  const p = r.producto;
  return (
    <article className="mt-8 max-w-3xl">
      <h2 className="font-display text-[clamp(1.8rem,5vw,2.8rem)] font-extrabold leading-none">{p.nombre ?? t.sinNombre}</h2>
      {p.marca && (
        <p className="mt-2 text-acero">
          {t.marca}: {p.marca}
        </p>
      )}
      <NutritionTable nutrientes={p.nutrientes} />
      <section className="mt-10">
        <h3 className="font-display text-2xl font-bold">{t.repartoTitulo}</h3>
        <div className="mt-3">
          <CalorieBar protein_g={p.nutrientes.protein_g} carbs_g={p.nutrientes.carbs_g} fat_g={p.nutrientes.fat_g} />
        </div>
      </section>
      <footer className="mt-10 border-t border-linea pt-4 text-sm text-acero">
        <a
          href={`https://world.openfoodfacts.org/product/${p.codigo}`}
          className="text-azul underline"
          rel="noopener noreferrer"
        >
          {t.fuenteOff}
        </a>
      </footer>
    </article>
  );
}

export default async function CodigoPage(props: PageProps<"/[idioma]/alimentos/codigo">) {
  const es = await getT();
  const t = es.alimentos;
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <Link href="/alimentos" className="text-sm font-bold text-azul underline">
        {t.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.codigoTitulo}</h1>
      <form method="get" className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm font-bold">
          {t.codigoEtiqueta}
          <input
            name="c"
            inputMode="numeric"
            autoComplete="off"
            className="h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal"
          />
        </label>
        <button type="submit" className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza">
          {t.buscar}
        </button>
      </form>
      <p className="mt-2 text-sm text-acero">{t.codigoAyuda}</p>
      <Suspense fallback={<p className="mt-6 text-acero">{es.ejercicios.cargando}</p>}>
        <Resultado searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
