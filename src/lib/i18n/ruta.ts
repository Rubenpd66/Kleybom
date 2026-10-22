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
