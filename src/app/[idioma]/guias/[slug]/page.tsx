import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Secciones from "@/components/content/Secciones";
import { getGuideBySlug, listGuides, readingMinutes } from "@/lib/guides";
import { LOCALE } from "@/lib/i18n";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { IMAGEN_COMPARTIR, articleLd, jsonLd } from "@/lib/seo/site";

const fecha = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

// Todas las guías se generan al compilar; una dirección desconocida da 404.
// Se leen los params sin <Suspense> para que ese 404 sea real; como las páginas son estáticas,
// no hay espera al navegar y se desactiva la validación de navegación instantánea.
export const instant = false;

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: PageProps<"/[idioma]/guias/[slug]">): Promise<Metadata> {
  const [{ slug }, es, idioma] = await Promise.all([props.params, getT(), getIdioma()]);
  const g = getGuideBySlug(slug, idioma);
  if (!g) return { title: `${es.guias.noEncontradaTitulo} — ${es.marca}` };
  return {
    title: `${g.titulo} — ${es.marca}`,
    description: g.resumen,
    alternates: { canonical: `/guias/${g.slug}` },
    openGraph: { type: "article", title: g.titulo, description: g.resumen, publishedTime: g.publicada, modifiedTime: g.actualizada, images: [IMAGEN_COMPARTIR] },
  };
}

export default async function GuiaPage(props: PageProps<"/[idioma]/guias/[slug]">) {
  const [{ slug }, es, idioma] = await Promise.all([props.params, getT(), getIdioma()]);
  const t = es.guias;
  const g = getGuideBySlug(slug, idioma);
  if (!g) notFound();

  return (
    <main className="mx-auto w-full lg:px-10 2xl:px-16 flex-1 px-6 py-12">
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
            {t.actualizada} <time dateTime={g.actualizada}>{fecha(g.actualizada, LOCALE[idioma])}</time>
          </span>
        </p>

        <p role="note" className="mt-6 max-w-[62ch] rounded-xl border-[1.5px] border-hierro bg-papel p-4 text-sm">
          {t.aviso}
        </p>

        <Secciones secciones={g.secciones} />

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
