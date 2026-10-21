import type { SetLog } from "@/lib/training/progression";

export type SetConFecha = SetLog & { date: string };
export type Punto = { date: string; value: number };

const redondear = (n: number) => Math.round(n * 100) / 100;

export function addDays(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// Lunes de la semana de una fecha (AAAA-MM-DD).
export function weekStartOf(fecha: string): string {
  const dia = new Date(`${fecha}T00:00:00Z`).getUTCDay(); // 0 = domingo
  return addDays(fecha, -((dia + 6) % 7));
}

// Volumen (peso × repeticiones) de la semana que empieza en weekStart (lunes a domingo).
export function weeklyVolume(sets: SetConFecha[], weekStart: string): number {
  const fin = addDays(weekStart, 6);
  return redondear(sets.filter((s) => s.date >= weekStart && s.date <= fin).reduce((t, s) => t + s.weight_kg * s.reps, 0));
}

// Volumen de las n semanas que terminan en la que empieza en ultimaSemana (de más antigua a más reciente).
export function weeklyVolumeSeries(sets: SetConFecha[], ultimaSemana: string, n: number): Punto[] {
  return Array.from({ length: n }, (_, i) => {
    const inicio = addDays(ultimaSemana, -7 * (n - 1 - i));
    return { date: inicio, value: weeklyVolume(sets, inicio) };
  });
}

// Días seguidos entrenando hasta hoy. Si hoy aún no hay entreno pero ayer sí, cuenta desde ayer.
export function currentStreak(trainedDates: string[], today: string): number {
  const dias = new Set(trainedDates.filter((d) => d <= today));
  let dia = dias.has(today) ? today : addDays(today, -1);
  let racha = 0;
  while (dias.has(dia)) {
    racha++;
    dia = addDays(dia, -1);
  }
  return racha;
}

// Media móvil de los últimos `window` puntos (los primeros usan los que haya).
export function movingAverage(points: Punto[], window: number): Punto[] {
  if (!Number.isInteger(window) || window < 1) throw new RangeError(`Ventana no válida: ${window}`);
  const ordenados = [...points].sort((a, b) => a.date.localeCompare(b.date));
  return ordenados.map((p, i) => {
    const tramo = ordenados.slice(Math.max(0, i - window + 1), i + 1);
    return { date: p.date, value: redondear(tramo.reduce((t, x) => t + x.value, 0) / tramo.length) };
  });
}
