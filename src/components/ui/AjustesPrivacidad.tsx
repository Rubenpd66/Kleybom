"use client";

import { ID_ADSENSE, urlScriptAdsense } from "@/lib/anuncios";

type Googlefc = { callbackQueue?: unknown[]; showRevocationMessage?: () => void };

// Enlace «Privacidad y cookies» del pie (lo exige Google con su aviso de consentimiento): vuelve a abrir
// el aviso para cambiar o retirar el consentimiento. Si el script de Google aún no está en esta página
// (solo se carga en las fichas con anuncios), lo carga ahora, a petición de la persona.
export default function AjustesPrivacidad({ etiqueta }: { etiqueta: string }) {
  const abrir = () => {
    const w = window as Window & { googlefc?: Googlefc };
    w.googlefc ||= {};
    w.googlefc.callbackQueue ||= [];
    w.googlefc.callbackQueue.push(() => w.googlefc?.showRevocationMessage?.());
    if (ID_ADSENSE && !document.querySelector('script[src*="adsbygoogle.js"]')) {
      const s = document.createElement("script");
      s.src = urlScriptAdsense(ID_ADSENSE);
      s.async = true;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }
  };
  return (
    <button type="button" onClick={abrir} className="hover:text-temple-osc hover:underline">
      {etiqueta}
    </button>
  );
}
