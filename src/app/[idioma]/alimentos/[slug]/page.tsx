import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CreditoFoto from "@/components/content/CreditoFoto";
import { notFound } from "next/navigation";
import CalorieBar from "@/components/foods/CalorieBar";
import NutritionTable from "@/components/foods/NutritionTable";
import { imagenDeAlimento } from "@/lib/foods/imagen";
import { formatNutriente } from "@/lib/foods/format";
import { alimentoPublico, slugsPublicos } from "@/lib/cache/publico";
import { getIdioma, getT } from "@/lib/i18n/servidor";

const obtener = alimentoPublico;

// Fichas generadas al compilar (el resto, en la primera visita). Los params se leen sin <Suspense>
// para que una ficha que no existe dé un 404 real.
export const instant = false;

export async function generateStaticParams() {
  return (await slugsPublicos("foods", 50)).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/[idioma]/alimentos/[slug]">): Promise<Metadata> {
  const [{ slug }, es, idioma] = await Promise.all([props.params, getT(), getIdioma()]);
  const t = es.alimentos;
  const a = await obtener(slug);
  if (!a) return { title: `${t.noEncontradoTitulo} — ${es.marca}` };
  return {
    title: `${a.name_es} — ${es.marca}`,
    description: `${a.name_es}: ${formatNutriente(a.kcal, "kcal", idioma)} ${t.porCien}. ${t.descripcion}`,
  };
}

async function Contenido({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, es, idioma] = await Promise.all([params, getT(), getIdioma()]);
  const t = es.alimentos;
  const a = await obtener(slug);
  if (!a) notFound();
  const categoria = a.category ? (t.categorias[a.category] ?? a.category) : null;
  const img = imagenDeAlimento(a.name_en, a.category);

  return (
    <article className="max-w-3xl">
      <Link href="/alimentos" className="text-sm font-bold text-azul underline">
        {t.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{a.name_es}</h1>
      {categoria && (
        <p className="mt-4 w-fit rounded-full border border-hierro px-3 py-0.5 text-sm">{categoria}</p>
      )}

      {img && (
        <div className="relative mt-6 aspect-[4/3] max-w-md overflow-hidden rounded-xl">
          {/* Foto del tipo de alimento (no de este alimento exacto): decorativa. */}
          <Image src={img.src} alt="" fill priority sizes="(min-width: 640px) 448px, 90vw" className="object-cover" />
        </div>
      )}

      <NutritionTable nutrientes={a} />

      <section className="mt-10">
        <h2 className="font-display text-[1.7rem] font-bold">{t.repartoTitulo}</h2>
        <div className="mt-3">
          <CalorieBar protein_g={a.protein_g} carbs_g={a.carbs_g} fat_g={a.fat_g} />
        </div>
      </section>

      <footer className="mt-12 flex flex-col gap-2 border-t border-linea pt-4 text-sm text-acero">
        <p>{t.aviso}</p>
        {/* En español se muestra también el nombre original de USDA (en inglés ya es el título). */}
        {idioma === "es" && a.name_en && (
          <p>
            {t.nombreOriginal}: <span lang="en">{a.name_en}</span>
          </p>
        )}
        {img && <CreditoFoto {...img.foto} />}
        {a.source === "usda" && (
          <p>
            <a href="https://fdc.nal.usda.gov/" className="text-azul underline" rel="noopener noreferrer">
              {t.fuenteUsda}
            </a>
          </p>
        )}
      </footer>
    </article>
  );
}

export default function AlimentoPage(props: PageProps<"/[idioma]/alimentos/[slug]">) {
  return (
    <main className="mx-auto w-full lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <Contenido params={props.params} />
    </main>
  );
}
