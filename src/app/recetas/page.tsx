import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { es } from "@/lib/i18n/es";
import { listRecipes } from "@/lib/recipes/queries";

const t = es.recetas;

export const metadata: Metadata = { title: `${t.titulo} — ${es.marca}`, description: t.descripcion };

async function Lista() {
  const recetas = await listRecipes();
  return (
    <ul aria-label={t.listaEtiqueta} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recetas.map((r) => (
        <li key={r.id} className="rounded-xl border border-linea bg-papel">
          <Link href={`/recetas/${r.slug}`} className="flex h-full flex-col gap-2 p-4 tarjeta-hover hover:bg-white">
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
      ))}
    </ul>
  );
}

export default function RecetasPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <p className="mt-3 max-w-[62ch] text-acero">{t.descripcion}</p>
      <Suspense fallback={<p className="mt-8 text-acero">{es.ejercicios.cargando}</p>}>
        <Lista />
      </Suspense>
    </main>
  );
}
