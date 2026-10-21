"use client";

import Image from "next/image";
import Model, { type Muscle } from "react-body-highlighter";
import { zonasDeDibujo } from "@/lib/exercises/bodymap";

export type MusculoDeEjercicio = { slug: string; role: "principal" | "secundario" };

// Imagen de un ejercicio: su foto (de wger, con licencia) o, si no tiene, el cuerpo de frente y de
// espaldas con los músculos que trabaja (ámbar los principales, más suave los secundarios).
export default function ExerciseImage({
  src,
  alt,
  musculos,
  sizes = "(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw",
  prioridad = false,
}: {
  src: string | null;
  alt: string;
  musculos: MusculoDeEjercicio[];
  sizes?: string;
  prioridad?: boolean;
}) {
  if (src) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white">
        <Image src={src} alt={alt} fill sizes={sizes} priority={prioridad} className="object-contain p-2" />
      </div>
    );
  }
  const zonas = (rol: MusculoDeEjercicio["role"]) => musculos.filter((m) => m.role === rol).flatMap((m) => zonasDeDibujo(m.slug)) as Muscle[];
  const principales = zonas("principal");
  // La librería colorea según cuántas veces aparece una zona: los principales van dos veces (color fuerte).
  const datos = [
    { name: "principal", muscles: principales },
    { name: "principal-2", muscles: principales },
    { name: "secundario", muscles: zonas("secundario") },
  ];
  return (
    // Sin texto alternativo (en las tarjetas, junto al nombre) el dibujo es decorativo.
    <div {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })} className="flex aspect-[4/3] items-center justify-center gap-2 rounded-lg bg-realce/60 p-3 [&_polygon]:cursor-auto">
      {(["anterior", "posterior"] as const).map((tipo) => (
        <Model
          key={tipo}
          type={tipo}
          data={datos}
          bodyColor="var(--cuerpo)"
          highlightedColors={["var(--temple-suave)", "var(--temple)"]}
          style={{ height: "100%", aspectRatio: "1 / 2" }}
        />
      ))}
    </div>
  );
}
