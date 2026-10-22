import { es, type Diccionario } from "../i18n/es.ts";

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
export function validateRoutine(
  r: RoutineDraft,
  t: Diccionario["constructor"]["errores"] = es.constructor.errores,
): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const nombre = r.name.trim();
  if (nombre.length < 1 || nombre.length > 100)
    errors.push(t.nombre);
  if (!GOALS.includes(r.goal)) errors.push(t.objetivo);
  if (!LEVELS.includes(r.level)) errors.push(t.nivel);
  if (!entero(r.days_per_week, 1, 7)) errors.push(t.dias);
  if (r.exercises.length === 0) errors.push(t.sinEjercicios);

  r.exercises.forEach((e, i) => {
    const n = t.ejercicio(i + 1);
    if (!entero(e.day_index, 1, 7)) errors.push(t.dia(n));
    if (!entero(e.sets, 1, 20)) errors.push(t.series(n));
    const minOk = entero(e.reps_min, 1, 100);
    const maxOk = entero(e.reps_max, 1, 100);
    if (!minOk || !maxOk) errors.push(t.reps(n));
    else if (e.reps_min > e.reps_max) errors.push(t.minMax(n));
    if (!entero(e.rest_seconds, 0, 600)) errors.push(t.descanso(n));
  });

  return errors.length ? { ok: false, errors } : { ok: true };
}
