import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { entrarCon, iniciarSesionUnaVez } from "./ayudas";

try {
  process.loadEnvFile(".env.local");
} catch {
  // sin archivo: se usan las variables del entorno
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = () => createClient(url, servicio!, { auth: { persistSession: false } });
const contrasena = "contrasena-de-prueba-123";
const marca = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const hoy = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());

test.describe("usuario nuevo", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const correo = `test-panel-nuevo-${marca()}@example.com`;
  let id = "";
  test.beforeAll(async ({ browser }, info) => {
    const { data, error } = await admin().auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
    if (error) throw error;
    id = data.user.id;
    await iniciarSesionUnaVez(browser, info, correo, contrasena);
  });
  test.afterAll(async () => {
    if (id) await admin().auth.admin.deleteUser(id);
  });

  test("ve tres pasos para empezar y la cabecera le lleva a su panel", async ({ page }) => {
    await entrarCon(page, correo);
    const pasos = page.getByRole("list", { name: "Tres pasos para empezar" }).getByRole("listitem");
    await expect(pasos).toHaveCount(3);
    await expect(pasos.nth(0)).toContainText("objetivos");
    await expect(page.getByRole("banner").getByRole("link", { name: "Mi panel" })).toBeVisible();
  });
});

test.describe("con actividad", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const correo = `test-panel-datos-${marca()}@example.com`;
  let id = "";
  test.beforeAll(async ({ browser }, info) => {
    const db = admin();
    const { data, error } = await db.auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
    if (error) throw error;
    id = data.user.id;
    const dia = hoy();
    const { data: rutina } = await db.from("routines").select("id").eq("slug", "movilidad-en-casa").single();
    await db.from("planned_sessions").insert({ user_id: id, date: dia, routine_id: rutina!.id, routine_day_index: 1 });
    await db.from("nutrition_goals").insert({ user_id: id, kcal: 2000, protein_g: 100, carbs_g: 250, fat_g: 60 });
    const { data: platano } = await db.from("foods").select("id").eq("slug", "platanos-crudos-173944").single();
    await db.from("meal_entries").insert({ user_id: id, date: dia, meal: "desayuno", food_id: platano!.id, grams: 200 });
    const { data: ej } = await db.from("exercises").select("id").eq("slug", "sentadillas").single();
    const { data: w } = await db
      .from("workout_logs")
      .insert({ user_id: id, date: dia, started_at: `${dia}T07:00:00Z`, finished_at: `${dia}T08:00:00Z` })
      .select("id")
      .single();
    await db.from("set_logs").insert({ workout_log_id: w!.id, exercise_id: ej!.id, set_index: 1, weight_kg: 50, reps: 10 });
    await iniciarSesionUnaVez(browser, info, correo, contrasena);
  });
  test.afterAll(async () => {
    if (id) await admin().auth.admin.deleteUser(id);
  });

  test("muestra la sesión de hoy, las calorías frente al objetivo, la racha y la semana", async ({ page }) => {
    await entrarCon(page, correo);
    await expect(page.getByRole("region", { name: "Hoy", exact: true })).toContainText("Movilidad en casa");
    await expect(page.getByRole("region", { name: "Calorías de hoy" })).toContainText("178 kcal de 2000 kcal");
    await expect(page.getByRole("region", { name: "Racha" })).toContainText("1 día");
    await expect(page.getByRole("region", { name: "Esta semana" })).toContainText("1 entreno");
    await expect(page.getByRole("list", { name: "Tres pasos para empezar" })).toHaveCount(0);
  });
});
