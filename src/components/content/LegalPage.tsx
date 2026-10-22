import type { Metadata } from "next";
import Secciones from "@/components/content/Secciones";
import { LOCALE } from "@/lib/i18n";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { AVISO_LEGAL, COOKIES, PRIVACIDAD, type TextoLegal } from "@/lib/legal/content";
import { AVISO_LEGAL_EN, COOKIES_EN, PRIVACIDAD_EN } from "@/lib/legal/content-en";
import { ACTUALIZADO } from "@/lib/legal/titular";

const TEXTOS = {
  es: { "aviso-legal": AVISO_LEGAL, privacidad: PRIVACIDAD, cookies: COOKIES },
  en: { "aviso-legal": AVISO_LEGAL_EN, privacidad: PRIVACIDAD_EN, cookies: COOKIES_EN },
} as const;

const ACTUALIZADO_EL = { es: "Actualizado el", en: "Updated on" } as const;

async function textoEnIdioma(slug: TextoLegal["slug"]) {
  const idioma = await getIdioma();
  return { idioma, texto: TEXTOS[idioma][slug] };
}

export async function metadataLegal(slug: TextoLegal["slug"]): Promise<Metadata> {
  const [{ texto }, es] = await Promise.all([textoEnIdioma(slug), getT()]);
  return { title: `${texto.titulo} — ${es.marca}`, description: texto.resumen, alternates: { canonical: `/${slug}` } };
}

export default async function LegalPage({ slug }: { slug: TextoLegal["slug"] }) {
  const { idioma, texto } = await textoEnIdioma(slug);
  const fecha = new Intl.DateTimeFormat(LOCALE[idioma], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(ACTUALIZADO),
  );
  return (
    <main className="mx-auto w-full lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <article className="max-w-3xl">
        <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{texto.titulo}</h1>
        <p className="mt-4 max-w-[62ch] text-lg">{texto.resumen}</p>
        <p className="mt-3 text-sm text-acero">
          {ACTUALIZADO_EL[idioma]} <time dateTime={ACTUALIZADO}>{fecha}</time>
        </p>
        <Secciones secciones={texto.secciones} />
      </article>
    </main>
  );
}
