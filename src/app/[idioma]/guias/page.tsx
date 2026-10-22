import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { listGuides, readingMinutes } from "@/lib/guides";
import { getIdioma, getT } from "@/lib/i18n/servidor";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.guias.titulo} — ${es.marca}`, description: es.guias.descripcion };
}

export default async function GuiasPage() {
  const [es, idioma] = await Promise.all([getT(), getIdioma()]);
  const t = es.guias;
  return (
    <main className="mx-auto w-full max-w-[1520px] lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <ul aria-label={t.listaEtiqueta} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {listGuides(idioma).map((g) => (
          <li key={g.slug} className="rounded-xl border border-linea bg-papel">
            <Link href={`/guias/${g.slug}`} className="flex h-full flex-col gap-2 p-4 tarjeta-hover hover:bg-realce">
              <span className="font-display text-2xl font-bold leading-tight">{g.titulo}</span>
              <span className="text-sm text-acero">{g.resumen}</span>
              <span className="mt-auto pt-2 text-sm">
                <span className="rounded-full border border-hierro px-3 py-0.5">{t.minutos(readingMinutes(g))}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
