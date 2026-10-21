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
  const { data, error } = await admin().auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
  if (error) throw error;
  const cliente = createClient(url, publica, sinSesion);
  const { error: e2 } = await cliente.auth.signInWithPassword({ email: correo, password: contrasena });
  if (e2) throw e2;
  return { id: data.user.id, cliente };
}

test.describe("seguridad del registro de entrenos y medidas", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  test.describe.configure({ mode: "serial" });

  let A: { id: string; cliente: SupabaseClient };
  let B: { id: string; cliente: SupabaseClient };
  let ejercicio = 0;
  let entrenoA = 0;
  let sesionA = 0;
  const anonimo = createClient(url, publica, sinSesion);
  const serie = (workout_log_id: number, extra: object = {}) => ({
    workout_log_id,
    exercise_id: ejercicio,
    set_index: 1,
    weight_kg: 60,
    reps: 8,
    ...extra,
  });

  test.beforeAll(async () => {
    A = await usuario("a");
    B = await usuario("b");
    const { data } = await admin().from("exercises").select("id").limit(1).single();
    ejercicio = data!.id;
    const s = await A.cliente.from("planned_sessions").insert({ user_id: A.id, date: "2026-11-02" }).select("id").single();
    sesionA = s.data!.id;
  });

  test.afterAll(async () => {
    for (const u of [A, B]) if (u) await admin().auth.admin.deleteUser(u.id);
  });

  test("A registra un entreno con series y una medición, y los ve", async () => {
    const w = await A.cliente
      .from("workout_logs")
      .insert({ user_id: A.id, date: "2026-11-02", planned_session_id: sesionA })
      .select("id")
      .single();
    expect(w.error).toBeNull();
    entrenoA = w.data!.id;
    expect((await A.cliente.from("set_logs").insert([serie(entrenoA), serie(entrenoA, { set_index: 2 })])).error).toBeNull();
    expect((await A.cliente.from("body_measurements").insert({ user_id: A.id, date: "2026-11-02", weight_kg: 72.5 })).error).toBeNull();
    expect((await A.cliente.from("set_logs").select("id")).data).toHaveLength(2);
  });

  test("B y un anónimo no ven nada de A", async () => {
    for (const c of [B.cliente, anonimo]) {
      for (const tabla of ["workout_logs", "set_logs", "body_measurements"]) {
        expect((await c.from(tabla).select("id")).data, tabla).toEqual([]);
      }
    }
  });

  test("B no puede editar, borrar ni añadir a lo de A", async () => {
    expect((await B.cliente.from("workout_logs").update({ note: "x" }).eq("id", entrenoA).select()).data).toEqual([]);
    expect((await B.cliente.from("workout_logs").delete().eq("id", entrenoA).select()).data).toEqual([]);
    expect((await B.cliente.from("set_logs").update({ reps: 1 }).eq("workout_log_id", entrenoA).select()).data).toEqual([]);
    expect((await B.cliente.from("set_logs").delete().eq("workout_log_id", entrenoA).select()).data).toEqual([]);
    expect((await B.cliente.from("body_measurements").update({ weight_kg: 50 }).eq("user_id", A.id).select()).data).toEqual([]);
    expect((await B.cliente.from("set_logs").insert(serie(entrenoA, { set_index: 9 }))).error).not.toBeNull();
    expect((await B.cliente.from("workout_logs").insert({ user_id: A.id, date: "2026-11-02" })).error).not.toBeNull();
    expect((await B.cliente.from("body_measurements").insert({ user_id: A.id, date: "2026-11-03", weight_kg: 70 })).error).not.toBeNull();
    // B no puede colgar su entreno de la sesión planificada de A.
    expect(
      (await B.cliente.from("workout_logs").insert({ user_id: B.id, date: "2026-11-02", planned_session_id: sesionA })).error,
    ).not.toBeNull();
    const { count } = await admin().from("set_logs").select("id", { count: "exact", head: true }).eq("workout_log_id", entrenoA);
    expect(count).toBe(2);
  });

  test("la base rechaza valores imposibles", async () => {
    for (const extra of [{ weight_kg: -1 }, { weight_kg: 1001 }, { reps: 0 }, { rpe: 11 }, { set_index: 1 }]) {
      expect((await A.cliente.from("set_logs").insert(serie(entrenoA, { set_index: 5, ...extra }))).error, JSON.stringify(extra)).not.toBeNull();
    }
    for (const m of [{ weight_kg: 3 }, { weight_kg: 700 }, { waist_cm: 0 }, {}]) {
      expect((await A.cliente.from("body_measurements").insert({ user_id: A.id, date: "2026-12-01", ...m })).error, JSON.stringify(m)).not.toBeNull();
    }
    // Una sola medición por día.
    expect((await A.cliente.from("body_measurements").insert({ user_id: A.id, date: "2026-11-02", weight_kg: 73 })).error).not.toBeNull();
  });

  test("al borrar la cuenta de A se borra todo lo suyo", async () => {
    expect((await admin().auth.admin.deleteUser(A.id)).error).toBeNull();
    for (const [tabla, col, val] of [
      ["workout_logs", "user_id", A.id],
      ["body_measurements", "user_id", A.id],
      ["set_logs", "workout_log_id", entrenoA],
    ] as const) {
      expect((await admin().from(tabla).select("id").eq(col, val)).data, tabla).toEqual([]);
    }
  });
});
