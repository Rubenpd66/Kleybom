// Anuncios de Google AdSense. Todo apagado por defecto y por etapas (ver docs/anuncios.md):
// - NEXT_PUBLIC_ADSENSE_ID (ca-pub-...): activa la verificación de la web (meta etiqueta y ads.txt).
// - NEXT_PUBLIC_ADSENSE_SLOT: con la web ya aprobada, el número del bloque de anuncios; activa los anuncios.
// Sin las variables no se carga ningún script de terceros ni se muestra nada.
const ID = /^ca-pub-\d{10,20}$/;
const BLOQUE = /^\d{6,15}$/;

export function idAdsense(valor: string | undefined): string | null {
  const v = valor?.trim();
  return v && ID.test(v) ? v : null;
}

export function bloqueAdsense(valor: string | undefined): string | null {
  const v = valor?.trim();
  return v && BLOQUE.test(v) ? v : null;
}

// Línea de ads.txt: Google exige este archivo para comprobar quién puede vender tu publicidad.
// f08c47fec0942fa0 es el identificador de Google como autoridad certificadora.
export function lineaAdsTxt(id: string): string {
  return `google.com, ${id.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`;
}

export const ID_ADSENSE = idAdsense(process.env.NEXT_PUBLIC_ADSENSE_ID);
export const BLOQUE_ADSENSE = bloqueAdsense(process.env.NEXT_PUBLIC_ADSENSE_SLOT);
// Con los dos valores se muestran anuncios (y hace falta el enlace para cambiar el consentimiento).
export const ANUNCIOS_ACTIVOS = Boolean(ID_ADSENSE && BLOQUE_ADSENSE);

export const urlScriptAdsense = (id: string) => `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}`;
