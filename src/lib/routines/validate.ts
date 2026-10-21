export const GOALS = ["fuerza", "hipertrofia", "perdida_grasa", "resistencia", "movilidad"] as const;
export const LEVELS = ["principiante", "intermedio", "avanzado"] as const;

export type Goal = (typeof GOALS)[number];
export type RoutineLevel = (typeof LEVELS)[number];

export type RoutineExerciseDraft = {
  exercise_id: number;
  day_index: number;
  // La rellena el constructor (1, 2, 3… dentro de cada día); es opcional para el resto del código.
  position?: number;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
};

export type RoutineDraft = {
  name: string;
  goal: Goal;
  level: RoutineLevel;
  days_per_week: number;
  exercises: RoutineExerciseDraft[];
};

const entero = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;

// Mismos límites que las restricciones de la base de datos (migración de rutinas).
export function validateRoutine(r: RoutineDraft): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const nombre = r.name.trim();
  if (nombre.length < 1 || nombre.length > 100)
    errors.push("El nombre de la rutina es obligatorio y puede tener hasta 100 caracteres.");
  if (!GOALS.includes(r.goal)) errors.push("Elige un objetivo de la lista.");
  if (!LEVELS.includes(r.level)) errors.push("Elige un nivel de la lista.");
  if (!entero(r.days_per_week, 1, 7)) errors.push("Los días por semana deben ser un número entre 1 y 7.");
  if (r.exercises.length === 0) errors.push("La rutina necesita al menos un ejercicio.");

  r.exercises.forEach((e, i) => {
    const n = `Ejercicio ${i + 1}`;
    if (!entero(e.day_index, 1, 7)) errors.push(`${n}: el día debe estar entre 1 y 7.`);
    if (!entero(e.sets, 1, 20)) errors.push(`${n}: las series deben ser un número entero entre 1 y 20.`);
    const minOk = entero(e.reps_min, 1, 100);
    const maxOk = entero(e.reps_max, 1, 100);
    if (!minOk || !maxOk) errors.push(`${n}: las repeticiones deben ser números enteros entre 1 y 100.`);
    else if (e.reps_min > e.reps_max)
      errors.push(`${n}: el mínimo de repeticiones no puede ser mayor que el máximo.`);
    if (!entero(e.rest_seconds, 0, 600))
      errors.push(`${n}: el descanso debe estar entre 0 y 600 segundos.`);
  });

  return errors.length ? { ok: false, errors } : { ok: true };
}
