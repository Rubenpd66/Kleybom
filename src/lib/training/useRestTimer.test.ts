import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRestTimer } from "./useRestTimer";

describe("createRestTimer (reloj simulado)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-02T10:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("cuenta atrás segundo a segundo", () => {
    const t = createRestTimer();
    t.start(90);
    expect(t.get()).toEqual({ remaining: 90, running: true });
    vi.advanceTimersByTime(1000);
    expect(t.get().remaining).toBe(89);
    vi.advanceTimersByTime(30_000);
    expect(t.get().remaining).toBe(59);
  });

  it("se detiene en 0 y no baja de ahí", () => {
    const t = createRestTimer();
    t.start(3);
    vi.advanceTimersByTime(10_000);
    expect(t.get()).toEqual({ remaining: 0, running: false });
  });

  it("start(0) o negativo no arranca", () => {
    const t = createRestTimer();
    t.start(0);
    expect(t.get()).toEqual({ remaining: 0, running: false });
    t.start(-5);
    expect(t.get().running).toBe(false);
    t.start(Number.NaN);
    expect(t.get().running).toBe(false);
  });

  it("stop() lo para y pone a 0", () => {
    const t = createRestTimer();
    t.start(60);
    vi.advanceTimersByTime(5000);
    t.stop();
    expect(t.get()).toEqual({ remaining: 0, running: false });
    vi.advanceTimersByTime(5000);
    expect(t.get().remaining).toBe(0);
  });

  it("avisa a los suscriptores en cada cambio y al terminar", () => {
    const t = createRestTimer();
    const cambios: number[] = [];
    t.subscribe(() => cambios.push(t.get().remaining));
    t.start(2);
    vi.advanceTimersByTime(3000);
    expect(cambios).toEqual([2, 1, 0]);
  });

  it("volver a empezar reinicia la cuenta", () => {
    const t = createRestTimer();
    t.start(60);
    vi.advanceTimersByTime(20_000);
    t.start(90);
    expect(t.get().remaining).toBe(90);
  });

  it("cuenta bien aunque el navegador retrase los avisos (pestaña en segundo plano)", () => {
    const t = createRestTimer();
    t.start(60);
    vi.setSystemTime(new Date("2026-11-02T10:00:45Z")); // pasan 45 s sin avisos
    vi.advanceTimersByTime(1000);
    expect(t.get().remaining).toBe(14);
  });
});
