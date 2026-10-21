import { describe, expect, it } from "vitest";
import { FOODS_PAGE_SIZE, getFoodBySlug, searchFoods } from "./queries";

type Fila = Record<string, unknown>;

// Cliente falso en memoria: solo implementa lo que usan las consultas.
function clienteFalso(filas: Fila[]) {
  return {
    from() {
      let datos = [...filas];
      let total = false;
      let desde = 0;
      let hasta = Infinity;
      const orden: string[] = [];
      const b = {
        select(_c: string, o?: { count?: string }) {
          total = o?.count === "exact";
          return b;
        },
        like(col: string, patron: string) {
          const trozo = patron.replaceAll("%", "");
          datos = datos.filter((f) => String(f[col]).includes(trozo));
          return b;
        },
        eq(col: string, v: unknown) {
          datos = datos.filter((f) => f[col] === v);
          return b;
        },
        order(col: string) {
          orden.push(col);
          return b;
        },
        range(a: number, z: number) {
          desde = a;
          hasta = z;
          return b;
        },
        maybeSingle() {
          return Promise.resolve({ data: datos[0] ?? null, error: null });
        },
        then(ok: (r: unknown) => unknown) {
          const comparar = (x: Fila, y: Fila, col: string) =>
            typeof x[col] === "number" ? (x[col] as number) - (y[col] as number) : String(x[col]).localeCompare(String(y[col]));
          datos.sort((x, y) => orden.reduce((r, col) => r || comparar(x, y, col), 0));
          return Promise.resolve({
            data: datos.slice(desde, hasta + 1),
            error: null,
            count: total ? datos.length : null,
          }).then(ok);
        },
      };
      return b;
    },
  } as never;
}

const alimento = (id: number, name_es: string, extra: Fila = {}) => ({
  id,
  slug: `a-${id}`,
  name_es,
  name_len: name_es.length,
  search_text: name_es.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""),
  kcal: "89.0",
  protein_g: "1.09",
  carbs_g: "22.80",
  fat_g: "0.33",
  fiber_g: null,
  sugar_g: "12.20",
  sodium_mg: "1.0",
  ...extra,
});

const base = [
  alimento(1, "Plátano macho, verde, frito"),
  alimento(2, "Plátanos, crudos"),
  alimento(3, "Pollo, pechuga, cruda"),
];

describe("searchFoods", () => {
  const c = clienteFalso(base);

  it("busca sin tildes y ordena primero los nombres más cortos", async () => {
    const r = await searchFoods("PLATANO", 1, c);
    expect(r.items.map((i) => i.name_es)).toEqual(["Plátanos, crudos", "Plátano macho, verde, frito"]);
    expect(r.total).toBe(2);
  });

  it("todas las palabras deben aparecer, en cualquier orden", async () => {
    expect((await searchFoods("crudos platanos", 1, c)).items.map((i) => i.id)).toEqual([2]);
  });

  it("convierte los números que llegan como texto y respeta los nulos", async () => {
    const [p] = (await searchFoods("platanos", 1, c)).items;
    expect(p.kcal).toBe(89);
    expect(p.protein_g).toBe(1.09);
  });

  it("una página fuera de rango devuelve una lista vacía", async () => {
    expect((await searchFoods("", 99, c)).items).toEqual([]);
    expect(FOODS_PAGE_SIZE).toBe(24);
  });
});

describe("getFoodBySlug", () => {
  const c = clienteFalso(base);

  it("devuelve la ficha con nutrientes numéricos y null donde falta el dato", async () => {
    const f = await getFoodBySlug("a-2", c);
    expect(f?.fiber_g).toBeNull();
    expect(f?.sugar_g).toBe(12.2);
    expect(f?.sodium_mg).toBe(1);
  });

  it("devuelve null si no existe", async () => {
    expect(await getFoodBySlug("no", c)).toBeNull();
  });
});
