import { describe, expect, it } from "vitest";
import { getRoutineBySlug, listRoutines } from "./queries";

type Fila = Record<string, unknown>;

// Cliente falso en memoria: solo implementa lo que usan las consultas.
function clienteFalso(tablas: Record<string, Fila[]>) {
  return {
    from(nombre: string) {
      let filas = [...(tablas[nombre] ?? [])];
      const b = {
        select() {
          return b;
        },
        eq(col: string, v: unknown) {
          filas = filas.filter((f) => f[col] === v);
          return b;
        },
        is(col: string, v: null) {
          filas = filas.filter((f) => f[col] === v);
          return b;
        },
        in(col: string, vs: unknown[]) {
          filas = filas.filter((f) => vs.includes(f[col]));
          return b;
        },
        order(col: string) {
          filas.sort((x, y) => Number(x[col]) - Number(y[col]) || String(x[col]).localeCompare(String(y[col])));
          return b;
        },
        maybeSingle() {
          return Promise.resolve({ data: filas[0] ?? null, error: null });
        },
        then(ok: (r: unknown) => unknown) {
          return Promise.resolve({ data: filas, error: null }).then(ok);
        },
      };
      return b;
    },
  } as never;
}

const rutina = (id: number, slug: string, goal: string, level: string, owner: string | null = null) => ({
  id,
  slug,
  owner_id: owner,
  name: `Rutina ${slug}`,
  description: "texto",
  goal,
  level,
  days_per_week: 2,
});

const base = {
  routines: [
    rutina(1, "fuerza-a", "fuerza", "intermedio"),
    rutina(2, "movilidad-a", "movilidad", "principiante"),
    rutina(3, "fuerza-b", "fuerza", "principiante"),
    rutina(4, "mia", "fuerza", "principiante", "usuario-1"),
  ],
  exercises: [
    { id: 10, slug: "sentadillas", name_es: "Sentadillas" },
    { id: 11, slug: "plancha", name_es: "Plancha" },
  ],
  routine_exercises: [
    { id: 3, routine_id: 1, exercise_id: 11, day_index: 2, position: 1, sets: 3, reps_min: 1, reps_max: 1, rest_seconds: 45, notes: "30 s" },
    { id: 1, routine_id: 1, exercise_id: 10, day_index: 1, position: 1, sets: 5, reps_min: 5, reps_max: 5, rest_seconds: 180, notes: null },
    { id: 2, routine_id: 1, exercise_id: 11, day_index: 1, position: 2, sets: 3, reps_min: 1, reps_max: 1, rest_seconds: 45, notes: null },
  ],
};

describe("listRoutines", () => {
  const c = clienteFalso(base);

  it("sin filtros devuelve solo las plantillas públicas", async () => {
    const r = await listRoutines({}, c);
    expect(r.map((x) => x.slug)).toEqual(["fuerza-a", "movilidad-a", "fuerza-b"]);
  });

  it("filtra por objetivo", async () => {
    const r = await listRoutines({ goal: "movilidad" }, c);
    expect(r.map((x) => x.slug)).toEqual(["movilidad-a"]);
  });

  it("filtra por nivel y por objetivo a la vez", async () => {
    const r = await listRoutines({ goal: "fuerza", level: "principiante" }, c);
    expect(r.map((x) => x.slug)).toEqual(["fuerza-b"]);
  });

  it("si nada coincide devuelve una lista vacía", async () => {
    expect(await listRoutines({ goal: "resistencia" }, c)).toEqual([]);
  });
});

describe("getRoutineBySlug", () => {
  const c = clienteFalso(base);

  it("devuelve la rutina con sus días y ejercicios ordenados", async () => {
    const r = await getRoutineBySlug("fuerza-a", c);
    expect(r?.dias.map((d) => d.dia)).toEqual([1, 2]);
    expect(r?.dias[0].ejercicios.map((e) => e.exercise.slug)).toEqual(["sentadillas", "plancha"]);
    expect(r?.dias[1].ejercicios[0]).toMatchObject({ sets: 3, notes: "30 s", exercise: { name_es: "Plancha" } });
  });

  it("una rutina sin ejercicios tiene la lista de días vacía", async () => {
    const r = await getRoutineBySlug("movilidad-a", c);
    expect(r?.dias).toEqual([]);
  });

  it("devuelve null si no existe o si no es una plantilla pública", async () => {
    expect(await getRoutineBySlug("no-existe", c)).toBeNull();
    expect(await getRoutineBySlug("mia", c)).toBeNull();
  });
});
