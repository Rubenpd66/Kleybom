"use client";

import Link from "@/components/ui/Link";
import { useState } from "react";
import type { GrupoPortada } from "@/lib/home/queries";
import { useT } from "@/lib/i18n/cliente";

// Selector de la portada: al pulsar un grupo muscular cambia la lista de ejercicios.
// Sin JavaScript se ve el primer grupo y el enlace a todos los ejercicios.
export default function MuscleSelector({ grupos }: { grupos: GrupoPortada[] }) {
  const t = useT().inicio;
  const [activo, setActivo] = useState(grupos[0]?.clave);
  const grupo = grupos.find((g) => g.clave === activo) ?? grupos[0];
  if (!grupo) return null;

  return (
    <section aria-labelledby="selector-titulo" className="rounded-3xl border border-linea bg-papel/75 p-5 shadow-sm backdrop-blur-md sm:p-6">
      <h2 id="selector-titulo" className="font-display text-[2rem] font-bold leading-tight">
        {t.selectorTitulo}
      </h2>
      <div role="group" aria-label={t.selectorGrupos} className="mt-4 flex flex-wrap gap-2">
        {grupos.map((g) => (
          <button
            key={g.clave}
            type="button"
            aria-pressed={g.clave === grupo.clave}
            onClick={() => setActivo(g.clave)}
            className="min-h-10 rounded-full border-[1.5px] border-linea px-3.5 text-[0.95rem] font-medium hover:border-hierro aria-pressed:border-temple aria-pressed:bg-temple aria-pressed:text-tinta"
          >
            {g.nombre}
          </button>
        ))}
      </div>
      {/* La key reinicia la lista al cambiar de grupo para que entre con su animación. */}
      <ul key={grupo.clave} aria-live="polite" aria-label={grupo.nombre} className="mt-5 flex flex-col gap-2">
        {grupo.ejercicios.map((e, i) => (
          <li key={e.slug} className="lista-entra" style={{ animationDelay: `${i * 50}ms` }}>
            <Link href={`/ejercicios/${e.slug}`} className="tarjeta-hover flex items-center justify-between rounded-xl bg-tiza/70 px-4 py-3 hover:bg-realce">
              <span className="flex flex-col">
                <strong>{e.nombre}</strong>
                {e.principales.length > 0 && <small className="text-acero">{e.principales.join(" · ")}</small>}
              </span>
              <span aria-hidden="true" className="text-temple-osc">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/ejercicios?muscle=${grupo.musculo}`} className="mt-4 inline-block text-sm font-bold text-azul underline">
        {t.verTodos(grupo.nombre)}
      </Link>
    </section>
  );
}
