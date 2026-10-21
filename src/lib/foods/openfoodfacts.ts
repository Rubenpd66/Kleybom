// Productos envasados de Open Food Facts (licencia ODbL). Se consultan en directo y NO se copian a
// nuestra tabla foods, para no mezclar bases de datos con la condición de "compartir igual".
// Siempre se muestra la atribución.
import type { Nutrientes } from "./queries";

export type ProductoOff = {
  codigo: string;
  nombre: string;
  marca: string | null;
  imagen: string | null;
  nutrientes: Nutrientes;
};

export type ResultadoOff = { ok: true; producto: ProductoOff } | { ok: false; motivo: "no-encontrado" | "sin-nutrientes" | "error" };

export const esCodigoDeBarras = (c: string) => /^\d{8,14}$/.test(c);

const redondear = (n: number) => Math.round(n * 10) / 10;

function valor(n: Record<string, unknown>, clave: string, max: number): number | null {
  const v = n[clave];
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > max) return null;
  return v;
}

export function parseOffProduct(json: unknown): ResultadoOff {
  const raiz = json as { status?: number; product?: Record<string, unknown> } | null;
  const p = raiz?.product;
  if (!raiz || raiz.status !== 1 || !p) return { ok: false, motivo: "no-encontrado" };

  const n = (p.nutriments ?? {}) as Record<string, unknown>;
  const kj = valor(n, "energy-kj_100g", 4200);
  const kcal = valor(n, "energy-kcal_100g", 1000) ?? (kj === null ? null : redondear(kj / 4.184));
  const sodioG = valor(n, "sodium_100g", 100);
  const salG = valor(n, "salt_100g", 100);
  const sodium_mg = sodioG !== null ? redondear(sodioG * 1000) : salG !== null ? redondear((salG / 2.5) * 1000) : null;

  const nutrientes: Nutrientes = {
    kcal,
    protein_g: valor(n, "proteins_100g", 100),
    carbs_g: valor(n, "carbohydrates_100g", 100),
    fat_g: valor(n, "fat_100g", 100),
    fiber_g: valor(n, "fiber_100g", 100),
    sugar_g: valor(n, "sugars_100g", 100),
    sodium_mg,
  };
  if ([nutrientes.kcal, nutrientes.protein_g, nutrientes.carbs_g, nutrientes.fat_g].every((v) => v === null)) {
    return { ok: false, motivo: "sin-nutrientes" };
  }

  const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  return {
    ok: true,
    producto: {
      codigo: String(p.code ?? ""),
      nombre: texto(p.product_name_es) ?? texto(p.product_name) ?? "Producto sin nombre",
      marca: texto(p.brands),
      imagen: texto(p.image_front_small_url),
      nutrientes,
    },
  };
}

const CAMPOS = "code,product_name,product_name_es,brands,nutriments,image_front_small_url";

// Open Food Facts pide identificar la aplicación en el User-Agent.
export async function fetchOffProduct(codigo: string): Promise<ResultadoOff> {
  if (!esCodigoDeBarras(codigo)) return { ok: false, motivo: "no-encontrado" };
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${codigo}?fields=${CAMPOS}`, {
      headers: { "User-Agent": "Forja/0.3 (https://forja-five-zeta.vercel.app)" },
      next: { revalidate: 86400 },
    });
    if (r.status === 404) return { ok: false, motivo: "no-encontrado" };
    if (!r.ok) return { ok: false, motivo: "error" };
    return parseOffProduct(await r.json());
  } catch {
    return { ok: false, motivo: "error" };
  }
}
