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

test.describe("seguridad de nutrición", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  test.describe.configure({ mode: "serial" });

  let A: { id: string; cliente: SupabaseClient };
  let B: { id: string; cliente: SupabaseClient };
  let alimento = 0;
  let entradaA = 0;
  const anonimo = createClient(url, publica, sinSesion);
  const entrada = (user_id: string, extra: object = {}) => ({
    user_id,
    date: "2026-11-02",
    meal: "comida",
    food_id: alimento,
    grams: 150,
    ...extra,
  });

  test.beforeAll(async () => {
    A = await usuario("a");
    B = await usuario("b");
    const { data, error } = await admin()
      .from("foods")
      .insert({ slug: `alimento-prueba-${marca}`, name_es: "Alimento de prueba", source: "manual", kcal: 100, fiber_g: null })
      .select("id")
      .single();
    if (error) throw error;
    alimento = data.id;
  });

  test.afterAll(async () => {
    for (const u of [A, B]) if (u) await admin().auth.admin.deleteUser(u.id);
    if (alimento) await admin().from("foods").delete().eq("id", alimento);
  });

  test("los alimentos los lee cualquiera, pero nadie los modifica desde la web", async () => {
    const { data } = await anonimo.from("foods").select("id, fiber_g").eq("id", alimento).single();
    expect(data?.fiber_g).toBeNull();
    for (const c of [anonimo, A.cliente]) {
      expect((await c.from("foods").insert({ slug: `x-${marca}`, name_es: "x", source: "manual" })).error).not.toBeNull();
      expect((await c.from("foods").update({ kcal: 1 }).eq("id", alimento).select()).data ?? []).toEqual([]);
      expect((await c.from("foods").delete().eq("id", alimento).select()).data ?? []).toEqual([]);
    }
  });

  test("A apunta comidas y objetivos, y los ve", async () => {
    const r = await A.cliente.from("meal_entries").insert(entrada(A.id)).select("id").single();
    expect(r.error).toBeNull();
    entradaA = r.data!.id;
    const g = await A.cliente
      .from("nutrition_goals")
      .insert({ user_id: A.id, kcal: 2000, protein_g: 120, carbs_g: 220, fat_g: 70 });
    expect(g.error).toBeNull();
    expect((await A.cliente.from("meal_entries").select("id")).data).toHaveLength(1);
    expect((await A.cliente.from("nutrition_goals").select("kcal")).data).toEqual([{ kcal: 2000 }]);
  });

  test("B y un anónimo no ven ni tocan el diario ni los objetivos de A", async () => {
    for (const c of [B.cliente, anonimo]) {
      expect((await c.from("meal_entries").select("id")).data).toEqual([]);
      expect((await c.from("nutrition_goals").select("user_id")).data).toEqual([]);
    }
    expect((await B.cliente.from("meal_entries").update({ grams: 1 }).eq("id", entradaA).select()).data).toEqual([]);
    expect((await B.cliente.from("meal_entries").delete().eq("id", entradaA).select()).data).toEqual([]);
    expect((await B.cliente.from("nutrition_goals").update({ kcal: 900 }).eq("user_id", A.id).select()).data).toEqual([]);
    expect((await B.cliente.from("meal_entries").insert(entrada(A.id))).error).not.toBeNull();
    expect(
      (await B.cliente.from("nutrition_goals").insert({ user_id: A.id, kcal: 2000, protein_g: 1, carbs_g: 1, fat_g: 1 })).error,
    ).not.toBeNull();
  });

  test("la base rechaza cantidades y comidas imposibles", async () => {
    for (const extra of [{ grams: 0 }, { grams: 5001 }, { grams: -5 }, { meal: "merienda-cena" }]) {
      expect((await A.cliente.from("meal_entries").insert(entrada(A.id, extra))).error).not.toBeNull();
    }
    expect((await A.cliente.from("nutrition_goals").update({ kcal: 300 }).eq("user_id", A.id)).error).not.toBeNull();
  });

  test("no se puede borrar del catálogo un alimento que está en un diario", async () => {
    expect((await admin().from("foods").delete().eq("id", alimento)).error).not.toBeNull();
  });

  test("al borrar la cuenta de A se borran su diario y sus objetivos", async () => {
    expect((await admin().auth.admin.deleteUser(A.id)).error).toBeNull();
    expect((await admin().from("meal_entries").select("id").eq("user_id", A.id)).data).toEqual([]);
    expect((await admin().from("nutrition_goals").select("user_id").eq("user_id", A.id)).data).toEqual([]);
  });
});
