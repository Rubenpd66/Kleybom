"use client";

import { COOKIE_IDIOMA, IDIOMAS, type Idioma } from "@/lib/i18n";
import { useIdioma, useT } from "@/lib/i18n/cliente";
import { conIdioma, sinIdioma } from "@/lib/i18n/ruta";

// ES | EN. Cada idioma tiene su dirección (/ejercicios y /en/ejercicios): se va a la misma página en
// el otro idioma. La elección se guarda también en una cookie (un año) para acciones y redirecciones.
export function cambiarIdioma(idioma: Idioma) {
  document.cookie = `${COOKIE_IDIOMA}=${idioma}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  const { pathname, search, hash } = window.location;
  window.location.assign(conIdioma(idioma, sinIdioma(pathname)) + search + hash);
}

export default function SelectorIdioma() {
  const actual = useIdioma();
  const t = useT();
  return (
    <div role="group" aria-label={t.nav.idioma} className="flex h-10 items-center rounded-full border-[1.5px] border-linea p-0.5">
      {IDIOMAS.map((i) => (
        <button
          key={i}
          type="button"
          lang={i}
          aria-pressed={i === actual}
          title={i === actual ? undefined : t.nav.cambiarIdioma}
          onClick={() => i !== actual && cambiarIdioma(i)}
          className="h-full rounded-full px-2.5 text-xs font-bold uppercase aria-pressed:bg-hierro aria-pressed:text-tiza hover:text-temple-osc aria-pressed:hover:text-tiza"
        >
          {i}
        </button>
      ))}
    </div>
  );
}
