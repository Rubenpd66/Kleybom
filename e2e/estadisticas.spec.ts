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
const menos = (fecha: string, dias: number) => {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
};

test("las estadísticas exigen sesión", async ({ page }) => {
  await page.goto("/estadisticas");
  await expect(page).toHaveURL(/\/entrar$/);
});

test.describe("usuario nuevo", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const correo = `test-nuevo-${marca()}@example.com`;
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

  test("ve un estado vacío que explica qué registrar", async ({ page }) => {
    await entrarCon(page, correo);
    await page.goto("/estadisticas");
    await expect(page.getByText("Aún no hay datos para tus estadísticas")).toBeVisible();
    await expect(page.getByRole("link", { name: "Empezar un entreno" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Apuntar mi peso" })).toBeVisible();
  });
});

test.describe("con datos de ejemplo", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const correo = `test-datos-${marca()}@example.com`;
  let id = "";

  test.beforeAll(async ({ browser }, info) => {
    const db = admin();
    const { data, error } = await db.auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
    if (error) throw error;
    id = data.user.id;
    const { data: sentadilla } = await db.from("exercises").select("id").eq("slug", "sentadillas").single();
    const dia = hoy();
    // Tres entrenos: hoy, ayer y hace 10 días (racha de 2).
    for (const [i, d] of [dia, menos(dia, 1), menos(dia, 10)].entries()) {
      const { data: w } = await db
        .from("workout_logs")
        .insert({ user_id: id, date: d, started_at: `${d}T08:00:00Z`, finished_at: `${d}T09:00:00Z` })
        .select("id")
        .single();
      await db.from("set_logs").insert([
        { workout_log_id: w!.id, exercise_id: sentadilla!.id, set_index: 1, weight_kg: 60 + i * 5, reps: 5 },
        { workout_log_id: w!.id, exercise_id: sentadilla!.id, set_index: 2, weight_kg: 60 + i * 5, reps: 5 },
      ]);
    }
    await db.from("body_measurements").insert([
      { user_id: id, date: menos(dia, 14), weight_kg: 74 },
      { user_id: id, date: menos(dia, 7), weight_kg: 73.2 },
      { user_id: id, date: dia, weight_kg: 72.5 },
    ]);
    await iniciarSesionUnaVez(browser, info, correo, contrasena);
  });
  test.afterAll(async () => {
    if (id) await admin().auth.admin.deleteUser(id);
  });

  test("se ven la constancia, el volumen semanal, el 1RM y el peso con media móvil, con tabla de datos", async ({ page }) => {
    await entrarCon(page, correo);
    await page.goto("/estadisticas");

    const constancia = page.getByRole("region", { name: "Constancia" });
    await expect(constancia).toContainText("2 días");

    await expect(page.getByRole("img", { name: /Volumen semanal/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /1RM estimado de Sentadillas/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /Peso corporal/ })).toBeVisible();
    await expect(page.getByText("Media móvil").first()).toBeVisible();

    // Alternativa accesible: tabla con los datos del gráfico de peso.
    const peso = page.getByRole("region", { name: "Peso corporal" });
    await peso.getByText("Ver los datos en una tabla").click();
    await expect(peso.getByRole("table")).toContainText("72,5 kg");
  });

  test("en móvil no hay scroll horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await entrarCon(page, correo);
    await page.goto("/estadisticas");
    const desborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desborda).toBe(false);
  });
});
