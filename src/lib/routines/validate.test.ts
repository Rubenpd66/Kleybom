import { describe, expect, it } from "vitest";
import { validateRoutine, type RoutineDraft } from "./validate";

const valida = (): RoutineDraft => ({
  name: "Cuerpo completo",
  goal: "fuerza",
  level: "principiante",
  days_per_week: 3,
  exercises: [
    { exercise_id: 1, day_index: 1, sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90 },
    { exercise_id: 2, day_index: 1, sets: 4, reps_min: 5, reps_max: 5, rest_seconds: 120 },
  ],
});

const conEjercicio = (cambios: Partial<RoutineDraft["exercises"][number]>): RoutineDraft => {
  const r = valida();
  r.exercises[0] = { ...r.exercises[0], ...cambios };
  return r;
};

function errores(r: RoutineDraft): string[] {
  const v = validateRoutine(r);
  return v.ok ? [] : v.errors;
}

describe("validateRoutine", () => {
  it("acepta una rutina válida", () => {
    expect(validateRoutine(valida())).toEqual({ ok: true });
  });

  it("rechaza series 0 y 21, y acepta los límites 1 y 20", () => {
    expect(errores(conEjercicio({ sets: 0 }))[0]).toMatch(/series/i);
    expect(errores(conEjercicio({ sets: 21 }))[0]).toMatch(/series/i);
    expect(validateRoutine(conEjercicio({ sets: 1 })).ok).toBe(true);
    expect(validateRoutine(conEjercicio({ sets: 20 })).ok).toBe(true);
  });

  it("rechaza repeticiones fuera de 1–100 o con mínimo mayor que máximo", () => {
    expect(errores(conEjercicio({ reps_min: 0 }))[0]).toMatch(/repeticiones/i);
    expect(errores(conEjercicio({ reps_max: 101 }))[0]).toMatch(/repeticiones/i);
    expect(errores(conEjercicio({ reps_min: 12, reps_max: 8 }))[0]).toMatch(/mínimo/i);
  });

  it("rechaza un descanso negativo o mayor de 600 s", () => {
    expect(errores(conEjercicio({ rest_seconds: -1 }))[0]).toMatch(/descanso/i);
    expect(errores(conEjercicio({ rest_seconds: 601 }))[0]).toMatch(/descanso/i);
    expect(validateRoutine(conEjercicio({ rest_seconds: 0 })).ok).toBe(true);
  });

  it("rechaza valores que no son números enteros", () => {
    expect(errores(conEjercicio({ sets: 2.5 }))[0]).toMatch(/series/i);
    expect(errores(conEjercicio({ sets: Number.NaN }))[0]).toMatch(/series/i);
  });

  it("rechaza una rutina sin ejercicios", () => {
    expect(errores({ ...valida(), exercises: [] })[0]).toMatch(/al menos un ejercicio/i);
  });

  it("rechaza un nombre vacío o solo con espacios, o de más de 100 caracteres", () => {
    expect(errores({ ...valida(), name: "" })[0]).toMatch(/nombre/i);
    expect(errores({ ...valida(), name: "   " })[0]).toMatch(/nombre/i);
    expect(errores({ ...valida(), name: "a".repeat(101) })[0]).toMatch(/nombre/i);
  });

  it("rechaza objetivo o nivel desconocidos y días fuera de 1–7", () => {
    expect(errores({ ...valida(), goal: "volar" as never })[0]).toMatch(/objetivo/i);
    expect(errores({ ...valida(), level: "dios" as never })[0]).toMatch(/nivel/i);
    expect(errores({ ...valida(), days_per_week: 8 })[0]).toMatch(/días/i);
  });

  it("rechaza un ejercicio asignado a un día fuera de 1–7", () => {
    expect(errores(conEjercicio({ day_index: 0 }))[0]).toMatch(/día/i);
  });

  it("devuelve todos los errores a la vez e indica de qué ejercicio hablan", () => {
    const r = valida();
    r.name = "";
    r.exercises[1] = { ...r.exercises[1], sets: 0, rest_seconds: -5 };
    const e = errores(r);
    expect(e).toHaveLength(3);
    expect(e.filter((x) => x.includes("Ejercicio 2"))).toHaveLength(2);
  });
});
