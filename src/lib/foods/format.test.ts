import { describe, expect, it } from "vitest";
import { formatNutriente, repartoCalorias } from "./format";

describe("formatNutriente", () => {
  it("un dato que falta se muestra como '—', nunca como 0", () => {
    expect(formatNutriente(null, "g")).toBe("—");
  });

  it("usa la coma decimal y como mucho un decimal", () => {
    expect(formatNutriente(1.09, "g")).toBe("1,1 g");
    expect(formatNutriente(22.8, "g")).toBe("22,8 g");
    expect(formatNutriente(89, "kcal")).toBe("89 kcal");
    expect(formatNutriente(0, "mg")).toBe("0 mg");
  });

  it("los miles llevan separador", () => {
    expect(formatNutriente(38758, "mg")).toBe("38.758 mg");
  });
});

describe("repartoCalorias", () => {
  it("calcula el % de calorías de proteína, hidratos y grasa (4/4/9 kcal por gramo)", () => {
    // 10 g proteína (40 kcal), 20 g hidratos (80 kcal), 10 g grasa (90 kcal) → 210 kcal
    expect(repartoCalorias({ protein_g: 10, carbs_g: 20, fat_g: 10 })).toEqual({
      proteina: 19,
      hidratos: 38,
      grasa: 43,
    });
  });

  it("devuelve null si falta algún macronutriente o si no hay calorías", () => {
    expect(repartoCalorias({ protein_g: 10, carbs_g: null, fat_g: 10 })).toBeNull();
    expect(repartoCalorias({ protein_g: 0, carbs_g: 0, fat_g: 0 })).toBeNull();
  });

  it("los porcentajes siempre suman 100", () => {
    const r = repartoCalorias({ protein_g: 1.09, carbs_g: 22.8, fat_g: 0.33 })!;
    expect(r.proteina + r.hidratos + r.grasa).toBe(100);
  });
});
