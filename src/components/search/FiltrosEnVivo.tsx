"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type ReactNode } from "react";

const ESPERA_MS = 300;

// Envuelve un formulario GET de filtros para que el listado se actualice mientras se escribe:
// el texto espera 300 ms tras la última tecla y los desplegables se aplican al momento.
// Sin JavaScript sigue siendo un formulario normal con su botón (que con JS se oculta: .solo-sin-js).
export default function FiltrosEnVivo({ children, className, etiqueta }: { children: ReactNode; className?: string; etiqueta?: string }) {
  const router = useRouter();
  const ruta = usePathname();
  const formulario = useRef<HTMLFormElement>(null);
  const espera = useRef<number | undefined>(undefined);
  const [cargando, empezar] = useTransition();

  // Con JS activo, el botón de buscar sobra.
  useEffect(() => {
    formulario.current?.setAttribute("data-en-vivo", "si");
    return () => window.clearTimeout(espera.current);
  }, []);

  function aplicar() {
    const datos = new FormData(formulario.current!);
    const p = new URLSearchParams();
    for (const [clave, valor] of datos) if (typeof valor === "string" && valor.trim()) p.set(clave, valor.trim());
    const qs = p.toString();
    // replace: escribir no llena el historial de "atrás"; la página vuelve a la 1 al cambiar filtros.
    empezar(() => router.replace(qs ? `${ruta}?${qs}` : ruta, { scroll: false }));
  }

  function alCambiar(e: React.SyntheticEvent<HTMLFormElement>) {
    window.clearTimeout(espera.current);
    const escribiendo = e.target instanceof HTMLInputElement && (e.target.type === "search" || e.target.type === "text");
    if (escribiendo) espera.current = window.setTimeout(aplicar, ESPERA_MS);
    else aplicar();
  }

  return (
    <form
      ref={formulario}
      method="get"
      role="search"
      aria-label={etiqueta}
      aria-busy={cargando}
      onInput={alCambiar}
      onSubmit={(e) => {
        e.preventDefault();
        window.clearTimeout(espera.current);
        aplicar();
      }}
      className={`filtros-en-vivo ${className ?? ""}`}
    >
      {children}
    </form>
  );
}
