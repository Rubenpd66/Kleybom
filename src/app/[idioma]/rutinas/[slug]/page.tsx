import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/routines/PrintButton";
import { rutinaPublica, slugsPublicos } from "@/lib/cache/publico";
import { getT } from "@/lib/i18n/servidor";
import { formatearSeries } from "@/lib/routines/format";
import "./print.css";

const obtener = rutinaPublica;

// Fichas generadas al compilar (el resto, en la primera visita). Los params se leen sin <Suspense>
// para que una ficha que no existe dé un 404 real.
export const instant = false;

export async function generateStaticParams() {
  return (await slugsPublicos("routines")).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/[idioma]/rutinas/[slug]">): Promise<Metadata> {
  const [{ slug }, es] = await Promise.all([props.params, getT()]);
  const t = es.rutinas;
  const r = await obtener(slug);
  if (!r) return { title: `${t.noEncontradaTitulo} — ${es.marca}` };
  return {
    title: `${r.name} — ${es.marca}`,
    description: r.description?.split("\n")[0]?.slice(0, 155) || t.descripcion,
  };
}

async function Contenido({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, es] = await Promise.all([params, getT()]);
  const t = es.rutinas;
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
        <span className="rounded-full bg-temple px-3 py-0.5 text-sm font-medium text-tinta">
          {t.objetivos[r.goal]}
        </span>
        <span className="rounded-full border border-hierro px-3 py-0.5 text-sm">{t.niveles[r.level]}</span>
        <span className="text-sm text-acero">{t.dias(r.days_per_week)}</span>
      </p>
      <div className="mt-4">
        <PrintButton />
      </div>
      {r.description && (
        <p className="mt-6 max-w-[62ch] whitespace-pre-line">{r.description}</p>
      )}

      {r.dias.length === 0 ? (
        <p className="mt-10 text-acero">{t.sinEjercicios}</p>
      ) : (
        r.dias.map((d) => (
          <section key={d.dia} className="mt-10">
            <h2 className="font-display text-[1.7rem] font-bold">{t.dia(d.dia)}</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-linea bg-papel">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-linea">
                    <th scope="col" className="p-3 font-bold">
                      {t.columnaEjercicio}
                    </th>
                    <th scope="col" className="p-3 font-bold">
                      {t.columnaSeries}
                    </th>
                    <th scope="col" className="p-3 font-bold">
                      {t.columnaDescanso}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linea">
                  {d.ejercicios.map((e, i) => (
                    <tr key={`${d.dia}-${i}`}>
                      <td className="p-3">
                        <Link href={`/ejercicios/${e.exercise.slug}`} className="font-bold text-azul underline">
                          {e.exercise.name_es}
                        </Link>
                        {e.notes && <span className="mt-1 block text-acero">{e.notes}</span>}
                      </td>
                      <td className="p-3 whitespace-nowrap">{formatearSeries(e.sets, e.reps_min, e.reps_max, es.entreno.series)}</td>
                      <td className="p-3 whitespace-nowrap">{e.rest_seconds} s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </article>
  );
}

export default function RutinaPage(props: PageProps<"/[idioma]/rutinas/[slug]">) {
  return (
    <main className="mx-auto w-full lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <Contenido params={props.params} />
    </main>
  );
}
