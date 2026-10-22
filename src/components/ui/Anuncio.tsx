"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { BLOQUE_ADSENSE, ID_ADSENSE, urlScriptAdsense } from "@/lib/anuncios";
import { useT } from "@/lib/i18n/cliente";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Un bloque de anuncios de AdSense al final de una ficha de contenido (nunca en zonas privadas).
// Sin las variables de entorno, o fuera de producción, no pinta nada y no carga ningún script.
// El script de Google solo se descarga cuando hay un anuncio que mostrar, y la altura va reservada
// para que la página no salte al llegar el anuncio. El aviso de consentimiento lo muestra Google
// (herramienta "Privacy & messaging" de AdSense) al cargar su script en la UE.
export default function Anuncio() {
  const t = useT().anuncios;
  const ins = useRef<HTMLModElement>(null);
  const activo = Boolean(ID_ADSENSE && BLOQUE_ADSENSE) && process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!activo || !ins.current || ins.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle ||= []).push({});
    } catch {
      // Un bloqueador de anuncios u otro fallo: la página funciona igual sin el anuncio.
    }
  }, [activo]);

  if (!activo) return null;
  return (
    <aside aria-label={t.etiqueta} className="anuncio mt-10 max-w-3xl">
      <p className="mb-1 text-xs uppercase tracking-wide text-acero">{t.etiqueta}</p>
      <div className="min-h-[280px] overflow-hidden rounded-xl border border-linea bg-papel">
        <ins
          ref={ins}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ID_ADSENSE!}
          data-ad-slot={BLOQUE_ADSENSE!}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      <Script
        id="adsense"
        src={urlScriptAdsense(ID_ADSENSE!)}
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />
    </aside>
  );
}
