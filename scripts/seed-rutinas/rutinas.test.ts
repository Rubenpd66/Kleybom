import { describe, expect, it } from "vitest";
import { validateRoutine } from "../../src/lib/routines/validate";
import { PLANTILLAS, aBorrador } from "./rutinas";

describe("plantillas de rutinas", () => {
  it("hay 6 plantillas con slug único", () => {
    expect(PLANTILLAS).toHaveLength(6);
    expect(new Set(PLANTILLAS.map((p) => p.slug)).size).toBe(6);
  });

  it.each(PLANTILLAS.map((p) => [p.slug, p] as const))("%s pasa validateRoutine", (_, p) => {
    expect(validateRoutine(aBorrador(p, () => 1))).toEqual({ ok: true });
  });

  it.each(PLANTILLAS.map((p) => [p.slug, p] as const))(
    "%s cabe en los límites de la base y no repite ejercicio en un día",
    (_, p) => {
      expect(p.description.length).toBeLessThanOrEqual(2000);
      expect(p.description).toMatch(/profesional sanitario/);
      expect(p.dias.length).toBeGreaterThanOrEqual(1);
      expect(p.dias.length).toBeLessThanOrEqual(7);
      for (const dia of p.dias) {
        const slugs = dia.map((x) => x.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
        for (const x of dia) expect((x.nota ?? "").length).toBeLessThanOrEqual(300);
      }
    },
  );

  it("cubre varios objetivos y niveles", () => {
    expect(new Set(PLANTILLAS.map((p) => p.goal)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(PLANTILLAS.map((p) => p.level))).toEqual(
      new Set(["principiante", "intermedio", "avanzado"]),
    );
  });
});
