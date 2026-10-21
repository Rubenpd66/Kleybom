"use client";

import Link from "next/link";
import { useState } from "react";
import type { GrupoPortada } from "@/lib/home/queries";
import { es } from "@/lib/i18n/es";

const t = es.inicio;

// Selector de la portada: al pulsar un grupo muscular cambia la lista de ejercicios.
// Sin JavaScript se ve el primer grupo y el enlace a todos los ejercicios.
export default function MuscleSelector({ grupos }: { grupos: GrupoPortada[] }) {
  const [activo, setActivo] = useState(grupos[0]?.clave);
  const grupo = grupos.find((g) => g.clave === activo) ?? grupos[0];
  if (!grupo) return null;

  return (
    <section aria-labelledby="selector-titulo" className="rounded-xl bg-hierro p-5 text-tiza sm:p-6">
      <h2 id="selector-titulo" className="font-display text-[2rem] font-bold leading-tight">
        {t.selectorTitulo}
      </h2>
      <p className="mt-1 text-[0.95rem] text-[#b9c2c9]">{t.selectorAyuda}</p>
      <div role="group" aria-label={t.selectorGrupos} className="mt-4 flex flex-wrap gap-2">
        {grupos.map((g) => (
          <button
            key={g.clave}
            type="button"
            aria-pressed={g.clave === grupo.clave}
            onClick={() => setActivo(g.clave)}
            className="min-h-10 rounded-full border-[1.5px] border-[#5d6a74] px-3.5 text-[0.95rem] font-medium aria-pressed:border-temple aria-pressed:bg-temple aria-pressed:text-hierro"
          >
            {g.nombre}
          </button>
        ))}
      </div>
      <ul aria-live="polite" aria-label={grupo.nombre} className="mt-5 flex flex-col gap-2">
        {grupo.ejercicios.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/ejercicios/${e.slug}`}
              className="tarjeta-hover flex flex-col rounded-lg bg-[#262d33] px-4 py-3 hover:bg-[#2f373e]"
            >
              <strong>{e.name_es}</strong>
              {e.principales.length > 0 && <small className="text-[#b9c2c9]">{e.principales.join(" · ")}</small>}
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/ejercicios?muscle=${grupo.musculo}`} className="mt-4 inline-block text-sm font-bold text-temple underline">
        {t.verTodos(grupo.nombre)}
      </Link>
    </section>
  );
}
