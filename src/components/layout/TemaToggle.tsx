"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n/cliente";

type Tema = "claro" | "oscuro";
const EVENTO = "cambio-tema";

// Tema que se ve ahora: el elegido a mano o, si no, el del sistema.
export function temaActual(): Tema {
  const elegido = document.documentElement.dataset.tema;
  if (elegido === "claro" || elegido === "oscuro") return elegido;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
}

// Avisa cuando cambia el tema: por este botón o porque cambia el del sistema.
export function suscribirTema(aviso: () => void) {
  const sistema = window.matchMedia("(prefers-color-scheme: dark)");
  sistema.addEventListener("change", aviso);
  window.addEventListener(EVENTO, aviso);
  return () => {
    sistema.removeEventListener("change", aviso);
    window.removeEventListener(EVENTO, aviso);
  };
}

export function cambiarTema() {
  const nuevo: Tema = temaActual() === "oscuro" ? "claro" : "oscuro";
  document.documentElement.dataset.tema = nuevo;
  try {
    localStorage.setItem("tema", nuevo);
  } catch {
    // sin almacenamiento (modo privado): vale para esta visita
  }
  window.dispatchEvent(new Event(EVENTO));
}

// Botón sol/luna. La elección se guarda en este navegador; SCRIPT_TEMA (src/lib/tema.ts) la aplica antes de pintar.
export default function TemaToggle() {
  // En el servidor no se sabe el tema: se pinta la luna y se corrige al hidratar.
  const es = useT();
  const tema = useSyncExternalStore(suscribirTema, temaActual, () => "claro" as Tema);
  const oscuro = tema === "oscuro";
  return (
    <button
      type="button"
      onClick={cambiarTema}
      aria-label={oscuro ? es.nav.temaClaro : es.nav.temaOscuro}
      title={oscuro ? es.nav.temaClaro : es.nav.temaOscuro}
      className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-linea hover:border-hierro"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {oscuro ? (
          <>
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  );
}
