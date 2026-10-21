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
const DIA = "2026-11-02";

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

  const comida = (page: Page) => page.getByRole("region", { name: "Comida" });

  test("un usuario nuevo ve el diario vacío con una guía breve", async ({ page }) => {
    await entrar(page);
    await page.goto(`/nutricion?dia=${DIA}`);
    await expect(page.getByRole("heading", { level: 1, name: "Diario de comidas" })).toBeVisible();
    await expect(page.getByText("Aún no has apuntado nada este día")).toBeVisible();
    await expect(page.getByRole("link", { name: "Calcular mis objetivos" })).toBeVisible();
  });

  test("añadir un alimento con gramos, ver el total contra el objetivo, editar y borrar", async ({ page }) => {
    await admin().from("nutrition_goals").upsert({ user_id: id, kcal: 2000, protein_g: 120, carbs_g: 220, fat_g: 70 });
    await entrar(page);
    await page.goto(`/nutricion?dia=${DIA}`);

    await page.getByLabel("Buscar alimento").fill("platanos crudos");
    await page.getByLabel("Comida del día").selectOption("comida");
    await page.getByLabel("Gramos").fill("150");
    await page.getByRole("button", { name: "Añadir Plátanos, crudos" }).click();

    await expect(comida(page)).toContainText("Plátanos, crudos");
    await expect(comida(page)).toContainText("150 g");
    const resumen = page.getByRole("region", { name: "Resumen del día" });
    await expect(resumen).toContainText("133,5 kcal");
    await expect(resumen).toContainText("de 2000 kcal");

    // Editar los gramos.
    await comida(page).getByLabel("Gramos de Plátanos, crudos").fill("200");
    await comida(page).getByRole("button", { name: "Guardar" }).click();
    await expect(resumen).toContainText("178 kcal");

    // Gramos imposibles: mensaje claro, no se guarda.
    await comida(page).getByLabel("Gramos de Plátanos, crudos").fill("0");
    await comida(page).getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("entre 0,1 y 5000 g")).toBeVisible();
    await expect(resumen).toContainText("178 kcal");

    // Borrar.
    await comida(page).getByRole("button", { name: "Quitar Plátanos, crudos" }).click();
    await expect(comida(page)).not.toContainText("Plátanos, crudos");
    await expect(page.getByText("Aún no has apuntado nada este día")).toBeVisible();
  });

  test("cambiar de día con anterior y siguiente", async ({ page }) => {
    await entrar(page);
    await page.goto(`/nutricion?dia=${DIA}`);
    await page.getByRole("link", { name: "Día siguiente" }).click();
    await expect(page).toHaveURL(/dia=2026-11-03/);
    await page.getByRole("link", { name: "Día anterior" }).click();
    await expect(page).toHaveURL(/dia=2026-11-02/);
  });

  test("en móvil no hay scroll horizontal", async ({ page }) => {
    await entrar(page);
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto(`/nutricion?dia=${DIA}`);
    const desborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desborda).toBe(false);
  });
});
