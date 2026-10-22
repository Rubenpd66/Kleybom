// Idioma en el servidor. En páginas y componentes de servidor sale del segmento [idioma] de la ruta;
// en acciones de servidor y rutas de API (donde no hay segmento) sale de la cookie.
import { cookies } from "next/headers";
import { idioma as idiomaDeRuta } from "next/root-params";
import { COOKIE_IDIOMA, diccionario, esIdioma, type Idioma } from "./index";

export async function getIdioma(): Promise<Idioma> {
  const valor = await idiomaDeRuta();
  return esIdioma(valor) ? valor : "es";
}

export async function getT() {
  return diccionario(await getIdioma());
}

export async function idiomaDeCookie(): Promise<Idioma> {
  const valor = (await cookies()).get(COOKIE_IDIOMA)?.value;
  return esIdioma(valor) ? valor : "es";
}

export async function tDeCookie() {
  return diccionario(await idiomaDeCookie());
}
