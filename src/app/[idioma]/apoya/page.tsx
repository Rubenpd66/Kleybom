import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ENLACE_DONACIONES } from "@/lib/donaciones";
import { getT } from "@/lib/i18n/servidor";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.apoya.titulo} — ${es.marca}`, description: es.apoya.descripcion };
}

// Solo existe si hay un enlace de donaciones configurado (NEXT_PUBLIC_DONACIONES_URL); si no, da 404.
export default async function ApoyaPage() {
  if (!ENLACE_DONACIONES) notFound();
  const t = (await getT()).apoya;
  return (
    <main className="mx-auto w-full max-w-[1520px] lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <article className="max-w-2xl">
        <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
        <p className="mt-4 text-lg">{t.intro}</p>
        <ul className="mt-6 flex list-disc flex-col gap-2 pl-6">
          {t.puntos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <a
          href={ENLACE_DONACIONES}
          rel="noopener"
          className="mt-8 inline-flex rounded-full bg-hierro px-6 py-3 font-bold text-tiza hover:bg-temple hover:text-tinta"
        >
          {t.boton}
        </a>
        <p className="mt-3 text-sm text-acero">{t.nota}</p>
      </article>
    </main>
  );
}
