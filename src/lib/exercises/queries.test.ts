import { describe, expect, it } from "vitest";
import { getExerciseBySlug, listExercises } from "./queries";

type Fila = Record<string, unknown>;

// Cliente falso en memoria: solo implementa lo que usan las consultas.
function clienteFalso(tablas: Record<string, Fila[]>) {
  return {
    from(nombre: string) {
      let filas = [...(tablas[nombre] ?? [])];
      let pedirTotal = false;
      let desde = 0;
      let hasta = Infinity;
      const b = {
        select(_cols: string, opts?: { count?: string }) {
          pedirTotal = opts?.count === "exact";
          return b;
        },
        eq(col: string, v: unknown) {
          filas = filas.filter((f) => f[col] === v);
          return b;
        },
        in(col: string, vs: unknown[]) {
          filas = filas.filter((f) => vs.includes(f[col]));
          return b;
        },
        like(col: string, patron: string) {
          const trozo = patron.replaceAll("%", "");
          filas = filas.filter((f) => String(f[col]).includes(trozo));
          return b;
        },
        order(col: string) {
          filas.sort((x, y) => String(x[col]).localeCompare(String(y[col])));
          return b;
        },
        range(a: number, z: number) {
          desde = a;
          hasta = z;
          return b;
        },
        maybeSingle() {
          return Promise.resolve({ data: filas[0] ?? null, error: null });
        },
        then(ok: (r: unknown) => unknown) {
          const total = filas.length;
          const data = filas.slice(desde, hasta + 1);
          return Promise.resolve({
            data,
            error: null,
            count: pedirTotal ? total : null,
          }).then(ok);
        },
      };
      return b;
    },
  } as never;
}

const base = {
  muscles: [
    { id: 1, slug: "pecho", name_es: "Pecho" },
    { id: 2, slug: "triceps", name_es: "Tríceps" },
  ],
  equipment: [{ id: 1, slug: "mancuernas", name_es: "Mancuernas" }],
  exercises: [
    { id: 10, slug: "flexiones", name_es: "Flexión", level: "principiante", image_url: null, search_text: "flexion" },
    { id: 11, slug: "sentadilla", name_es: "Sentadilla", level: "intermedio", image_url: null, search_text: "sentadilla" },
  ],
  exercise_muscles: [
    { exercise_id: 10, muscle_id: 1, role: "principal" },
    { exercise_id: 10, muscle_id: 2, role: "secundario" },
  ],
  exercise_equipment: [{ exercise_id: 10, equipment_id: 1 }],
};

describe("listExercises", () => {
  const c = clienteFalso(base);

  it("sin filtros devuelve todos", async () => {
    const r = await listExercises({}, c);
    expect(r.total).toBe(2);
    expect(r.items).toHaveLength(2);
  });

  it("filtra por músculo", async () => {
    const r = await listExercises({ muscle: "pecho" }, c);
    expect(r.items.map((i) => i.slug)).toEqual(["flexiones"]);
  });

  it("un músculo que no existe devuelve vacío", async () => {
    const r = await listExercises({ muscle: "nada" }, c);
    expect(r).toEqual({ items: [], total: 0 });
  });

  it("filtra por equipamiento y nivel", async () => {
    const r = await listExercises({ equipment: "mancuernas", level: "principiante" }, c);
    expect(r.items.map((i) => i.slug)).toEqual(["flexiones"]);
  });

  it("busca por texto sin tildes ni mayúsculas", async () => {
    const r = await listExercises({ q: "FLEXIÓN" }, c);
    expect(r.items.map((i) => i.slug)).toEqual(["flexiones"]);
  });

  it("una página fuera de rango devuelve items vacío sin error", async () => {
    const r = await listExercises({ page: 99 }, c);
    expect(r.items).toEqual([]);
    expect(r.total).toBe(2);
  });
});

describe("getExerciseBySlug", () => {
  const c = clienteFalso(base);

  it("devuelve el detalle con músculos y material", async () => {
    const e = await getExerciseBySlug("flexiones", c);
    expect(e?.name_es).toBe("Flexión");
    expect(e?.muscles).toEqual([
      { slug: "pecho", name_es: "Pecho", role: "principal" },
      { slug: "triceps", name_es: "Tríceps", role: "secundario" },
    ]);
    expect(e?.equipment).toEqual([{ slug: "mancuernas", name_es: "Mancuernas" }]);
  });

  it("devuelve null si no existe", async () => {
    expect(await getExerciseBySlug("no-existe", c)).toBeNull();
  });
});
