// Rutas e idioma en el proxy (lógica pura, probada en ruta.test.ts).
import { esIdioma, type Idioma } from "./index";

// Lo que no es una página (API, vuelta del login, robots, sitemap, iconos) no lleva idioma.
const SIN_IDIOMA = /^\/(api|auth)(\/|$)|^\/(robots\.txt|sitemap\.xml|favicon\.ico|icon|apple-icon)/;

export function llevaIdioma(ruta: string): boolean {
  return !SIN_IDIOMA.test(ruta);
}

// Si alguien escribe /en/ejercicios o /es: el idioma de la dirección y la ruta sin él.
export function idiomaEnRuta(ruta: string): { idioma: Idioma; resto: string } | null {
  const m = ruta.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!m || !esIdioma(m[1])) return null;
  return { idioma: m[1], resto: m[2] || "/" };
}

// La ruta que ve la persona. Al pintar en el servidor, usePathname() da la ruta interna (/es/guias)
// y en el navegador la visible (/guias): sin quitar el idioma, el HTML no coincidiría al hidratar.
export function sinIdioma(ruta: string): string {
  return idiomaEnRuta(ruta)?.resto ?? ruta;
}

// Dirección de una página en un idioma. El español es el original y va sin prefijo (/ejercicios);
// el inglés lleva /en (/en/ejercicios). Cada idioma tiene su propia dirección: así Google puede
// rastrear e indexar los dos (con una cookie, solo vería el español). Acepta ?consulta y #ancla.
export function conIdioma(idioma: Idioma, ruta: string): string {
  if (idioma === "es" || !ruta.startsWith("/") || ruta.startsWith("//")) return ruta;
  const camino = ruta.split(/[?#]/)[0];
  if (!llevaIdioma(camino) || idiomaEnRuta(camino)) return ruta;
  return camino === "/" ? `/en${ruta.slice(1)}` : `/en${ruta}`;
}
