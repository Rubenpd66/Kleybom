import type { Metadata } from "next";
import Secciones from "@/components/content/Secciones";
import { es } from "@/lib/i18n/es";
import type { TextoLegal } from "@/lib/legal/content";
import { ACTUALIZADO } from "@/lib/legal/titular";

const fecha = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
  new Date(ACTUALIZADO),
);

export const metadataLegal = (texto: TextoLegal): Metadata => ({
  title: `${texto.titulo} — ${es.marca}`,
  description: texto.resumen,
  alternates: { canonical: `/${texto.slug}` },
});

export default function LegalPage({ texto }: { texto: TextoLegal }) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <article className="max-w-3xl">
        <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{texto.titulo}</h1>
        <p className="mt-4 max-w-[62ch] text-lg">{texto.resumen}</p>
        <p className="mt-3 text-sm text-acero">
          Actualizado el <time dateTime={ACTUALIZADO}>{fecha}</time>
        </p>
        <Secciones secciones={texto.secciones} />
      </article>
    </main>
  );
}
