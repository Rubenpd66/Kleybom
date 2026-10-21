import type { Metadata } from "next";
import Link from "next/link";
import { listGuides, readingMinutes } from "@/lib/guides";
import { es } from "@/lib/i18n/es";

const t = es.guias;

export const metadata: Metadata = { title: `${t.titulo} — ${es.marca}`, description: t.descripcion };

export default function GuiasPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <ul aria-label={t.listaEtiqueta} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listGuides().map((g) => (
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
