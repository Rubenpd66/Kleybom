import { describe, expect, it } from "vitest";
import { addDays, currentStreak, movingAverage, weekStartOf, weeklyVolume, weeklyVolumeSeries, type SetConFecha } from "./aggregate";

const s = (date: string, weight_kg: number, reps: number): SetConFecha => ({ date, exercise_id: 1, weight_kg, reps });

describe("fechas", () => {
  it("addDays cruza meses y años", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });
  it("weekStartOf devuelve el lunes de esa semana", () => {
    expect(weekStartOf("2026-11-04")).toBe("2026-11-02"); // miércoles → lunes
    expect(weekStartOf("2026-11-02")).toBe("2026-11-02");
    expect(weekStartOf("2026-11-08")).toBe("2026-11-02"); // domingo
  });
});

describe("weeklyVolume", () => {
  it("sin datos es 0", () => {
    expect(weeklyVolume([], "2026-11-02")).toBe(0);
  });
  it("suma peso × reps de lunes a domingo, y nada fuera de esa semana", () => {
    const sets = [s("2026-11-01", 100, 5), s("2026-11-02", 60, 10), s("2026-11-08", 50, 4), s("2026-11-09", 100, 1)];
    expect(weeklyVolume(sets, "2026-11-02")).toBe(800);
  });
});

describe("weeklyVolumeSeries", () => {
  it("devuelve n semanas seguidas, con 0 en las que no hay datos", () => {
    const r = weeklyVolumeSeries([s("2026-10-27", 10, 10), s("2026-11-03", 20, 5)], "2026-11-02", 3);
    expect(r).toEqual([
      { date: "2026-10-19", value: 0 },
      { date: "2026-10-26", value: 100 },
      { date: "2026-11-02", value: 100 },
    ]);
  });
});

describe("currentStreak", () => {
  it("sin datos es 0", () => {
    expect(currentStreak([], "2026-11-02")).toBe(0);
  });
  it("cuenta días seguidos hasta hoy, sin importar repeticiones ni orden", () => {
    expect(currentStreak(["2026-11-02", "2026-10-31", "2026-11-01", "2026-11-01"], "2026-11-02")).toBe(3);
  });
  it("si hoy no hay entreno pero ayer sí, cuenta desde ayer", () => {
    expect(currentStreak(["2026-11-01", "2026-10-31"], "2026-11-02")).toBe(2);
  });
  it("si el último entreno fue anteayer, la racha es 0", () => {
    expect(currentStreak(["2026-10-31"], "2026-11-02")).toBe(0);
  });
  it("la racha cruza el fin de mes", () => {
    expect(currentStreak(["2026-10-30", "2026-10-31", "2026-11-01"], "2026-11-01")).toBe(3);
  });
  it("ignora fechas futuras", () => {
    expect(currentStreak(["2026-11-05", "2026-11-02"], "2026-11-02")).toBe(1);
  });
});

describe("movingAverage", () => {
  const p = (date: string, value: number) => ({ date, value });
  it("lista vacía → lista vacía", () => {
    expect(movingAverage([], 7)).toEqual([]);
  });
  it("media de los últimos n puntos, ordenados por fecha", () => {
    const r = movingAverage([p("2026-11-03", 72), p("2026-11-01", 70), p("2026-11-02", 71)], 2);
    expect(r).toEqual([p("2026-11-01", 70), p("2026-11-02", 70.5), p("2026-11-03", 71.5)]);
  });
  it("una ventana mayor que los datos devuelve lo que hay sin fallar", () => {
    expect(movingAverage([p("2026-11-01", 70), p("2026-11-02", 72)], 30)).toEqual([p("2026-11-01", 70), p("2026-11-02", 71)]);
  });
  it("una ventana menor que 1 da error", () => {
    expect(() => movingAverage([p("2026-11-01", 70)], 0)).toThrow(RangeError);
  });
});
