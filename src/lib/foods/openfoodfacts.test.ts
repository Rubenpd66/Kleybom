import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { esCodigoDeBarras, parseOffProduct } from "./openfoodfacts";

const fixture = (n: string) => JSON.parse(readFileSync(new URL(`./fixtures/${n}.json`, import.meta.url), "utf-8"));

describe("esCodigoDeBarras", () => {
  it("acepta EAN/UPC de 8 a 14 cifras", () => {
    expect(esCodigoDeBarras("3017620422003")).toBe(true);
    expect(esCodigoDeBarras("12345678")).toBe(true);
  });
  it("rechaza letras, espacios o longitudes raras", () => {
    for (const c of ["", "1234567", "123456789012345", "30176204220a3", "3017 6204"]) expect(esCodigoDeBarras(c)).toBe(false);
  });
});

describe("parseOffProduct", () => {
  it("convierte un producto con datos nutricionales (respuesta real)", () => {
    const r = parseOffProduct(fixture("off-con-nutrientes"));
    expect(r).toEqual({
      ok: true,
      producto: {
        codigo: "3017620422003",
        nombre: "Nutella",
        marca: "Nutella, Ferrero",
        imagen: expect.stringContaining("images.openfoodfacts.org"),
        nutrientes: {
          kcal: 539,
          protein_g: 6.3,
          carbs_g: 57.5,
          fat_g: 30.9,
          fiber_g: 0,
          sugar_g: 56.3,
          sodium_mg: 42.8,
        },
      },
    });
  });

  it("un producto sin datos nutricionales da un error claro", () => {
    expect(parseOffProduct(fixture("off-sin-nutrientes"))).toEqual({ ok: false, motivo: "sin-nutrientes" });
  });

  it("un código que no existe da 'no-encontrado'", () => {
    expect(parseOffProduct(fixture("off-no-encontrado"))).toEqual({ ok: false, motivo: "no-encontrado" });
  });

  it("si falta el sodio pero hay sal, lo calcula (sal / 2,5)", () => {
    const raw = fixture("off-con-nutrientes");
    delete raw.product.nutriments.sodium_100g;
    const r = parseOffProduct(raw);
    expect(r.ok && r.producto.nutrientes.sodium_mg).toBe(42.8);
  });

  it("si faltan las kcal pero hay kJ, las convierte", () => {
    const raw = fixture("off-con-nutrientes");
    delete raw.product.nutriments["energy-kcal_100g"];
    const r = parseOffProduct(raw);
    expect(r.ok && r.producto.nutrientes.kcal).toBe(538.2);
  });

  it("un valor que no es número o es imposible queda como null", () => {
    const raw = fixture("off-con-nutrientes");
    raw.product.nutriments.fat_100g = "mucho";
    raw.product.nutriments.proteins_100g = 150;
    const r = parseOffProduct(raw);
    expect(r.ok && r.producto.nutrientes.fat_g).toBeNull();
    expect(r.ok && r.producto.nutrientes.protein_g).toBeNull();
  });
});
