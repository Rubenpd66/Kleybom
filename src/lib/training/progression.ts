export type SetLog = { exercise_id: number; weight_kg: number; reps: number };

const redondear = (n: number) => Math.round(n * 100) / 100;

// 1RM estimado con la fórmula de Epley: peso × (1 + reps / 30). Solo es fiable hasta ~30 repeticiones.
export function estimate1RM(weightKg: number, reps: number): number {
  if (!Number.isFinite(weightKg) || weightKg < 0) throw new RangeError(`Peso no válido: ${weightKg}`);
  if (!Number.isInteger(reps) || reps < 1 || reps > 30) throw new RangeError(`Repeticiones no válidas: ${reps}`);
  if (reps === 1) return weightKg;
  return redondear(weightKg * (1 + reps / 30));
}

const volumen = (series: SetLog[]) => series.reduce((t, x) => t + x.weight_kg * x.reps, 0);

function mejor1RM(series: SetLog[]): number {
  let mejor = 0;
  for (const x of series) {
    if (x.reps >= 1 && x.reps <= 30 && Number.isInteger(x.reps)) mejor = Math.max(mejor, estimate1RM(x.weight_kg, x.reps));
  }
  return mejor;
}

// Diferencias de volumen total y del mejor 1RM estimado entre dos sesiones.
export function compareSessions(prev: SetLog[], curr: SetLog[]): { volumeDelta: number; best1RMDelta: number } {
  return {
    volumeDelta: redondear(volumen(curr) - volumen(prev)),
    best1RMDelta: redondear(mejor1RM(curr) - mejor1RM(prev)),
  };
}
