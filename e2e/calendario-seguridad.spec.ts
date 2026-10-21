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

async function usuario(nombre: string) {
  const correo = `test-${nombre}-${marca}@example.com`;
  const { data, error } = await admin().auth.admin.createUser({
    email: correo,
    password: contrasena,
    email_confirm: true,
  });
  if (error) throw error;
  const cliente = createClient(url, publica, sinSesion);
  const { error: e2 } = await cliente.auth.signInWithPassword({ email: correo, password: contrasena });
  if (e2) throw e2;
  return { id: data.user.id, cliente };
}

const sesion = (user_id: string, extra: object = {}) => ({ user_id, date: "2026-11-02", ...extra });

test.describe("seguridad del calendario", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  test.describe.configure({ mode: "serial" });

  let A: { id: string; cliente: SupabaseClient };
  let B: { id: string; cliente: SupabaseClient };
  let plantilla = 0;
  let rutinaA = 0;
  let sesionA = 0;
  const anonimo = createClient(url, publica, sinSesion);

  test.beforeAll(async () => {
    A = await usuario("a");
    B = await usuario("b");
    const { data: p, error } = await admin()
      .from("routines")
      .insert({
        slug: `plantilla-cal-${marca}`,
        owner_id: null,
        name: "Plantilla calendario",
        goal: "fuerza",
        level: "principiante",
        days_per_week: 3,
      })
      .select("id")
      .single();
    if (error) throw error;
    plantilla = p.id;
    const { data: r } = await A.cliente
      .from("routines")
      .insert({ owner_id: A.id, name: "Rutina de A", goal: "fuerza", level: "principiante", days_per_week: 2 })
      .select("id")
      .single();
    rutinaA = r!.id;
  });

  test.afterAll(async () => {
    if (plantilla) await admin().from("routines").delete().eq("id", plantilla);
    for (const u of [A, B]) if (u) await admin().auth.admin.deleteUser(u.id);
  });

  test("A planifica una plantilla pública y una rutina suya, y las ve", async () => {
    const a = await A.cliente
      .from("planned_sessions")
      .insert(sesion(A.id, { routine_id: plantilla, routine_day_index: 1 }))
      .select("id")
      .single();
    expect(a.error).toBeNull();
    sesionA = a.data!.id;
    const b = await A.cliente.from("planned_sessions").insert(sesion(A.id, { routine_id: rutinaA }));
    expect(b.error).toBeNull();
    const c = await A.cliente.from("planned_sessions").insert(sesion(A.id, { note: "Salir a correr" }));
    expect(c.error).toBeNull();
    expect((await A.cliente.from("planned_sessions").select("id")).data).toHaveLength(3);
  });

  test("B y un anónimo no ven las sesiones de A", async () => {
    for (const c of [B.cliente, anonimo]) {
      expect((await c.from("planned_sessions").select("id")).data).toEqual([]);
    }
  });

  test("B no puede editar ni borrar las sesiones de A", async () => {
    const edita = await B.cliente.from("planned_sessions").update({ status: "hecha" }).eq("id", sesionA).select();
    expect(edita.data).toEqual([]);
    const borra = await B.cliente.from("planned_sessions").delete().eq("id", sesionA).select();
    expect(borra.data).toEqual([]);
    const { data } = await admin().from("planned_sessions").select("status").eq("id", sesionA).single();
    expect(data?.status).toBe("planificada");
  });

  test("B no puede crear sesiones a nombre de A ni apuntar a la rutina privada de A", async () => {
    expect((await B.cliente.from("planned_sessions").insert(sesion(A.id))).error).not.toBeNull();
    expect(
      (await B.cliente.from("planned_sessions").insert(sesion(B.id, { routine_id: rutinaA }))).error,
    ).not.toBeNull();
    // Tampoco moviendo una sesión propia hacia una rutina ajena.
    const propia = await B.cliente.from("planned_sessions").insert(sesion(B.id)).select("id").single();
    expect(propia.error).toBeNull();
    const mueve = await B.cliente
      .from("planned_sessions")
      .update({ routine_id: rutinaA })
      .eq("id", propia.data!.id);
    expect(mueve.error).not.toBeNull();
  });

  test("la base rechaza estados y datos imposibles", async () => {
    expect((await A.cliente.from("planned_sessions").insert(sesion(A.id, { status: "volando" }))).error).not.toBeNull();
    // día de rutina sin rutina
    expect((await A.cliente.from("planned_sessions").insert(sesion(A.id, { routine_day_index: 2 }))).error).not.toBeNull();
    expect((await A.cliente.from("planned_sessions").insert(sesion(A.id, { date: "no-es-fecha" }))).error).not.toBeNull();
    expect(
      (await A.cliente.from("planned_sessions").insert(sesion(A.id, { note: "x".repeat(301) }))).error,
    ).not.toBeNull();
  });

  test("A puede marcar su sesión como hecha", async () => {
    const r = await A.cliente.from("planned_sessions").update({ status: "hecha" }).eq("id", sesionA).select();
    expect(r.error).toBeNull();
    expect(r.data![0].status).toBe("hecha");
  });

  test("al borrar la rutina de A, la sesión se conserva sin rutina; al borrar su cuenta se borra todo", async () => {
    const { error } = await A.cliente.from("routines").delete().eq("id", rutinaA);
    expect(error).toBeNull();
    const { data } = await admin().from("planned_sessions").select("id, routine_id").eq("user_id", A.id);
    expect(data).toHaveLength(3);
    expect(data!.filter((s) => s.routine_id === rutinaA)).toEqual([]);

    expect((await admin().auth.admin.deleteUser(A.id)).error).toBeNull();
    expect((await admin().from("planned_sessions").select("id").eq("user_id", A.id)).data).toEqual([]);
  });
});
