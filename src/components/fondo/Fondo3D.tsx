"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { debeMostrarFondo, escenaDeRuta, type Escena } from "@/lib/fondo/rutas";

// Fondo 3D decorativo de cada sección. No retrasa la carga: three.js se descarga cuando el navegador
// está libre. Va detrás del contenido, no recibe clics y lo ignoran los lectores de pantalla.
// Con "reducir movimiento" o sin tarjeta gráfica se ve quieto. Sin WebGL, en móvil o con ahorro de datos no aparece
// y la página funciona igual.
export default function Fondo3D() {
  const escena = escenaDeRuta(usePathname());
  if (!escena) return null;
  // La key crea un lienzo nuevo en cada sección (cada escena tiene su propio contexto WebGL).
  return <Lienzo key={escena} escena={escena} />;
}

function Lienzo({ escena }: { escena: Escena }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const lienzo = ref.current;
    if (!lienzo) return;
    let desmontar: (() => void) | undefined;
    let cancelado = false;

    // Se decide antes de descargar nada: en móvil o con ahorro de datos, three.js ni se pide.
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (!debeMostrarFondo({ ancho: window.innerWidth, ahorroDatos: nav.connection?.saveData, memoriaGb: nav.deviceMemory })) return;

    const empezar = async () => {
      const { capacidadWebGL, montarEscena } = await import("./escenas");
      const capacidad = capacidadWebGL();
      if (cancelado || capacidad === "ninguna") return;
      const quieta = capacidad === "lenta" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      desmontar = montarEscena(lienzo, escena, quieta);
      lienzo.classList.add("fondo-visible");
    };

    // Espera a que la página haya cargado y el navegador esté libre.
    const libre = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1200));
    const id = libre(() => void empezar(), { timeout: 4000 });
    return () => {
      cancelado = true;
      (window.cancelIdleCallback ?? window.clearTimeout)(id);
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
