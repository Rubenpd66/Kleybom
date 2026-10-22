import { describe, expect, it } from "vitest";
import { finDelPlan, patronSemanal, planDeRutina } from "./plan";

const diaSemana = (clave: string) => ["D", "L", "M", "X", "J", "V", "S"][new Date(`${clave}T00:00:00Z`).getUTCDay()];

describe("plan de una rutina en el calendario", () => {
  it("3 días empezando en lunes: lunes, miércoles y viernes todo el mes", () => {
    // 2 de noviembre de 2026 es lunes.
    const plan = planDeRutina("2026-11-02", 3, "mes");
    expect(new Set(plan.map((p) => diaSemana(p.fecha)))).toEqual(new Set(["L", "X", "V"]));
    expect(plan.map((p) => p.fecha).slice(0, 4)).toEqual(["2026-11-02", "2026-11-04", "2026-11-06", "2026-11-09"]);
    expect(plan.at(-1)!.fecha).toBe("2026-11-30");
    expect(plan.every((p) => p.fecha.startsWith("2026-11"))).toBe(true);
  });

  it("los días de la rutina van rotando y se puede empezar por otro", () => {
    expect(planDeRutina("2026-11-02", 3, "mes").slice(0, 5).map((p) => p.dia)).toEqual([1, 2, 3, 1, 2]);
    expect(planDeRutina("2026-11-02", 3, "mes", 2).slice(0, 3).map((p) => p.dia)).toEqual([2, 3, 1]);
  });

  it("repartos habituales empezando en lunes", () => {
    const semana = (n: number) => planDeRutina("2026-11-02", n, "4semanas").slice(0, n).map((p) => diaSemana(p.fecha)).join("");
    expect(semana(1)).toBe("L");
    expect(semana(2)).toBe("LJ");
    expect(semana(4)).toBe("LMJV");
    expect(semana(5)).toBe("LMXVS");
    expect(semana(6)).toBe("LMXJVS");
    expect(semana(7)).toBe("LMXJVSD");
  });

  it("nunca hay más de dos días de entreno seguidos con 3 días o menos", () => {
    for (const n of [1, 2, 3]) {
      const offs = patronSemanal(n);
      for (let i = 1; i < offs.length; i++) expect(offs[i] - offs[i - 1]).toBeGreaterThanOrEqual(2);
    }
  });

  it("si se empieza otro día, el patrón arranca ese día y mantiene los descansos", () => {
    // 4 de noviembre de 2026 es miércoles: X, V, D...
    const plan = planDeRutina("2026-11-04", 3, "4semanas");
    expect(plan.slice(0, 3).map((p) => diaSemana(p.fecha))).toEqual(["X", "V", "D"]);
    expect(plan).toHaveLength(12);
  });

  it("solo este día, fin de mes y cuatro semanas", () => {
    expect(planDeRutina("2026-11-02", 3, "dia")).toEqual([{ fecha: "2026-11-02", dia: 1 }]);
    expect(finDelPlan("2026-02-10", "mes")).toBe("2026-02-28");
    expect(finDelPlan("2028-02-10", "mes")).toBe("2028-02-29");
    expect(finDelPlan("2026-12-20", "4semanas")).toBe("2027-01-16");
  });
});
