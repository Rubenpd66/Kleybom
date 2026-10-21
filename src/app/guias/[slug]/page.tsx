import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideBySlug, listGuides, readingMinutes } from "@/lib/guides";
import { es } from "@/lib/i18n/es";
import { articleLd, jsonLd } from "@/lib/seo/site";

const t = es.guias;
const fecha = (iso: string) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

// Todas las guías se generan al compilar; una dirección desconocida da 404.
// Se leen los params sin <Suspense> para que ese 404 sea real; como las páginas son estáticas,
// no hay espera al navegar y se desactiva la validación de navegación instantánea.
export const instant = false;

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: PageProps<"/guias/[slug]">): Promise<Metadata> {
  const g = getGuideBySlug((await props.params).slug);
  if (!g) return { title: `${t.noEncontradaTitulo} — ${es.marca}` };
  return {
    title: `${g.titulo} — ${es.marca}`,
    description: g.resumen,
    alternates: { canonical: `/guias/${g.slug}` },
    openGraph: { type: "article", title: g.titulo, description: g.resumen, publishedTime: g.publicada, modifiedTime: g.actualizada },
  };
}

export default async function GuiaPage(props: PageProps<"/guias/[slug]">) {
  const g = getGuideBySlug((await props.params).slug);
  if (!g) notFound();

  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleLd(g)) }} />
      <article className="max-w-3xl">
        <Link href="/guias" className="text-sm font-bold text-azul underline">
          {t.volver}
        </Link>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{g.titulo}</h1>
        <p className="mt-4 max-w-[62ch] text-lg">{g.resumen}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-acero">
          <span>{t.minutos(readingMinutes(g))}</span>
          <span>
            {t.actualizada} <time dateTime={g.actualizada}>{fecha(g.actualizada)}</time>
          </span>
        </p>

        <p role="note" className="mt-6 max-w-[62ch] rounded-xl border-[1.5px] border-hierro bg-papel p-4 text-sm">
          {t.aviso}
        </p>

        {g.secciones.map((s) => (
          <section key={s.titulo} className="mt-10">
            <h2 className="font-display text-[1.7rem] font-bold">{s.titulo}</h2>
            <div className="mt-3 flex max-w-[62ch] flex-col gap-3">
              {s.bloques.map((b, i) =>
                b.tipo === "p" ? (
                  <p key={i}>{b.texto}</p>
                ) : (
                  <ul key={i} className="flex list-disc flex-col gap-2 pl-6">
                    {b.items.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}

        <section className="mt-10 rounded-xl border border-linea bg-papel p-5">
          <h2 className="font-display text-2xl font-bold">{t.enForja}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {g.enForja.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="font-bold text-azul underline">
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">{t.fuentes}</h2>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-6 text-sm">
            {g.fuentes.map((f) => (
              <li key={f.url}>
                {f.texto}.{" "}
                <a href={f.url} className="break-all text-azul underline" rel="noopener noreferrer" target="_blank">
                  {f.url}
                </a>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </main>
  );
}
