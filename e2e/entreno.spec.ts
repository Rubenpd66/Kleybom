import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
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

test("el entreno exige sesión", async ({ page }) => {
  await page.goto("/entreno");
  await expect(page).toHaveURL(/\/entrar$/);
});

test.describe("con una cuenta de prueba", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  test.describe.configure({ mode: "serial" });

  const correo = `test-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  let id = "";
  let sesionPlanificada = 0;

  test.beforeAll(async ({ browser }, info) => {
    const { data, error } = await admin().auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
    if (error) throw error;
    id = data.user.id;

    // Una sesión anterior terminada de sentadillas (60 kg × 5) para ver "la última vez".
    const db = admin();
    const { data: rutina } = await db.from("routines").select("id").eq("slug", "fuerza-basica-3-dias").single();
    const { data: sentadilla } = await db.from("exercises").select("id").eq("slug", "sentadillas").single();
    const { data: anterior } = await db
      .from("workout_logs")
      .insert({
        user_id: id,
        date: "2026-10-01",
        routine_id: rutina!.id,
        routine_day_index: 1,
        started_at: "2026-10-01T10:00:00Z",
        finished_at: "2026-10-01T11:00:00Z",
      })
      .select("id")
      .single();
    await db.from("set_logs").insert({ workout_log_id: anterior!.id, exercise_id: sentadilla!.id, set_index: 1, weight_kg: 60, reps: 5 });

    // Sesión planificada para hoy con la rutina de fuerza, día 1.
    const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
    const { data: s } = await db
      .from("planned_sessions")
      .insert({ user_id: id, date: hoy, routine_id: rutina!.id, routine_day_index: 1 })
      .select("id")
      .single();
    sesionPlanificada = s!.id;

    await iniciarSesionUnaVez(browser, info, correo, contrasena);
  });

  test.afterAll(async () => {
    if (id) await admin().auth.admin.deleteUser(id);
  });

  async function entrar(page: Page) {
    await entrarCon(page, correo);
  }

  test("empezar desde la sesión planificada, registrar 3 series viendo la anterior, terminar y ver el resumen", async ({
    page,
  }) => {
    await entrar(page);
    await page.goto("/entreno");
    const planificada = page.getByRole("article").filter({ hasText: "Fuerza básica (3 días)" });
    await planificada.getByRole("button", { name: "Empezar" }).click();
    await expect(page).toHaveURL(/\/entreno\?id=\d+/);

    const sentadillas = page.getByRole("region", { name: "Sentadillas" });
    await expect(sentadillas).toContainText("La última vez: 60 kg × 5");

    for (const [peso, reps] of [["60", "5"], ["62,5", "5"], ["65", "4"]]) {
      await sentadillas.getByLabel("Peso (kg)").fill(peso);
      await sentadillas.getByLabel("Repeticiones").fill(reps);
      await sentadillas.getByRole("button", { name: "Registrar serie" }).click();
    }
    await expect(sentadillas.getByRole("listitem")).toHaveCount(3);
    await expect(sentadillas).toContainText("62,5 kg × 5");

    // Tras registrar, arranca el descanso de la rutina (180 s en sentadillas) y se puede saltar.
    await expect(page.getByRole("timer")).toContainText(/Quedan 1\d\d s de descanso/);
    await page.getByRole("button", { name: "Saltar descanso" }).click();
    await expect(page.getByRole("timer")).toHaveCount(0);

    // Se guarda al momento: al recargar, las series siguen ahí.
    await page.reload();
    await expect(page.getByRole("region", { name: "Sentadillas" }).getByRole("listitem")).toHaveCount(3);

    await page.getByRole("button", { name: "Terminar entreno" }).click();
    const resumen = page.getByRole("region", { name: "Resumen del entreno" });
    await expect(resumen).toContainText("3 series");
    await expect(resumen).toContainText("872,5 kg");

    const { data } = await admin().from("planned_sessions").select("status").eq("id", sesionPlanificada).single();
    expect(data?.status).toBe("hecha");
  });

  test("valores imposibles muestran un error y no se guardan", async ({ page }) => {
    await entrar(page);
    await page.goto("/entreno");
    await page.getByLabel("Rutina", { exact: true }).selectOption({ label: "Fuerza básica (3 días)" });
    await page.getByRole("button", { name: "Empezar entreno" }).click();
    await expect(page).toHaveURL(/\/entreno\?id=\d+/);
    const sentadillas = page.getByRole("region", { name: "Sentadillas" });
    await sentadillas.getByLabel("Peso (kg)").fill("2000");
    await sentadillas.getByLabel("Repeticiones").fill("5");
    await sentadillas.getByRole("button", { name: "Registrar serie" }).click();
    await expect(sentadillas.getByRole("alert")).toContainText("entre 0 y 1000 kg");
    await expect(sentadillas.getByRole("listitem")).toHaveCount(0);

    // Terminar sin series avisa y no cierra el entreno.
    await page.getByRole("button", { name: "Terminar entreno" }).click();
    await expect(page.getByText("Registra al menos una serie")).toBeVisible();
  });
});
