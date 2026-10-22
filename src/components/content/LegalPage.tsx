import type { Metadata } from "next";
import Secciones from "@/components/content/Secciones";
import { LOCALE } from "@/lib/i18n";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/seo/site";
import { ID_ADSENSE } from "@/lib/anuncios";
import { ENLACE_DONACIONES } from "@/lib/donaciones";
import { avisoLegal, cookies, privacidad, type Activos, type TextoLegal } from "@/lib/legal/content";
import { avisoLegalEn, cookiesEn, privacidadEn } from "@/lib/legal/content-en";
import { ACTUALIZADO } from "@/lib/legal/titular";

// Los textos cuentan la publicidad en cuanto hay ID de AdSense: Google revisa la política de privacidad
// antes de aprobar la web, es decir, antes de que se vea ningún anuncio.
const ACTIVOS: Activos = { anuncios: Boolean(ID_ADSENSE), donaciones: Boolean(ENLACE_DONACIONES) };

const TEXTOS = {
  es: { "aviso-legal": avisoLegal(ACTIVOS), privacidad: privacidad(ACTIVOS), cookies: cookies(ACTIVOS) },
  en: { "aviso-legal": avisoLegalEn(ACTIVOS), privacidad: privacidadEn(ACTIVOS), cookies: cookiesEn(ACTIVOS) },
} as const;

const ACTUALIZADO_EL = { es: "Actualizado el", en: "Updated on" } as const;

async function textoEnIdioma(slug: TextoLegal["slug"]) {
  const idioma = await getIdioma();
  return { idioma, texto: TEXTOS[idioma][slug] };
}

export async function metadataLegal(slug: TextoLegal["slug"]): Promise<Metadata> {
  const [{ idioma, texto }, es] = await Promise.all([textoEnIdioma(slug), getT()]);
  return { title: `${texto.titulo} — ${es.marca}`, description: texto.resumen, alternates: alternativas(idioma, `/${slug}`) };
}

export default async function LegalPage({ slug }: { slug: TextoLegal["slug"] }) {
  const { idioma, texto } = await textoEnIdioma(slug);
  const fecha = new Intl.DateTimeFormat(LOCALE[idioma], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(ACTUALIZADO),
  );
  return (
    <main className="mx-auto w-full max-w-[1520px] lg:px-10 2xl:px-16 flex-1 px-6 py-12">
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
