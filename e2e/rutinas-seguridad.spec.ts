import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

try {
  process.loadEnvFile(".env.local");
} catch {
  // sin archivo: se usan las variables del entorno
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sinSesion = { auth: { persistSession: false } };
const admin = () => createClient(url, servicio!, sinSesion);
const contrasena = "contrasena-de-prueba-123";
const marca = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const correo = (n: string) => `test-${n}-${marca}@example.com`;

async function usuario(correoUsuario: string) {
  const { data, error } = await admin().auth.admin.createUser({
    email: correoUsuario,
    password: contrasena,
    email_confirm: true,
  });
  if (error) throw error;
  const cliente = createClient(url, publica, sinSesion);
  const { error: e2 } = await cliente.auth.signInWithPassword({ email: correoUsuario, password: contrasena });
  if (e2) throw e2;
  return { id: data.user.id, cliente };
}

const rutina = (extra: object = {}) => ({
  name: "Mi rutina",
  goal: "fuerza",
  level: "principiante",
  days_per_week: 3,
  ...extra,
});
const fila = (routine_id: number, exercise_id: number, extra: object = {}) => ({
  routine_id,
  exercise_id,
  day_index: 1,
  position: 1,
  sets: 3,
  reps_min: 8,
  reps_max: 12,
  rest_seconds: 90,
  ...extra,
});

test.describe("seguridad de las rutinas", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  test.describe.configure({ mode: "serial" });

  let A: { id: string; cliente: SupabaseClient };
  let B: { id: string; cliente: SupabaseClient };
  let idEjercicio = 0;
  let plantilla = 0;
  let rutinaA = 0;
  const anonimo = createClient(url, publica, sinSesion);

  test.beforeAll(async () => {
    A = await usuario(correo("a"));
    B = await usuario(correo("b"));
    const { data: ej } = await admin().from("exercises").select("id").limit(1).single();
    idEjercicio = ej!.id;

    const { data: p, error } = await admin()
      .from("routines")
      .insert(rutina({ name: "Plantilla de prueba", slug: `plantilla-prueba-${marca}`, owner_id: null }))
      .select("id")
      .single();
    if (error) throw error;
    plantilla = p.id;
    const { error: e2 } = await admin().from("routine_exercises").insert(fila(plantilla, idEjercicio));
    if (e2) throw e2;
  });

  test.afterAll(async () => {
    if (plantilla) await admin().from("routines").delete().eq("id", plantilla);
    for (const u of [A, B]) if (u) await admin().auth.admin.deleteUser(u.id);
  });

  test("las plantillas las ve cualquiera, incluso sin cuenta", async () => {
    const r = await anonimo.from("routines").select("id").eq("id", plantilla);
    expect(r.data).toHaveLength(1);
    const e = await anonimo.from("routine_exercises").select("id").eq("routine_id", plantilla);
    expect(e.data).toHaveLength(1);
  });

  test("A crea su rutina y la ve", async () => {
    const { data, error } = await A.cliente
      .from("routines")
      .insert(rutina({ owner_id: A.id }))
      .select("id")
      .single();
    expect(error).toBeNull();
    rutinaA = data!.id;
    const { error: e2 } = await A.cliente.from("routine_exercises").insert(fila(rutinaA, idEjercicio));
    expect(e2).toBeNull();
    const vistas = await A.cliente.from("routines").select("id").eq("id", rutinaA);
    expect(vistas.data).toHaveLength(1);
  });

  test("B y un anónimo no ven la rutina de A ni sus ejercicios", async () => {
    for (const c of [B.cliente, anonimo]) {
      expect((await c.from("routines").select("id").eq("id", rutinaA)).data).toEqual([]);
      expect((await c.from("routine_exercises").select("id").eq("routine_id", rutinaA)).data).toEqual([]);
    }
  });

  test("B no puede editar ni borrar lo de A", async () => {
    const edita = await B.cliente.from("routines").update({ name: "hackeada" }).eq("id", rutinaA).select();
    expect(edita.data).toEqual([]);
    const borra = await B.cliente.from("routines").delete().eq("id", rutinaA).select();
    expect(borra.data).toEqual([]);
    const editaFila = await B.cliente.from("routine_exercises").update({ sets: 20 }).eq("routine_id", rutinaA).select();
    expect(editaFila.data).toEqual([]);
    const borraFila = await B.cliente.from("routine_exercises").delete().eq("routine_id", rutinaA).select();
    expect(borraFila.data).toEqual([]);

    const { data } = await admin().from("routines").select("name").eq("id", rutinaA).single();
    expect(data?.name).toBe("Mi rutina");
  });

  test("B no puede añadir ejercicios a la rutina de A ni crear rutinas a nombre de A", async () => {
    const añade = await B.cliente.from("routine_exercises").insert(fila(rutinaA, idEjercicio, { position: 2 }));
    expect(añade.error).not.toBeNull();
    const crea = await B.cliente.from("routines").insert(rutina({ owner_id: A.id }));
    expect(crea.error).not.toBeNull();
  });

  test("nadie puede crear ni tocar plantillas públicas desde la web", async () => {
    const crea = await A.cliente
      .from("routines")
      .insert(rutina({ owner_id: null, slug: `intento-${marca}` }));
    expect(crea.error).not.toBeNull();
    const edita = await A.cliente.from("routines").update({ name: "tocada" }).eq("id", plantilla).select();
    expect(edita.data).toEqual([]);
    const borra = await A.cliente.from("routines").delete().eq("id", plantilla).select();
    expect(borra.data).toEqual([]);
    const añade = await A.cliente.from("routine_exercises").insert(fila(plantilla, idEjercicio, { position: 2 }));
    expect(añade.error).not.toBeNull();
  });

  test("la base rechaza valores imposibles", async () => {
    const malas = [
      fila(rutinaA, idEjercicio, { position: 2, sets: 0 }),
      fila(rutinaA, idEjercicio, { position: 2, sets: 21 }),
      fila(rutinaA, idEjercicio, { position: 2, reps_min: 12, reps_max: 8 }),
      fila(rutinaA, idEjercicio, { position: 2, rest_seconds: -1 }),
      fila(rutinaA, idEjercicio, { position: 1 }), // posición repetida en el mismo día
    ];
    for (const m of malas) {
      expect((await A.cliente.from("routine_exercises").insert(m)).error).not.toBeNull();
    }
    expect((await A.cliente.from("routines").insert(rutina({ owner_id: A.id, goal: "volar" }))).error).not.toBeNull();
    expect((await A.cliente.from("routines").insert(rutina({ owner_id: A.id, days_per_week: 8 }))).error).not.toBeNull();
  });

  test("al borrar la cuenta de A se borran sus rutinas, pero no las plantillas", async () => {
    const { error } = await admin().auth.admin.deleteUser(A.id);
    expect(error).toBeNull();
    expect((await admin().from("routines").select("id").eq("id", rutinaA)).data).toEqual([]);
    expect((await admin().from("routine_exercises").select("id").eq("routine_id", rutinaA)).data).toEqual([]);
    expect((await admin().from("routines").select("id").eq("id", plantilla)).data).toHaveLength(1);
  });
});
