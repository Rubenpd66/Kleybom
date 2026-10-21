import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import ExerciseDetail from "@/components/exercises/ExerciseDetail";
import { getExerciseBySlug } from "@/lib/exercises/queries";
import { es } from "@/lib/i18n/es";

const obtener = cache((slug: string) => getExerciseBySlug(slug));

export async function generateMetadata(props: PageProps<"/ejercicios/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const e = await obtener(slug);
  if (!e) return { title: `${es.ficha.noEncontradoTitulo} — ${es.marca}` };
  const descripcion = e.description_es?.slice(0, 155) || es.ejercicios.descripcion;
  return { title: `${e.name_es} — ${es.marca}`, description: descripcion };
}

async function Contenido({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ejercicio = await obtener(slug);
  if (!ejercicio) notFound();
  return <ExerciseDetail ejercicio={ejercicio} />;
}

export default function FichaPage(props: PageProps<"/ejercicios/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <Suspense fallback={<p className="text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido params={props.params} />
      </Suspense>
    </main>
  );
}
