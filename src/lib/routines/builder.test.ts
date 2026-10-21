import { describe, expect, it } from "vitest";
import { builderReducer, emptyDraft } from "./builder";
import { validateRoutine, type RoutineDraft } from "./validate";

const dia = (d: RoutineDraft, n: number) => d.exercises.filter((e) => e.day_index === n);
const posiciones = (d: RoutineDraft, n: number) => dia(d, n).map((e) => e.position);
const ids = (d: RoutineDraft, n: number) => dia(d, n).map((e) => e.exercise_id);

// Estado con 3 ejercicios (ids 10, 20, 30) en el día 1 y uno (id 40) en el día 2.
function conEjercicios(): RoutineDraft {
  let s: RoutineDraft = { ...emptyDraft(), days_per_week: 2 };
  for (const [id, day] of [[10, 1], [20, 1], [30, 1], [40, 2]] as const) {
    s = builderReducer(s, { type: "addExercise", exercise_id: id, day_index: day });
  }
  return s;
}

describe("emptyDraft", () => {
  it("empieza sin ejercicios y no es válido hasta que se rellena", () => {
    const s = emptyDraft();
    expect(s.exercises).toEqual([]);
    expect(validateRoutine(s).ok).toBe(false);
  });
});

describe("addExercise", () => {
  it("añade al final del día con valores por defecto válidos y position consecutivo", () => {
    const s = conEjercicios();
    expect(ids(s, 1)).toEqual([10, 20, 30]);
    expect(posiciones(s, 1)).toEqual([1, 2, 3]);
    expect(posiciones(s, 2)).toEqual([1]);
    expect(dia(s, 2)[0]).toMatchObject({ sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 60 });
    expect(validateRoutine({ ...s, name: "Mi rutina" })).toEqual({ ok: true });
  });

  it("no hace nada si el día no existe", () => {
    const s = conEjercicios();
    expect(builderReducer(s, { type: "addExercise", exercise_id: 99, day_index: 3 })).toBe(s);
    expect(builderReducer(s, { type: "addExercise", exercise_id: 99, day_index: 0 })).toBe(s);
  });

  it("no modifica el estado anterior", () => {
    const s = conEjercicios();
    const copia = structuredClone(s);
    builderReducer(s, { type: "addExercise", exercise_id: 50, day_index: 1 });
    expect(s).toEqual(copia);
  });
});

describe("removeExercise", () => {
  it("quita un ejercicio del medio y renumera sin huecos", () => {
    const s = builderReducer(conEjercicios(), { type: "removeExercise", day_index: 1, position: 2 });
    expect(ids(s, 1)).toEqual([10, 30]);
    expect(posiciones(s, 1)).toEqual([1, 2]);
  });

  it("quitar el último ejercicio de un día deja el día vacío sin romper nada", () => {
    const s = builderReducer(conEjercicios(), { type: "removeExercise", day_index: 2, position: 1 });
    expect(dia(s, 2)).toEqual([]);
    expect(s.days_per_week).toBe(2);
    expect(ids(s, 1)).toEqual([10, 20, 30]);
  });

  it("una posición que no existe no cambia nada", () => {
    const s = conEjercicios();
    expect(builderReducer(s, { type: "removeExercise", day_index: 1, position: 9 })).toBe(s);
  });
});

describe("moveExercise", () => {
  it("reordena dentro del día y mantiene position consecutivo", () => {
    const s = builderReducer(conEjercicios(), { type: "moveExercise", day_index: 1, from: 1, to: 3 });
    expect(ids(s, 1)).toEqual([20, 30, 10]);
    expect(posiciones(s, 1)).toEqual([1, 2, 3]);
    const s2 = builderReducer(s, { type: "moveExercise", day_index: 1, from: 3, to: 1 });
    expect(ids(s2, 1)).toEqual([10, 20, 30]);
  });

  it("mover fuera de rango no cambia nada", () => {
    const s = conEjercicios();
    expect(builderReducer(s, { type: "moveExercise", day_index: 1, from: 1, to: 4 })).toBe(s);
    expect(builderReducer(s, { type: "moveExercise", day_index: 1, from: 1, to: 0 })).toBe(s);
    expect(builderReducer(s, { type: "moveExercise", day_index: 1, from: 5, to: 1 })).toBe(s);
  });

  it("mover a la misma posición no cambia nada", () => {
    const s = conEjercicios();
    expect(builderReducer(s, { type: "moveExercise", day_index: 1, from: 2, to: 2 })).toBe(s);
  });
});

describe("setSets / setReps / setRest", () => {
  it("cambia las series del ejercicio indicado", () => {
    const s = builderReducer(conEjercicios(), { type: "setSets", day_index: 1, position: 2, sets: 5 });
    expect(dia(s, 1)[1].sets).toBe(5);
    expect(dia(s, 1)[0].sets).toBe(3);
  });

  it("las series se quedan entre 1 y 20 y son enteras", () => {
    const base = conEjercicios();
    const con = (sets: number) =>
      dia(builderReducer(base, { type: "setSets", day_index: 1, position: 1, sets }), 1)[0].sets;
    expect(con(0)).toBe(1);
    expect(con(99)).toBe(20);
    expect(con(3.7)).toBe(4);
    expect(con(Number.NaN)).toBe(3);
  });

  it("las repeticiones se quedan entre 1 y 100 y el mínimo nunca supera al máximo", () => {
    const base = conEjercicios();
    const r = (min: number, max: number) =>
      dia(builderReducer(base, { type: "setReps", day_index: 1, position: 1, reps_min: min, reps_max: max }), 1)[0];
    expect(r(5, 8)).toMatchObject({ reps_min: 5, reps_max: 8 });
    expect(r(0, 500)).toMatchObject({ reps_min: 1, reps_max: 100 });
    expect(r(12, 8)).toMatchObject({ reps_min: 12, reps_max: 12 });
  });

  it("el descanso se queda entre 0 y 600 s", () => {
    const base = conEjercicios();
    const d = (rest_seconds: number) =>
      dia(builderReducer(base, { type: "setRest", day_index: 1, position: 1, rest_seconds }), 1)[0].rest_seconds;
    expect(d(90)).toBe(90);
    expect(d(-5)).toBe(0);
    expect(d(1000)).toBe(600);
  });

  it("un ejercicio que no existe no cambia nada", () => {
    const s = conEjercicios();
    expect(builderReducer(s, { type: "setSets", day_index: 1, position: 9, sets: 5 })).toBe(s);
  });
});

describe("addDay / removeDay", () => {
  it("añade un día (máximo 7)", () => {
    const s = builderReducer(conEjercicios(), { type: "addDay" });
    expect(s.days_per_week).toBe(3);
    let t = s;
    for (let i = 0; i < 10; i++) t = builderReducer(t, { type: "addDay" });
    expect(t.days_per_week).toBe(7);
  });

  it("quitar un día borra sus ejercicios y recoloca los días siguientes", () => {
    let s = builderReducer(conEjercicios(), { type: "addDay" });
    s = builderReducer(s, { type: "addExercise", exercise_id: 50, day_index: 3 });
    s = builderReducer(s, { type: "removeDay", day_index: 1 });
    expect(s.days_per_week).toBe(2);
    expect(ids(s, 1)).toEqual([40]);
    expect(ids(s, 2)).toEqual([50]);
    expect(dia(s, 3)).toEqual([]);
    expect(posiciones(s, 1)).toEqual([1]);
  });

  it("no se puede quitar el único día ni un día que no existe", () => {
    const uno = { ...emptyDraft(), days_per_week: 1 };
    expect(builderReducer(uno, { type: "removeDay", day_index: 1 })).toBe(uno);
    const s = conEjercicios();
    expect(builderReducer(s, { type: "removeDay", day_index: 5 })).toBe(s);
  });
});

describe("setMeta", () => {
  it("cambia nombre, objetivo y nivel sin tocar los ejercicios", () => {
    const s = builderReducer(conEjercicios(), { type: "setMeta", name: "Mía", goal: "movilidad", level: "avanzado" });
    expect(s).toMatchObject({ name: "Mía", goal: "movilidad", level: "avanzado" });
    expect(s.exercises).toHaveLength(4);
  });
});
