// Objetivos diarios de calorías y macronutrientes. Fórmulas, valores y fuentes en docs/formulas.md.

export type Sexo = "hombre" | "mujer";
export type Actividad = "sedentario" | "ligero" | "moderado" | "alto";
export type Objetivo = "perder" | "mantener" | "ganar";

export type TargetsInput = {
  sex: Sexo;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity: Actividad;
  goal: Objetivo;
};

export type Targets = { kcal: number; protein_g: number; carbs_g: number; fat_g: number; floorApplied: boolean };

// Multiplicadores según los rangos de nivel de actividad de FAO/OMS/UNU (2004), tabla 5.3.
export const FACTOR_ACTIVIDAD: Record<Actividad, number> = { sedentario: 1.4, ligero: 1.55, moderado: 1.85, alto: 2.2 };
export const AJUSTE_OBJETIVO: Record<Objetivo, number> = { perder: -0.15, mantener: 0, ganar: 0.1 };
// Mínimo de seguridad (regla prudente, sin guía oficial: ver docs/formulas.md).
export const MINIMO_KCAL: Record<Sexo, number> = { mujer: 1200, hombre: 1500 };
export const RANGOS = { age: [18, 100], height_cm: [120, 230], weight_kg: [30, 300] } as const;

const PROTEINA_G_KG: Record<Objetivo, number> = { perder: 1.6, mantener: 1.4, ganar: 1.6 };
const PROTEINA_SEDENTARIO_G_KG = 1.0;
const GRASA_PCT = 0.3;

function comprobar(nombre: keyof typeof RANGOS, valor: number) {
  const [min, max] = RANGOS[nombre];
  if (!Number.isFinite(valor) || valor < min || valor > max) {
    throw new RangeError(`${nombre} fuera de rango (${min}–${max}): ${valor}`);
  }
}

export function computeTargets(p: TargetsInput): Targets {
  comprobar("age", p.age);
  comprobar("height_cm", p.height_cm);
  comprobar("weight_kg", p.weight_kg);

  // Mifflin-St Jeor (1990).
  const reposo = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age + (p.sex === "hombre" ? 5 : -161);
  const calculadas = reposo * FACTOR_ACTIVIDAD[p.activity] * (1 + AJUSTE_OBJETIVO[p.goal]);
  const floorApplied = calculadas < MINIMO_KCAL[p.sex];
  const kcal = Math.round(Math.max(calculadas, MINIMO_KCAL[p.sex]) / 10) * 10;

  const gramosKg = p.activity === "sedentario" ? PROTEINA_SEDENTARIO_G_KG : PROTEINA_G_KG[p.goal];
  const protein_g = Math.round(gramosKg * p.weight_kg);
  const kcalGrasa = kcal * GRASA_PCT;
  const fat_g = Math.round(kcalGrasa / 9);
  const carbs_g = Math.max(0, Math.round((kcal - protein_g * 4 - kcalGrasa) / 4));

  return { kcal, protein_g, carbs_g, fat_g, floorApplied };
}
