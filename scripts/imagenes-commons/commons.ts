// Búsqueda de fotos con licencia libre en Wikimedia Commons (API pública, sin clave).
export type Candidata = {
  titulo: string;
  url: string; // miniatura de unos 800 px
  ancho: number;
  alto: number;
  autor: string;
  licencia: string;
  licenciaUrl: string | null;
  fuente: string; // página del archivo en Commons
};

// Wikimedia pide identificarse con un User-Agent con forma de contacto.
const CABECERAS = { "User-Agent": "KleyBom/1.0 (https://forja-five-zeta.vercel.app)" };
const API = "https://commons.wikimedia.org/w/api.php";

// Solo licencias que permiten el uso con atribución (sin "no comercial", que Commons tampoco admite).
const LICENCIA_VALIDA = /^(CC0|Public domain|CC BY(-SA)? [1-4]\.0)/i;

function sinHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, " ").trim();
}

type Pagina = {
  title: string;
  index?: number;
  imageinfo?: {
    thumburl: string;
    thumbwidth: number;
    thumbheight: number;
    descriptionurl: string;
    extmetadata: Record<string, { value: string } | undefined>;
  }[];
};

function aCandidata(p: Pagina): Candidata | null {
  const ii = p.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata;
  const licencia = sinHtml(m.LicenseShortName?.value ?? "");
  if (!LICENCIA_VALIDA.test(licencia)) return null;
  const autor = sinHtml(m.Artist?.value ?? "") || "Autor desconocido (Wikimedia Commons)";
  return {
    titulo: p.title,
    url: ii.thumburl,
    ancho: ii.thumbwidth,
    alto: ii.thumbheight,
    autor: autor.slice(0, 120),
    licencia,
    licenciaUrl: m.LicenseUrl?.value ?? null,
    fuente: ii.descriptionurl,
  };
}

const PROPS = "prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=800&iiextmetadatafilter=LicenseShortName|Artist|LicenseUrl";

export async function buscar(texto: string, cuantas = 4): Promise<Candidata[]> {
  const q = encodeURIComponent(`filetype:bitmap filew:>900 ${texto}`);
  const r = await fetch(`${API}?action=query&format=json&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=15&${PROPS}`, { headers: CABECERAS });
  if (!r.ok) throw new Error(`Commons respondió ${r.status}`);
  const j: { query?: { pages: Record<string, Pagina> } } = await r.json();
  const paginas = Object.values(j.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  // Mejor apaisadas: las tarjetas son 4:3.
  return paginas
    .map(aCandidata)
    .filter((c): c is Candidata => c !== null && c.ancho >= c.alto * 0.9)
    .slice(0, cuantas);
}

export async function porTitulo(titulo: string): Promise<Candidata> {
  const r = await fetch(`${API}?action=query&format=json&titles=${encodeURIComponent(titulo)}&${PROPS}`, { headers: CABECERAS });
  const j: { query: { pages: Record<string, Pagina> } } = await r.json();
  const c = aCandidata(Object.values(j.query.pages)[0]);
  if (!c) throw new Error(`Sin licencia válida o no existe: ${titulo}`);
  return c;
}

export async function descargar(url: string): Promise<Buffer> {
  const r = await fetch(url, { headers: CABECERAS });
  if (!r.ok) throw new Error(`No se pudo descargar ${url}: ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
