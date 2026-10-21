import type { Metadata } from "next";
import Link from "next/link";
import MuscleSelector from "@/components/home/MuscleSelector";
import { GUIAS } from "@/lib/guides/content";
import { getHomeData } from "@/lib/home/queries";
import { es } from "@/lib/i18n/es";
import { jsonLd, websiteLd } from "@/lib/seo/site";

const t = es.inicio;

export const metadata: Metadata = { alternates: { canonical: "/" } };

const miles = (n: number) => n.toLocaleString("es-ES");

export default async function Home() {
  const { grupos, cifras } = await getHomeData();
  // Accesos a cada sección: una cifra grande y una palabra.
  const accesos = [
    { href: "/ejercicios", cifra: miles(cifras.ejercicios), texto: t.accesos.ejercicios },
    { href: "/rutinas", cifra: miles(cifras.rutinas), texto: t.accesos.rutinas },
    { href: "/alimentos", cifra: miles(cifras.alimentos), texto: t.accesos.alimentos },
    { href: "/recetas", cifra: miles(cifras.recetas), texto: t.accesos.recetas },
    { href: "/guias", cifra: String(GUIAS.length), texto: t.accesos.guias },
    { href: "/estadisticas", cifra: "∞", texto: t.accesos.progreso },
  ];

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd()) }} />

      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-6 py-14 md:min-h-[78vh] md:grid-cols-[1.15fr_1fr] md:py-20">
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

      <nav aria-label={t.accesosEtiqueta} className="mx-auto max-w-[1180px] px-6 pb-20">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {accesos.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="acceso group flex h-full flex-col justify-between gap-6 rounded-2xl border border-linea bg-papel/70 p-5 backdrop-blur-sm hover:border-temple"
              >
                <span className="font-display text-5xl font-extrabold leading-none tabular-nums group-hover:text-temple-osc">{a.cifra}</span>
                <span className="flex items-center justify-between font-medium">
                  {a.texto}
                  <span aria-hidden="true" className="flecha text-temple-osc">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
