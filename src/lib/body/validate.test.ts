import { describe, expect, it } from "vitest";
import { validateMeasurement, type MeasurementDraft } from "./validate";

const vacio: MeasurementDraft = { date: "2026-11-02", weight_kg: null, waist_cm: null, hip_cm: null, chest_cm: null };

describe("validateMeasurement", () => {
  it("acepta valores razonables", () => {
    expect(validateMeasurement({ ...vacio, weight_kg: 72.5, waist_cm: 82 })).toEqual({ ok: true });
    expect(validateMeasurement({ ...vacio, chest_cm: 98 })).toEqual({ ok: true });
  });

  it("peso de 3 kg o de 700 kg da error", () => {
    for (const w of [3, 700]) {
      const r = validateMeasurement({ ...vacio, weight_kg: w });
      expect(r.ok).toBe(false);
      expect(!r.ok && r.errors[0]).toMatch(/peso/i);
    }
  });

  it("cintura 0 da error", () => {
    const r = validateMeasurement({ ...vacio, waist_cm: 0 });
    expect(!r.ok && r.errors[0]).toMatch(/cintura/i);
  });

  it("todos los campos vacíos dan error", () => {
    const r = validateMeasurement(vacio);
    expect(!r.ok && r.errors[0]).toMatch(/al menos un dato/i);
  });

  it("una fecha inválida o futura da error", () => {
    expect(validateMeasurement({ ...vacio, date: "2026-02-30", weight_kg: 70 }).ok).toBe(false);
    expect(validateMeasurement({ ...vacio, date: "2999-01-01", weight_kg: 70 }, "2026-11-02").ok).toBe(false);
  });

  it("devuelve todos los errores a la vez", () => {
    const r = validateMeasurement({ ...vacio, weight_kg: 3, hip_cm: 999 });
    expect(!r.ok && r.errors).toHaveLength(2);
  });

  it("valores que no son número dan error", () => {
    expect(validateMeasurement({ ...vacio, weight_kg: Number.NaN }).ok).toBe(false);
  });
});
