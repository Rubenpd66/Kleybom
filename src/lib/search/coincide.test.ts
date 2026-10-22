import { describe, expect, it } from "vitest";
import { coincide, ordenarPorParecido } from "./coincide";

describe("coincide", () => {
  it("encuentra todas las palabras sin tildes, mayúsculas ni orden", () => {
    expect(coincide("Press de banca", "BANCA press")).toBe(true);
    expect(coincide("Calculadora de macros", "calculadora")).toBe(true);
    expect(coincide("Guía de meditación", "meditacion")).toBe(true);
  });
  it("no encuentra si falta alguna palabra o la búsqueda está vacía", () => {
    expect(coincide("Press de banca", "press militar")).toBe(false);
    expect(coincide("Press de banca", "   ")).toBe(false);
  });
});

describe("ordenarPorParecido", () => {
  it("pone primero lo que empieza por la búsqueda", () => {
    const r = ordenarPorParecido(["Pudin de arroz", "Arroz blanco"], (x) => x, "arroz");
    expect(r).toEqual(["Arroz blanco", "Pudin de arroz"]);
  });
});
