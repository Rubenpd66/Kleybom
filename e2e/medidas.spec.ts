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

test("las medidas exigen sesión", async ({ page }) => {
  await page.goto("/panel/medidas");
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

  async function abrir(page: Page) {
    await entrarCon(page, correo);
    await page.goto("/panel/medidas");
  }

  test("apuntar, editar y borrar una medición", async ({ page }) => {
    await abrir(page);
    await expect(page.getByText("Aún no has apuntado nada")).toBeVisible();
    await page.getByLabel("Fecha").fill("2026-10-15");
    await page.getByLabel("Peso (kg)").fill("72,5");
    await page.getByLabel("Cintura (cm)").fill("82");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("status")).toContainText("Medidas guardadas");
    const fila = page.getByRole("row", { name: /15 oct 2026/ });
    await expect(fila).toContainText("72,5 kg");

    await fila.getByRole("link", { name: /Editar/ }).click();
    await expect(page.getByLabel("Peso (kg)")).toHaveValue("72,5");
    await page.getByLabel("Peso (kg)").fill("71,8");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("row", { name: /15 oct 2026/ })).toContainText("71,8 kg");
    await expect(page.getByRole("row", { name: /15 oct 2026/ })).toHaveCount(1);

    await page.getByRole("row", { name: /15 oct 2026/ }).getByRole("button", { name: /Borrar/ }).click();
    await expect(page.getByText("Aún no has apuntado nada")).toBeVisible();
  });

  test("datos imposibles o vacíos muestran todos los errores", async ({ page }) => {
    await abrir(page);
    await page.getByLabel("Peso (kg)").fill("3");
    await page.getByLabel("Cadera (cm)").fill("999");
    await page.getByRole("button", { name: "Guardar" }).click();
    const alerta = page.locator("form [role=alert]");
    await expect(alerta).toContainText("El peso debe estar entre 20 y 400 kg");
    await expect(alerta).toContainText("La cadera debe estar entre 30 y 300 cm");

    await page.getByLabel("Peso (kg)").fill("");
    await page.getByLabel("Cadera (cm)").fill("");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(alerta).toContainText("al menos un dato");
  });
});
