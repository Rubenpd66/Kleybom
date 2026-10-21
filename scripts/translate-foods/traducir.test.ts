import { describe, expect, it } from "vitest";
import {
  cargarCabezas,
  cargarDiccionario,
  cargarTraduccionesManuales,
  concordar,
  segmentos,
  traducirNombre,
  type Cabeza,
} from "./traducir";

describe("segmentos", () => {
  it("separa por comas pero no dentro de paréntesis", () => {
    expect(segmentos("Fruit cocktail, (peach and pineapple, and pear), canned")).toEqual([
      "Fruit cocktail",
      "(peach and pineapple, and pear)",
      "canned",
    ]);
  });

  it("limpia espacios dobles y segmentos vacíos", () => {
    expect(segmentos("Beef,  Australian, , raw")).toEqual(["Beef", "Australian", "raw"]);
  });
});

describe("concordar", () => {
  it("aplica género y número", () => {
    expect(concordar("crud@", "m")).toBe("crudo");
    expect(concordar("crud@", "f")).toBe("cruda");
    expect(concordar("crud@", "mp")).toBe("crudos");
    expect(concordar("crud@", "fp")).toBe("crudas");
    expect(concordar("verde#", "fp")).toBe("verdes");
    expect(concordar("verde#", "m")).toBe("verde");
  });
});

describe("traducirNombre", () => {
  const cabezas = new Map<string, Cabeza>([
    ["Apples", { es: "Manzanas", genero: "fp" }],
    ["Beef", { es: "Vacuno", genero: "m" }],
    ["Sage Valley", { es: "@MARCA", genero: "m" }],
  ]);
  const dic = new Map([
    ["raw", "crud@"],
    ["canned", "en conserva"],
    ["sweetened", "azucarad@"],
    ["ground", "picad@"],
  ]);

  it("traduce y concuerda con el alimento principal", () => {
    expect(traducirNombre("Apples, canned, sweetened", cabezas, dic)).toEqual({
      nombre: "Manzanas, en conserva, azucaradas",
      faltan: [],
      marca: false,
    });
    expect(traducirNombre("Beef, ground, raw", cabezas, dic).nombre).toBe("Vacuno, picado, crudo");
  });

  it("si falta un segmento lo deja en inglés y lo avisa", () => {
    const r = traducirNombre("Beef, mystery cut, raw", cabezas, dic);
    expect(r.nombre).toBe("Vacuno, mystery cut, crudo");
    expect(r.faltan).toEqual(["mystery cut"]);
  });

  it("detecta las marcas", () => {
    expect(traducirNombre("Sage Valley, cookies", cabezas, dic).marca).toBe(true);
  });
});

describe("archivos de traducción del proyecto", () => {
  const dir = new URL("./", import.meta.url);
  const cabezas = cargarCabezas(dir);
  const dic = cargarDiccionario(dir);
  const manuales = cargarTraduccionesManuales(dir);

  it("se cargan sin líneas mal formadas", () => {
    expect(cabezas.size).toBeGreaterThan(600);
    expect(dic.size).toBeGreaterThan(2000);
    expect(manuales.size).toBe(400);
    for (const [, c] of cabezas) expect(["m", "f", "mp", "fp"]).toContain(c.genero);
    for (const [en, es] of dic) {
      expect(en.length, en).toBeGreaterThan(0);
      expect(es.length, en).toBeGreaterThan(0);
    }
  });

  it("los ejemplos reales salen bien", () => {
    const t = (n: string) => traducirNombre(n, cabezas, dic).nombre;
    expect(t("Beef, ground, 80% lean meat / 20% fat, raw")).toBe("Vacuno, picado, 80 % magro / 20 % grasa, crudo");
    expect(t("Apples, raw, with skin")).toBe("Manzanas, crudas, con piel");
    expect(t("Milk, whole, 3.25% milkfat, with added vitamin D")).toBe(
      "Leche, entera, 3,25 % de grasa láctea, con vitamina D añadida",
    );
    expect(t("Lentils, mature seeds, cooked, boiled, with salt")).toBe(
      "Lentejas, semillas maduras, cocinadas, hervidas, con sal",
    );
    // Concordancia en frases ("baja en grasa", "lista para servir").
    expect(t("Sour cream, reduced fat")).toBe("Nata agria, baja en grasa");
    expect(t("Sauce, hoisin, ready-to-serve")).toBe("Salsa, hoisin, lista para servir");
    // Traducción que depende del alimento: pechuga en aves, pecho en cordero.
    expect(t("Chicken, broilers or fryers, breast, meat only, raw")).toBe(
      "Pollo, para asar o freír, pechuga, solo carne, crudo",
    );
    expect(t("Lamb, New Zealand, imported, breast, separable lean only, raw")).toBe(
      "Cordero, de Nueva Zelanda, importado, pecho, solo magro, crudo",
    );
    expect(t("Beans, snap, green, canned, no salt added")).toBe(
      "Alubias, de vaina (judías verdes), verdes, en conserva, sin sal añadida",
    );
  });
});
