// Traducción por segmentos de los nombres de USDA ("Alimento, variante, preparación").
// - cabezas.tsv: primer segmento → nombre en español y género (m, f, mp, fp).
// - diccionario-*.tsv: resto de segmentos. "@" concuerda con el género (o/a/os/as) y "#" añade
//   la "s" del plural en adjetivos acabados en -e (verde/verdes).
// - "@MARCA" marca un producto de marca: el alimento se quita del catálogo.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export type Genero = "m" | "f" | "mp" | "fp";
export type Cabeza = { es: string; genero: Genero };

export const MARCA = "@MARCA";

const espacios = (s: string) => s.replace(/\s+/g, " ").trim();

// Separa por comas que no estén dentro de paréntesis.
export function segmentos(nombre: string): string[] {
  const partes: string[] = [];
  let actual = "";
  let nivel = 0;
  for (const c of nombre) {
    if (c === "(") nivel++;
    if (c === ")") nivel = Math.max(0, nivel - 1);
    if (c === "," && nivel === 0) {
      partes.push(actual);
      actual = "";
    } else actual += c;
  }
  partes.push(actual);
  return partes.map(espacios).filter(Boolean);
}

const TERMINACION: Record<Genero, { a: string; s: string }> = {
  m: { a: "o", s: "" },
  f: { a: "a", s: "" },
  mp: { a: "os", s: "s" },
  fp: { a: "as", s: "s" },
};

export function concordar(texto: string, genero: Genero): string {
  const t = TERMINACION[genero];
  return texto.replaceAll("@", t.a).replaceAll("#", t.s);
}

export type Resultado = { nombre: string; faltan: string[]; marca: boolean };

export function traducirNombre(
  nombreEn: string,
  cabezas: Map<string, Cabeza>,
  diccionario: Map<string, string>,
): Resultado {
  const [primero, ...resto] = segmentos(nombreEn);
  const faltan: string[] = [];
  const cabeza = cabezas.get(primero);
  if (!cabeza) faltan.push(primero);
  if (cabeza?.es === MARCA) return { nombre: MARCA, faltan, marca: true };
  const genero = cabeza?.genero ?? "m";

  const partes = [cabeza?.es ?? primero];
  for (const s of resto) {
    // Primero una traducción propia de ese alimento ("Lamb|breast"), luego la general.
    const es = diccionario.get(`${primero}|${s}`) ?? diccionario.get(s) ?? diccionario.get(s.toLowerCase());
    if (es === undefined) {
      faltan.push(s);
      partes.push(s);
    } else if (es === MARCA) {
      return { nombre: MARCA, faltan, marca: true };
    } else {
      partes.push(concordar(es, genero));
    }
  }
  const nombre = partes.join(", ");
  return { nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1), faltan, marca: false };
}

// --- Carga de los archivos TSV ---

function filas(ruta: string): string[][] {
  return readFileSync(ruta, "utf-8")
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => l.split("\t"));
}

export function cargarCabezas(dir: URL): Map<string, Cabeza> {
  const m = new Map<string, Cabeza>();
  for (const [en, es, genero] of filas(join(fileURLToPath(dir), "cabezas.tsv"))) {
    m.set(espacios(en), { es: espacios(es), genero: (genero?.trim() || "m") as Genero });
  }
  return m;
}

export function cargarDiccionario(dir: URL): Map<string, string> {
  const m = new Map<string, string>();
  const base = fileURLToPath(dir);
  for (const archivo of readdirSync(base).filter((a) => /^diccionario-\d+\.tsv$/.test(a)).sort()) {
    for (const [en, es] of filas(join(base, archivo))) m.set(espacios(en), espacios(es));
  }
  return m;
}

// Traducciones hechas a mano de nombres completos (tienen prioridad): id_usda → nombre.
export function cargarTraduccionesManuales(dir: URL): Map<string, string> {
  const m = new Map<string, string>();
  const carpeta = join(fileURLToPath(dir), "traducciones");
  for (const archivo of readdirSync(carpeta).filter((a) => a.endsWith(".tsv")).sort()) {
    for (const [id, es] of filas(join(carpeta, archivo))) m.set(id.trim(), espacios(es));
  }
  return m;
}
