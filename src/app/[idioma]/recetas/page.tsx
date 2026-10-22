import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import CargandoLista from "@/components/layout/CargandoLista";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { imagenDeReceta } from "@/lib/recipes/imagen";
import { listRecipes } from "@/lib/recipes/queries";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.recetas.titulo} — ${es.marca}`, description: es.recetas.descripcion };
}

async function Lista() {
  const [es, idioma] = await Promise.all([getT(), getIdioma()]);
  const t = es.recetas;
  const recetas = await listRecipes(undefined, idioma);
  return (
    <ul aria-label={t.listaEtiqueta} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recetas.map((r, n) => {
        const img = imagenDeReceta(r.slug);
        return (
          <li key={r.id} className="rounded-xl border border-linea bg-papel">
            <Link href={`/recetas/${r.slug}`} className="flex h-full flex-col gap-2 p-4 tarjeta-hover hover:bg-realce">
              {img && (
                <span className="relative mb-1 block aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    priority={n < 3}
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                  />
                </span>
              )}
              <span className="font-display text-2xl font-bold leading-tight">{r.name_es}</span>
              {r.description_es && <span className="text-sm text-acero">{r.description_es}</span>}
              <span className="mt-auto flex flex-wrap gap-2 pt-2 text-sm">
                <span className="rounded-full border border-hierro px-3 py-0.5">{t.raciones(r.servings)}</span>
                {r.prep_minutes && (
                  <span className="rounded-full border border-hierro px-3 py-0.5">{t.minutos(r.prep_minutes)}</span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function RecetasPage() {
  const t = (await getT()).recetas;
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <Suspense fallback={<CargandoLista />}>
        <Lista />
      </Suspense>
    </main>
  );
}
