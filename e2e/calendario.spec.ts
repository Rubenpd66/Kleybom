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

test.describe("con una cuenta de prueba", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  test.describe.configure({ mode: "serial" });

  const correo = `test-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  let id = "";

  test.beforeAll(async ({ browser }, info) => {
    const { data, error } = await admin().auth.admin.createUser({
      email: correo,
      password: contrasena,
      email_confirm: true,
    });
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

  test("un usuario nuevo ve el calendario vacío con un mensaje que explica cómo empezar", async ({ page }) => {
    await entrar(page);
    await page.goto("/calendario");
    await expect(page.getByRole("heading", { level: 1, name: "Calendario" })).toBeVisible();
    await expect(page.getByText("Aún no has planificado nada")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("planificar una rutina en un día, marcarla como hecha y cambiar de mes", async ({ page }) => {
    await entrar(page);
    await page.goto("/calendario?mes=2026-11");
    await expect(page.getByRole("heading", { name: "noviembre de 2026" })).toBeVisible();

    // Elegir el lunes 2 de noviembre en la cuadrícula.
    await page.getByRole("link", { name: /^lunes, 2 de noviembre/ }).click();
    await expect(page).toHaveURL(/dia=2026-11-02/);
    await expect(page.getByLabel("Fecha")).toHaveValue("2026-11-02");

    await page.getByLabel("Rutina", { exact: true }).selectOption({ label: "Fuerza básica (3 días)" });
    await page.getByLabel("Día de la rutina").selectOption("1");
    await page.getByLabel("Nota").fill("Ir temprano");
    await page.getByRole("button", { name: "Planificar" }).click();

    const sesion = page.getByRole("article").filter({ hasText: "Fuerza básica (3 días)" });
    await expect(sesion).toBeVisible();
    await expect(sesion).toContainText("Día 1");
    await expect(sesion).toContainText("Ir temprano");
    await expect(sesion).toContainText("Planificada");
    await expect(page.getByRole("link", { name: /^lunes, 2 de noviembre.*1 sesión/ })).toBeVisible();

    await sesion.getByRole("button", { name: "Marcar como hecha" }).click();
    await expect(page.getByRole("article").filter({ hasText: "Fuerza básica" })).toContainText("Hecha");

    await page.getByRole("link", { name: "Mes siguiente" }).click();
    await expect(page).toHaveURL(/mes=2026-12/);
    await expect(page.getByRole("heading", { name: "diciembre de 2026" })).toBeVisible();
    await page.getByRole("link", { name: "Mes anterior" }).click();
    await expect(page.getByRole("heading", { name: "noviembre de 2026" })).toBeVisible();
    await expect(page.getByText("Aún no has planificado nada")).toHaveCount(0);
  });

  test("una fecha imposible muestra un mensaje claro y borrar quita la sesión", async ({ page }) => {
    await entrar(page);
    await page.goto("/calendario?mes=2026-11&dia=2026-11-02");
    await page.getByLabel("Fecha").fill("");
    await page.getByRole("button", { name: "Planificar" }).click();
    await expect(page.locator("form [role=alert]")).toContainText("fecha válida");

    await page.goto("/calendario?mes=2026-11&dia=2026-11-02");
    const sesion = page.getByRole("article").filter({ hasText: "Fuerza básica" });
    await sesion.getByRole("button", { name: "Borrar" }).click();
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  test("en móvil no hay scroll horizontal", async ({ page }) => {
    await entrar(page);
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto("/calendario?mes=2026-11&dia=2026-11-02");
    const desborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desborda).toBe(false);
  });
});
