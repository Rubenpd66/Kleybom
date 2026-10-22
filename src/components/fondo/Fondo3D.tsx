"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { suscribirTema, temaActual } from "@/components/layout/TemaToggle";
import { escenaDeRuta, modoFondo, type Escena } from "@/lib/fondo/rutas";
import { sinIdioma } from "@/lib/i18n/ruta";

// Fondo 3D de cada sección. No retrasa la carga: three.js se descarga cuando el navegador está libre
// (en móvil, tras el primer toque o desplazamiento). Va detrás del contenido, no recibe clics y lo
// ignoran los lectores de pantalla. Con "reducir movimiento" o sin tarjeta gráfica se ve quieto;
// con ahorro de datos o sin WebGL no aparece. La página funciona igual en todos los casos.
export default function Fondo3D() {
  const escena = escenaDeRuta(sinIdioma(usePathname()));
  const tema = useSyncExternalStore(suscribirTema, temaActual, () => "claro");
  if (!escena) return null;
  // La key crea un lienzo nuevo al cambiar de sección o de tema (cada escena lee los colores al montarse).
  return <Lienzo key={`${escena}-${tema}`} escena={escena} />;
}

function Lienzo({ escena }: { escena: Escena }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const lienzo = ref.current;
    if (!lienzo) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const modo = modoFondo({ ancho: window.innerWidth, ahorroDatos: nav.connection?.saveData, memoriaGb: nav.deviceMemory });
    if (modo === "ninguno") return;

    let desmontar: (() => void) | undefined;
    let cancelado = false;
    const empezar = async () => {
      const { capacidadWebGL, montarEscena } = await import("./escenas");
      const capacidad = capacidadWebGL();
      if (cancelado || capacidad === "ninguna") return;
      const quieta = capacidad === "lenta" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      desmontar = montarEscena(lienzo, escena, { quieta, ligero: modo === "ligero" });
      lienzo.classList.add("fondo-visible");
    };

    // Ordenador: cuando el navegador queda libre. Móvil: con el primer gesto de la persona.
    const libre = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1200));
    const cancelarLibre = window.cancelIdleCallback ?? window.clearTimeout;
    const GESTOS = ["pointerdown", "scroll", "keydown", "touchstart"] as const;
    let idLibre: number | undefined;
    const alGesto = () => {
      GESTOS.forEach((g) => window.removeEventListener(g, alGesto));
      idLibre = libre(() => void empezar(), { timeout: 2000 });
    };
    if (modo === "completo") idLibre = libre(() => void empezar(), { timeout: 4000 });
    else GESTOS.forEach((g) => window.addEventListener(g, alGesto, { passive: true, once: true }));

    return () => {
      cancelado = true;
      GESTOS.forEach((g) => window.removeEventListener(g, alGesto));
      if (idLibre !== undefined) cancelarLibre(idLibre);
      desmontar?.();
    };
  }, [escena]);

  // La colocación va en línea (además de en globals.css): aunque la hoja de estilos falle,
  // el lienzo nunca ocupa sitio ni tapa el contenido.
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-escena={escena}
      className="fondo-3d"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: -1, pointerEvents: "none" }}
    />
  );
}
