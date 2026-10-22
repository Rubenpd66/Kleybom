"use client";

import Link from "@/components/ui/Link";
import { useRouter, useSearchParams } from "next/navigation";
import Model, { type IMuscleStats, type Muscle } from "react-body-highlighter";
import { enlaceConMusculo, musculoDeZona, zonasDeMusculo } from "@/lib/exercises/bodymap";
import { useIdioma, useT } from "@/lib/i18n/cliente";
import { conIdioma } from "@/lib/i18n/ruta";

// Variables del tema (la librería aplica el color con style, así que var() funciona).
const AMBAR = "var(--temple)";
const CUERPO = "var(--cuerpo)";

// Mapa del cuerpo (delante y detrás): al pulsar un músculo se filtra el listado.
// Es una ayuda visual para ratón y pantalla táctil; el selector "Músculo" del formulario
// hace lo mismo con teclado y lector de pantalla.
export default function BodyMap({ seleccionado, nombre }: { seleccionado?: string; nombre?: string }) {
  const t = useT().ejercicios;
  const router = useRouter();
  const idioma = useIdioma();
  const params = useSearchParams();
  const datos = seleccionado ? [{ name: nombre ?? seleccionado, muscles: zonasDeMusculo(seleccionado) as Muscle[] }] : [];

  function pulsar({ muscle }: IMuscleStats) {
    const slug = musculoDeZona(muscle);
    if (slug) router.push(conIdioma(idioma, enlaceConMusculo(params, slug)), { scroll: false });
  }

  return (
    <section aria-labelledby="mapa-titulo" className="rounded-xl border border-linea bg-papel p-4">
      <h2 id="mapa-titulo" className="font-bold">
        {t.mapaTitulo}
      </h2>
      <p className="mt-1 text-sm text-acero">{t.mapaAyuda}</p>
      <div role="img" aria-label={t.mapaEtiqueta} className="mt-3 grid grid-cols-2 gap-4 [&_polygon]:cursor-pointer">
        {(["anterior", "posterior"] as const).map((tipo) => (
          <figure key={tipo} className="flex flex-col items-center">
            <Model type={tipo} data={datos} bodyColor={CUERPO} highlightedColors={[AMBAR]} onClick={pulsar} style={{ width: "100%", maxWidth: "11rem" }} />
            <figcaption className="mt-1 text-xs text-acero">{tipo === "anterior" ? t.delante : t.detras}</figcaption>
          </figure>
        ))}
      </div>
      {seleccionado && (
        <p className="mt-3 text-sm">
          {t.mapaElegido(nombre ?? seleccionado)}{" "}
          <Link href={enlaceConMusculo(params, null)} scroll={false} className="font-bold text-azul underline">
            {t.mapaQuitar}
          </Link>
        </p>
      )}
    </section>
  );
}
