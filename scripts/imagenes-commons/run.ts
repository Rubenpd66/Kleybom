// Fotos de Wikimedia Commons para alimentos y recetas, con su autoría.
// Uso:
//   node scripts/imagenes-commons/run.ts alimentos --candidatas <carpeta>   (baja 4 candidatas por foto para revisarlas)
//   node scripts/imagenes-commons/run.ts alimentos                          (guarda la elegida o, si no hay, la primera)
// Salida: public/img/<grupo>/<clave>.webp y la autoría en src/lib/<grupo>/imagenes.json.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { ALIMENTOS, RECETAS, type Busqueda } from "./busquedas.ts";
import { buscar, descargar, porTitulo, type Candidata } from "./commons.ts";

const GRUPOS: Record<string, { busquedas: Record<string, Busqueda>; json: string }> = {
  alimentos: { busquedas: ALIMENTOS, json: "src/lib/foods/imagenes.json" },
  recetas: { busquedas: RECETAS, json: "src/lib/recipes/imagenes.json" },
};

const [grupo, opcion, carpeta] = process.argv.slice(2);
const config = GRUPOS[grupo];
if (!config) throw new Error(`Grupo desconocido: ${grupo}. Usa: ${Object.keys(GRUPOS).join(", ")}`);
const soloEstas = process.argv.find((a) => a.startsWith("--solo="))?.slice(7).split(",");

// 800 × 600 recortada al centro: todas las tarjetas iguales.
const aWebp = (b: Buffer) => sharp(b).resize(800, 600, { fit: "cover", position: "attention" }).webp({ quality: 74 }).toBuffer();

async function candidatas(dir: string) {
  await mkdir(dir, { recursive: true });
  const indice: Record<string, Candidata[]> = {};
  for (const [clave, b] of Object.entries(config.busquedas)) {
    if (soloEstas ? !soloEstas.includes(clave) : b.elegida) continue;
    const lista = await buscar(b.buscar);
    indice[clave] = lista;
    for (const [i, c] of lista.entries()) await writeFile(`${dir}/${clave}~${i}.webp`, await aWebp(await descargar(c.url)));
    console.log(`${clave}: ${lista.length}`);
  }
  await writeFile(`${dir}/indice.json`, JSON.stringify(indice, null, 2));
}

async function guardar() {
  const salida = `public/img/${grupo}`;
  await mkdir(salida, { recursive: true });
  const autoria: Record<string, { autor: string; licencia: string; licenciaUrl: string | null; fuente: string }> = {};
  for (const [clave, b] of Object.entries(config.busquedas)) {
    const c = b.elegida ? await porTitulo(b.elegida) : (await buscar(b.buscar, 1))[0];
    if (!c) {
      console.warn(`Sin foto para ${clave}`);
      continue;
    }
    await writeFile(`${salida}/${clave}.webp`, await aWebp(await descargar(c.url)));
    autoria[clave] = { autor: c.autor, licencia: c.licencia, licenciaUrl: c.licenciaUrl, fuente: c.fuente };
  }
  await writeFile(config.json, JSON.stringify(autoria, null, 2) + "\n");
  console.log(`${Object.keys(autoria).length} fotos en ${salida}`);
}

await (opcion === "--candidatas" ? candidatas(carpeta) : guardar());
