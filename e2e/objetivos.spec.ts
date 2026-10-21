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

test("los objetivos exigen sesión", async ({ page }) => {
  await page.goto("/nutricion/objetivos");
  await expect(page).toHaveURL(/\/entrar$/);
});

test.describe("con una cuenta de prueba", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  test.describe.configure({ mode: "serial" });

  const correo = `test-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
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

  async function entrar(page: Page) {
    await entrarCon(page, correo);
  }

  async function rellenar(page: Page, edad: string) {
    await page.getByLabel("Sexo").selectOption("hombre");
    await page.getByLabel("Edad (años)").fill(edad);
    await page.getByLabel("Altura (cm)").fill("180");
    await page.getByLabel("Peso (kg)").fill("80");
    await page.getByLabel("Actividad física").selectOption("moderado");
    await page.getByLabel("Objetivo", { exact: true }).selectOption("mantener");
  }

  test("calcular, ver calorías y macros, guardar y recuperarlos", async ({ page }) => {
    await entrar(page);
    await page.goto("/nutricion/objetivos");
    await expect(page.getByText("no sustituye a un profesional sanitario")).toBeVisible();

    await rellenar(page, "30");
    const resultado = page.getByRole("region", { name: "Tu estimación" });
    await expect(resultado).toContainText("3290 kcal");
    await expect(resultado).toContainText("112 g");
    await expect(resultado).toContainText("464 g");
    await expect(resultado).toContainText("110 g");

    await page.getByRole("button", { name: "Guardar objetivos" }).click();
    await expect(page.getByRole("status")).toContainText("Objetivos guardados");

    await page.reload();
    await expect(page.getByRole("region", { name: "Tus objetivos guardados" })).toContainText("3290 kcal");
  });

  test("datos absurdos muestran un error claro y no se guardan", async ({ page }) => {
    await entrar(page);
    await page.goto("/nutricion/objetivos");
    await rellenar(page, "10");
    await expect(page.getByRole("region", { name: "Tu estimación" }).getByRole("alert")).toContainText("18");
    await expect(page.getByRole("button", { name: "Guardar objetivos" })).toBeDisabled();
  });
});
