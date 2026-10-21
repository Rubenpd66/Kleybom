import { describe, expect, it } from "vitest";
import { nuevaSesion, sessionReducer, type ActiveSession } from "./session";

const base = (): ActiveSession => nuevaSesion({ date: "2026-11-02" });
const log = (s: ActiveSession, exercise_id: number, weight_kg: number, reps: number, rpe?: number) =>
  sessionReducer(s, { type: "logSet", exercise_id, weight_kg, reps, rpe });

describe("sessionReducer", () => {
  it("registra las series en orden y numera por ejercicio", () => {
    let s = log(base(), 1, 60, 8);
    s = log(s, 1, 62.5, 8);
    s = log(s, 2, 20, 12);
    s = log(s, 1, 65, 6, 8.5);
    expect(s.sets.map((x) => [x.exercise_id, x.set_index, x.weight_kg])).toEqual([
      [1, 1, 60],
      [1, 2, 62.5],
      [2, 1, 20],
      [1, 3, 65],
    ]);
    expect(s.sets[3].rpe).toBe(8.5);
    expect(s.error).toBeNull();
  });

  it("rechaza peso negativo o de más de 1000 kg, reps imposibles y RPE fuera de 1–10", () => {
    for (const [w, r, rpe] of [[-1, 8], [1001, 5], [50, 0], [50, 2.5], [50, 201], [50, 8, 11]] as const) {
      const s = log(base(), 1, w, r, rpe);
      expect(s.sets).toEqual([]);
      expect(s.error).not.toBeNull();
    }
  });

  it("peso 0 (peso corporal) es válido", () => {
    expect(log(base(), 1, 0, 15).sets).toHaveLength(1);
  });

  it("un registro válido limpia el error anterior", () => {
    const s = log(log(base(), 1, -5, 8), 1, 50, 8);
    expect(s.error).toBeNull();
  });

  it("edita una serie y valida los valores nuevos", () => {
    const s = log(base(), 1, 60, 8);
    const ok = sessionReducer(s, { type: "editSet", exercise_id: 1, set_index: 1, weight_kg: 70, reps: 6 });
    expect(ok.sets[0]).toMatchObject({ weight_kg: 70, reps: 6 });
    const malo = sessionReducer(s, { type: "editSet", exercise_id: 1, set_index: 1, weight_kg: 2000, reps: 6 });
    expect(malo.sets[0].weight_kg).toBe(60);
    expect(malo.error).not.toBeNull();
  });

  it("borra una serie y renumera las de ese ejercicio", () => {
    let s = log(log(log(base(), 1, 60, 8), 1, 62.5, 8), 1, 65, 6);
    s = sessionReducer(s, { type: "deleteSet", exercise_id: 1, set_index: 2 });
    expect(s.sets.map((x) => [x.set_index, x.weight_kg])).toEqual([
      [1, 60],
      [2, 65],
    ]);
  });

  it("terminar sin series no crea registro (no se marca como terminada)", () => {
    const s = sessionReducer(base(), { type: "finish" });
    expect(s.finished).toBe(false);
    expect(s.error).not.toBeNull();
  });

  it("terminar con series marca la sesión como terminada; después no se puede registrar más", () => {
    let s = sessionReducer(log(base(), 1, 60, 8), { type: "finish" });
    expect(s.finished).toBe(true);
    s = log(s, 1, 60, 8);
    expect(s.sets).toHaveLength(1);
  });
});
