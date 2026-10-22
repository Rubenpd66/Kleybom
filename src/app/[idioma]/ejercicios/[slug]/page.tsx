import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExerciseDetail from "@/components/exercises/ExerciseDetail";
import { ejercicioPublico, slugsPublicos } from "@/lib/cache/publico";
import { getT } from "@/lib/i18n/servidor";

// Se generan al compilar las primeras fichas; el resto, en la primera visita (y quedan guardadas).
// Los params se leen sin <Suspense> para que una ficha que no existe dé un 404 real.
export const instant = false;

export async function generateStaticParams() {
  return (await slugsPublicos("exercises", 50)).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/[idioma]/ejercicios/[slug]">): Promise<Metadata> {
  const [e, es] = await Promise.all([props.params.then((p) => ejercicioPublico(p.slug)), getT()]);
  if (!e) return { title: `${es.ficha.noEncontradoTitulo} — ${es.marca}` };
  const descripcion = e.description_es?.slice(0, 155) || es.ficha.descripcionPorDefecto(e.name_es);
  return { title: `${e.name_es} — ${es.marca}`, description: descripcion, alternates: { canonical: `/ejercicios/${e.slug}` } };
}

export default async function FichaPage(props: PageProps<"/[idioma]/ejercicios/[slug]">) {
  const ejercicio = await ejercicioPublico((await props.params).slug);
  if (!ejercicio) notFound();
  return (
    <main className="mx-auto w-full lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <ExerciseDetail ejercicio={ejercicio} />
    </main>
  );
}
