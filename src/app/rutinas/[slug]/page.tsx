import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { es } from "@/lib/i18n/es";
import { formatearSeries } from "@/lib/routines/format";
import { getRoutineBySlug } from "@/lib/routines/queries";

const t = es.rutinas;
const obtener = cache((slug: string) => getRoutineBySlug(slug));

export async function generateMetadata(props: PageProps<"/rutinas/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const r = await obtener(slug);
  if (!r) return { title: `${t.noEncontradaTitulo} — ${es.marca}` };
  return {
    title: `${r.name} — ${es.marca}`,
    description: r.description?.split("\n")[0]?.slice(0, 155) || t.descripcion,
  };
}

async function Contenido({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await obtener(slug);
  if (!r) notFound();

  return (
    <article>
      <Link href="/rutinas" className="text-sm font-bold text-azul underline">
        {t.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {r.name}
      </h1>
      <p className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-temple px-3 py-0.5 text-sm font-medium text-hierro">
          {t.objetivos[r.goal]}
        </span>
        <span className="rounded-full border border-hierro px-3 py-0.5 text-sm">{t.niveles[r.level]}</span>
        <span className="text-sm text-acero">{t.dias(r.days_per_week)}</span>
      </p>
      {r.description && (
        <p className="mt-6 max-w-[62ch] whitespace-pre-line">{r.description}</p>
      )}

      {r.dias.length === 0 ? (
        <p className="mt-10 text-acero">{t.sinEjercicios}</p>
      ) : (
        r.dias.map((d) => (
          <section key={d.dia} className="mt-10">
            <h2 className="font-display text-[1.7rem] font-bold">{t.dia(d.dia)}</h2>
            <ul className="mt-3 flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
              {d.ejercicios.map((e) => (
                <li key={e.exercise.slug} className="flex flex-col gap-1 p-4">
                  <Link href={`/ejercicios/${e.exercise.slug}`} className="font-bold text-azul underline">
                    {e.exercise.name_es}
                  </Link>
                  <span className="text-sm">
                    {formatearSeries(e.sets, e.reps_min, e.reps_max)} · {t.descanso(e.rest_seconds)}
                  </span>
                  {e.notes && <span className="text-sm text-acero">{e.notes}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </article>
  );
}

export default function RutinaPage(props: PageProps<"/rutinas/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <Suspense fallback={<p className="text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido params={props.params} />
      </Suspense>
    </main>
  );
}
