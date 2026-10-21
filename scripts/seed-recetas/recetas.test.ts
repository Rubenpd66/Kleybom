import { describe, expect, it } from "vitest";
import { RECETAS } from "./recetas";

describe("recetas iniciales", () => {
  it("hay 10 con slug único", () => {
    expect(RECETAS).toHaveLength(10);
    expect(new Set(RECETAS.map((r) => r.slug)).size).toBe(10);
  });

  it.each(RECETAS.map((r) => [r.slug, r] as const))("%s cumple los límites de la base", (_, r) => {
    expect(r.name_es.length).toBeLessThanOrEqual(120);
    expect(r.description_es.length).toBeLessThanOrEqual(2000);
    expect(Number.isInteger(r.servings) && r.servings >= 1 && r.servings <= 20).toBe(true);
    expect(r.prep_minutes).toBeGreaterThan(0);
    expect(r.pasos.length).toBeGreaterThan(0);
    expect(r.ingredientes.length).toBeGreaterThan(0);
    for (const i of r.ingredientes) {
      expect(i.gramos).toBeGreaterThan(0);
      expect(i.gramos).toBeLessThanOrEqual(5000);
      expect((i.nota ?? "").length).toBeLessThanOrEqual(100);
    }
  });
});
