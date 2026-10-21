import type { Goal, RoutineDraft, RoutineExerciseDraft, RoutineLevel } from "./validate";

export type BuilderAction =
  | { type: "setMeta"; name?: string; goal?: Goal; level?: RoutineLevel }
  | { type: "addExercise"; exercise_id: number; day_index: number }
  | { type: "removeExercise"; day_index: number; position: number }
  | { type: "moveExercise"; day_index: number; from: number; to: number }
  | { type: "setSets"; day_index: number; position: number; sets: number }
  | { type: "setReps"; day_index: number; position: number; reps_min: number; reps_max: number }
  | { type: "setRest"; day_index: number; position: number; rest_seconds: number }
  | { type: "addDay" }
  | { type: "removeDay"; day_index: number };

const MAX_DIAS = 7;
const POR_DEFECTO = { sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 60 };

export function emptyDraft(): RoutineDraft {
  return { name: "", goal: "fuerza", level: "principiante", days_per_week: 3, exercises: [] };
}

const diaValido = (s: RoutineDraft, d: number) => Number.isInteger(d) && d >= 1 && d <= s.days_per_week;

// Ejercicios de un día, en su orden actual.
const delDia = (s: RoutineDraft, d: number) => s.exercises.filter((e) => e.day_index === d);

// Reconstruye la lista entera dejando `position` consecutivo (1, 2, 3…) en cada día.
function reconstruir(s: RoutineDraft, cambios: Record<number, RoutineExerciseDraft[]>): RoutineDraft {
  const exercises: RoutineExerciseDraft[] = [];
  for (let d = 1; d <= s.days_per_week; d++) {
    (cambios[d] ?? delDia(s, d)).forEach((e, i) => exercises.push({ ...e, day_index: d, position: i + 1 }));
  }
  return { ...s, exercises };
}

// Número entero dentro de [min, max]; si no es un número, se conserva el valor actual.
function acotar(n: number, min: number, max: number, actual: number): number {
  if (!Number.isFinite(n)) return actual;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function cambiarEjercicio(
  s: RoutineDraft,
  day_index: number,
  position: number,
  cambio: (e: RoutineExerciseDraft) => RoutineExerciseDraft,
): RoutineDraft {
  const lista = delDia(s, day_index);
  const e = lista[position - 1];
  if (!e || !Number.isInteger(position)) return s;
  const nueva = [...lista];
  nueva[position - 1] = cambio(e);
  return reconstruir(s, { [day_index]: nueva });
}

export function builderReducer(s: RoutineDraft, a: BuilderAction): RoutineDraft {
  switch (a.type) {
    case "setMeta":
      return {
        ...s,
        name: a.name ?? s.name,
        goal: a.goal ?? s.goal,
        level: a.level ?? s.level,
      };

    case "addExercise": {
      if (!diaValido(s, a.day_index)) return s;
      const nuevo: RoutineExerciseDraft = { exercise_id: a.exercise_id, day_index: a.day_index, ...POR_DEFECTO };
      return reconstruir(s, { [a.day_index]: [...delDia(s, a.day_index), nuevo] });
    }

    case "removeExercise": {
      const lista = delDia(s, a.day_index);
      if (!Number.isInteger(a.position) || a.position < 1 || a.position > lista.length) return s;
      return reconstruir(s, { [a.day_index]: lista.filter((_, i) => i !== a.position - 1) });
    }

    case "moveExercise": {
      const lista = delDia(s, a.day_index);
      const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= lista.length;
      if (!ok(a.from) || !ok(a.to) || a.from === a.to) return s;
      const nueva = [...lista];
      const [movido] = nueva.splice(a.from - 1, 1);
      nueva.splice(a.to - 1, 0, movido);
      return reconstruir(s, { [a.day_index]: nueva });
    }

    case "setSets":
      return cambiarEjercicio(s, a.day_index, a.position, (e) => ({
        ...e,
        sets: acotar(a.sets, 1, 20, e.sets),
      }));

    case "setReps":
      return cambiarEjercicio(s, a.day_index, a.position, (e) => {
        const min = acotar(a.reps_min, 1, 100, e.reps_min);
        const max = acotar(a.reps_max, 1, 100, e.reps_max);
        return { ...e, reps_min: min, reps_max: Math.max(min, max) };
      });

    case "setRest":
      return cambiarEjercicio(s, a.day_index, a.position, (e) => ({
        ...e,
        rest_seconds: acotar(a.rest_seconds, 0, 600, e.rest_seconds),
      }));

    case "addDay":
      return s.days_per_week >= MAX_DIAS ? s : { ...s, days_per_week: s.days_per_week + 1 };

    case "removeDay": {
      if (s.days_per_week <= 1 || !diaValido(s, a.day_index)) return s;
      const exercises = s.exercises
        .filter((e) => e.day_index !== a.day_index)
        .map((e) => (e.day_index > a.day_index ? { ...e, day_index: e.day_index - 1 } : e));
      return reconstruir({ ...s, days_per_week: s.days_per_week - 1, exercises }, {});
    }
  }
}
