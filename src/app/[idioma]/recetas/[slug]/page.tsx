import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CreditoFoto from "@/components/content/CreditoFoto";
import CalorieBar from "@/components/foods/CalorieBar";
import NutritionTable from "@/components/foods/NutritionTable";
import { formatNutriente } from "@/lib/foods/format";
import { recetaPublica, slugsPublicos } from "@/lib/cache/publico";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { recipeNutrientsPerServing } from "@/lib/nutrition/recipe";
import { imagenDeReceta } from "@/lib/recipes/imagen";

const obtener = recetaPublica;

// Fichas generadas al compilar (el resto, en la primera visita). Los params se leen sin <Suspense>
// para que una ficha que no existe dé un 404 real.
export const instant = false;

export async function generateStaticParams() {
  return (await slugsPublicos("recipes")).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/[idioma]/recetas/[slug]">): Promise<Metadata> {
  const [{ slug }, es] = await Promise.all([props.params, getT()]);
  const t = es.recetas;
  const r = await obtener(slug);
  if (!r) return { title: `${t.noEncontradaTitulo} — ${es.marca}` };
  return { title: `${r.name_es} — ${es.marca}`, description: r.description_es ?? t.descripcion };
}

async function Contenido({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, es, idioma] = await Promise.all([params, getT(), getIdioma()]);
  const t = es.recetas;
  const r = await obtener(slug);
  if (!r || r.ingredientes.length === 0) notFound();
  const { perServing, incomplete } = recipeNutrientsPerServing(
    r.ingredientes.map((i) => ({ food: i.food, grams: i.grams })),
    r.servings,
  );
  const img = imagenDeReceta(r.slug);

  return (
    <article className="max-w-3xl">
      <Link href="/recetas" className="text-sm font-bold text-azul underline">
        {t.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{r.name_es}</h1>
      <p className="mt-4 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full border border-hierro px-3 py-0.5">{t.raciones(r.servings)}</span>
        {r.prep_minutes && <span className="rounded-full border border-hierro px-3 py-0.5">{t.minutos(r.prep_minutes)}</span>}
      </p>
      {img && (
        <div className="relative mt-6 aspect-[4/3] max-w-xl overflow-hidden rounded-xl">
          <Image src={img.src} alt={r.name_es} fill priority sizes="(min-width: 640px) 576px, 90vw" className="object-cover" />
        </div>
      )}
      {r.description_es && <p className="mt-6 max-w-[62ch]">{r.description_es}</p>}

      <section className="mt-10">
        <h2 className="font-display text-[1.7rem] font-bold">{t.ingredientes}</h2>
        <ul className="mt-3 flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
          {r.ingredientes.map((i, n) => (
            <li key={n} className="flex flex-col gap-0.5 p-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <span>
                <Link href={`/alimentos/${i.food.slug}`} className="text-azul underline">
                  {i.food.name_es}
                </Link>
                {i.note && <span className="block text-sm text-acero">{i.note}</span>}
              </span>
              <span className="shrink-0 font-bold">{formatNutriente(i.grams, "g", idioma)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[1.7rem] font-bold">{t.pasos}</h2>
        <ol aria-label={t.pasos} className="mt-3 flex max-w-[62ch] list-decimal flex-col gap-3 pl-6">
          {r.steps_es.map((p, n) => (
            <li key={n}>{p}</li>
          ))}
        </ol>
      </section>

      <NutritionTable nutrientes={perServing} titulo={t.tablaTitulo} />
      {incomplete && <p className="mt-2 text-sm text-acero">{t.incompleto}</p>}
      <div className="mt-6">
        <CalorieBar protein_g={perServing.protein_g} carbs_g={perServing.carbs_g} fat_g={perServing.fat_g} />
      </div>

      <footer className="mt-12 flex flex-col gap-2 border-t border-linea pt-4 text-sm text-acero">
        <p>{t.aviso}</p>
        <p>{t.fuente}</p>
        {img && <CreditoFoto {...img.foto} />}
      </footer>
    </article>
  );
}

export default function RecetaPage(props: PageProps<"/[idioma]/recetas/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <Contenido params={props.params} />
    </main>
  );
}
