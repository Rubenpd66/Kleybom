// Idiomas de la web. El español es el original; el inglés usa la misma forma (mismas claves).
import { en } from "./en";
import { es } from "./es";

export const IDIOMAS = ["es", "en"] as const;
export type Idioma = (typeof IDIOMAS)[number];
import type { Diccionario } from "./es";
export type { Diccionario };

// Cookie con la elección de la persona: el proxy la lee y sirve /es/... o /en/... por dentro, sin cambiar la dirección.
export const COOKIE_IDIOMA = "idioma";

// Formato de fechas y números de cada idioma.
export const LOCALE: Record<Idioma, string> = { es: "es-ES", en: "en-GB" };

const DICCIONARIOS: Record<Idioma, Diccionario> = { es, en };

export function esIdioma(valor: unknown): valor is Idioma {
  return typeof valor === "string" && (IDIOMAS as readonly string[]).includes(valor);
}

export function diccionario(idioma: Idioma): Diccionario {
  return DICCIONARIOS[idioma];
}
