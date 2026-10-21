import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import CalorieBar from "@/components/foods/CalorieBar";
import NutritionTable from "@/components/foods/NutritionTable";
import { formatNutriente } from "@/lib/foods/format";
import { getFoodBySlug } from "@/lib/foods/queries";
import { es } from "@/lib/i18n/es";

const t = es.alimentos;
const obtener = cache((slug: string) => getFoodBySlug(slug));

export async function generateMetadata(props: PageProps<"/alimentos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const a = await obtener(slug);
  if (!a) return { title: `${t.noEncontradoTitulo} — ${es.marca}` };
  return {
    title: `${a.name_es} — ${es.marca}`,
    description: `${a.name_es}: ${formatNutriente(a.kcal, "kcal")} ${t.porCien}. ${t.descripcion}`,
  };
}

async function Contenido({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await obtener(slug);
  if (!a) notFound();
  const categoria = a.category ? (t.categorias[a.category] ?? a.category) : null;

  return (
    <article className="max-w-3xl">
      <Link href="/alimentos" className="text-sm font-bold text-azul underline">
        {t.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{a.name_es}</h1>
      {categoria && (
        <p className="mt-4 w-fit rounded-full border border-hierro px-3 py-0.5 text-sm">{categoria}</p>
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
        {a.name_en && (
          <p>
            {t.nombreOriginal}: <span lang="en">{a.name_en}</span>
          </p>
        )}
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

export default function AlimentoPage(props: PageProps<"/alimentos/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <Suspense fallback={<p className="text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido params={props.params} />
      </Suspense>
    </main>
  );
}
