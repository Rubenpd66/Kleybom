import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import MuscleSelector from "@/components/home/MuscleSelector";
import Muestras from "@/components/home/Muestras";
import Icono from "@/components/ui/Icono";
import { GUIAS } from "@/lib/guides/content";
import { getHomeData } from "@/lib/home/queries";
import { LOCALE } from "@/lib/i18n";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { alternativas, jsonLd, websiteLd } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternativas(await getIdioma(), "/") };
}

export default async function Home() {
  const [{ grupos, cifras }, es, idioma] = await Promise.all([getHomeData(), getT(), getIdioma()]);
  const t = es.inicio;
  const miles = (n: number) => n.toLocaleString(LOCALE[idioma]);
  // Accesos a cada sección: una cifra grande y una palabra.
  const accesos = [
    { href: "/ejercicios", cifra: miles(cifras.ejercicios), texto: t.accesos.ejercicios, icono: "ejercicios" as const },
    { href: "/rutinas", cifra: miles(cifras.rutinas), texto: t.accesos.rutinas, icono: "rutinas" as const },
    { href: "/alimentos", cifra: miles(cifras.alimentos), texto: t.accesos.alimentos, icono: "alimentos" as const },
    { href: "/recetas", cifra: miles(cifras.recetas), texto: t.accesos.recetas, icono: "recetas" as const },
    { href: "/guias", cifra: String(GUIAS.length), texto: t.accesos.guias, icono: "guias" as const },
    { href: "/estadisticas", cifra: "∞", texto: t.accesos.progreso, icono: "progreso" as const },
  ];

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd()) }} />

      <div className="mx-auto grid max-w-[1520px] lg:px-10 2xl:px-16 items-center gap-10 px-6 py-14 md:min-h-[78vh] md:grid-cols-[1.15fr_1fr] md:py-20">
        <div>
          <h1 className="font-display text-[clamp(3.4rem,10vw,7.5rem)] font-extrabold leading-[0.88]">{t.titular}</h1>
          <p className="mt-6 text-lg text-acero">{t.entradilla}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ejercicios" className="rounded-full bg-hierro px-6 py-3 font-bold text-tiza hover:bg-temple hover:text-tinta">
              {t.explorar}
            </Link>
            <Link href="/registro" className="rounded-full border-[1.5px] border-hierro px-6 py-3 font-bold hover:border-temple">
              {t.crearCuenta}
            </Link>
          </div>
        </div>
        <MuscleSelector grupos={grupos} />
      </div>

      <nav aria-label={t.accesosEtiqueta} className="mx-auto max-w-[1520px] lg:px-10 2xl:px-16 px-6 pb-16">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {accesos.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="acceso group flex h-full flex-col justify-between gap-6 rounded-2xl border border-linea bg-papel/70 p-5 backdrop-blur-sm hover:border-temple"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-display text-5xl font-extrabold leading-none tabular-nums group-hover:text-temple-osc">{a.cifra}</span>
                  <Icono nombre={a.icono} className="h-9 w-9 shrink-0 text-acero group-hover:text-temple-osc" />
                </span>
                <span className="flex items-center justify-between font-medium">
                  {a.texto}
                  <span aria-hidden="true" className="flecha text-temple-osc">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Muestras etiqueta={t.muestrasEtiqueta} textos={t.muestras} />
    </main>
  );
}
