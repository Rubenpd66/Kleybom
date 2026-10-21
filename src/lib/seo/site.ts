import type { Guia } from "@/lib/guides";
import { es } from "@/lib/i18n/es";

// Dirección pública de la web. En Vercel se define NEXT_PUBLIC_SITE_URL; si falta, la de producción.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://forja-five-zeta.vercel.app").replace(/\/+$/, "");

export const url = (ruta: string) => `${SITE_URL}${ruta === "/" ? "" : ruta}`;

// Rutas con datos personales: fuera de buscadores (además, piden sesión).
export const RUTAS_NO_INDEXABLES = ["/panel", "/rutinas/nueva", "/calendario", "/nutricion", "/entreno", "/estadisticas", "/api/", "/auth/"];

// Páginas públicas sin parámetros.
export const PAGINAS_ESTATICAS = ["/", "/ejercicios", "/rutinas", "/alimentos", "/alimentos/codigo", "/recetas", "/guias", "/aviso-legal", "/privacidad", "/cookies"];

// Imagen al compartir en redes. Un `openGraph` de página sustituye al del layout, así que hay que repetirla.
export const IMAGEN_COMPARTIR = {
  url: "/img/compartir.jpg",
  width: 1200,
  height: 630,
  alt: "KleyBom: un gimnasio luminoso con una tableta que muestra estadísticas de entrenamiento",
};

// JSON para <script type="application/ld+json">: se escapa "<" para que ningún texto cierre la etiqueta.
export function jsonLd(datos: object): string {
  return JSON.stringify(datos).replace(/</g, "\\u003c");
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#web`, url: url("/"), name: es.marca, description: es.meta.descripcion, inLanguage: "es-ES", publisher: { "@id": `${SITE_URL}/#org` } },
      { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: es.marca, url: url("/") },
    ],
  };
}

export function articleLd(g: Guia) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.titulo,
    description: g.resumen,
    datePublished: g.publicada,
    dateModified: g.actualizada,
    inLanguage: "es-ES",
    mainEntityOfPage: url(`/guias/${g.slug}`),
    author: { "@type": "Organization", name: es.marca, url: url("/") },
    publisher: { "@type": "Organization", name: es.marca, url: url("/") },
    citation: g.fuentes.map((f) => f.url),
  };
}
