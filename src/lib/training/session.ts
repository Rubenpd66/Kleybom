// Estado del entreno en vivo. Los mismos límites que la base de datos (tabla set_logs).
export type SerieRegistrada = {
  exercise_id: number;
  set_index: number;
  weight_kg: number;
  reps: number;
  rpe?: number;
};

export type ActiveSession = {
  date: string;
  routine_id: number | null;
  routine_day_index: number | null;
  planned_session_id: number | null;
  sets: SerieRegistrada[];
  finished: boolean;
  error: string | null;
};

export type SessionAction =
  | { type: "logSet"; exercise_id: number; weight_kg: number; reps: number; rpe?: number }
  | { type: "editSet"; exercise_id: number; set_index: number; weight_kg: number; reps: number; rpe?: number }
  | { type: "deleteSet"; exercise_id: number; set_index: number }
  | { type: "finish" };

export const ERRORES = {
  peso: "El peso debe estar entre 0 y 1000 kg.",
  reps: "Las repeticiones deben ser un número entero entre 1 y 200.",
  rpe: "El esfuerzo percibido (RPE) debe estar entre 1 y 10.",
  sinSeries: "Registra al menos una serie antes de terminar el entreno.",
  noExiste: "Esa serie ya no existe.",
};

export function nuevaSesion(o: Partial<Omit<ActiveSession, "sets" | "finished" | "error">> & { date: string }): ActiveSession {
  return {
    routine_id: null,
    routine_day_index: null,
    planned_session_id: null,
    ...o,
    sets: [],
    finished: false,
    error: null,
  };
}

function validar(weight_kg: number, reps: number, rpe?: number): string | null {
  if (!Number.isFinite(weight_kg) || weight_kg < 0 || weight_kg > 1000) return ERRORES.peso;
  if (!Number.isInteger(reps) || reps < 1 || reps > 200) return ERRORES.reps;
  if (rpe !== undefined && (!Number.isFinite(rpe) || rpe < 1 || rpe > 10)) return ERRORES.rpe;
  return null;
}

// Renumera las series de un ejercicio (1, 2, 3…) manteniendo su orden.
function renumerar(sets: SerieRegistrada[], exercise_id: number): SerieRegistrada[] {
  let n = 0;
  return sets.map((s) => (s.exercise_id === exercise_id ? { ...s, set_index: ++n } : s));
}

export function sessionReducer(s: ActiveSession, a: SessionAction): ActiveSession {
  if (s.finished) return s;
  switch (a.type) {
    case "logSet": {
      const error = validar(a.weight_kg, a.reps, a.rpe);
      if (error) return { ...s, error };
      const set_index = s.sets.filter((x) => x.exercise_id === a.exercise_id).length + 1;
      const nueva: SerieRegistrada = { exercise_id: a.exercise_id, set_index, weight_kg: a.weight_kg, reps: a.reps };
      if (a.rpe !== undefined) nueva.rpe = a.rpe;
      return { ...s, sets: [...s.sets, nueva], error: null };
    }
    case "editSet": {
      const i = s.sets.findIndex((x) => x.exercise_id === a.exercise_id && x.set_index === a.set_index);
      if (i < 0) return { ...s, error: ERRORES.noExiste };
      const error = validar(a.weight_kg, a.reps, a.rpe);
      if (error) return { ...s, error };
      const sets = [...s.sets];
      sets[i] = { ...sets[i], weight_kg: a.weight_kg, reps: a.reps, ...(a.rpe !== undefined ? { rpe: a.rpe } : {}) };
      return { ...s, sets, error: null };
    }
    case "deleteSet": {
      const sets = s.sets.filter((x) => !(x.exercise_id === a.exercise_id && x.set_index === a.set_index));
      if (sets.length === s.sets.length) return { ...s, error: ERRORES.noExiste };
      return { ...s, sets: renumerar(sets, a.exercise_id), error: null };
    }
    case "finish":
      return s.sets.length === 0 ? { ...s, error: ERRORES.sinSeries } : { ...s, finished: true, error: null };
  }
}
