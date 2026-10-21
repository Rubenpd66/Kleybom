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

test("el constructor exige sesión", async ({ page }) => {
  await page.goto("/rutinas/nueva");
  await expect(page).toHaveURL(/\/entrar$/);
});

async function buscarYAnadir(page: Page, texto: string, nombre: string) {
  await page.getByLabel("Buscar ejercicio").fill(texto);
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await page.getByRole("button", { name: `Añadir ${nombre}`, exact: true }).click();
}

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

  test.beforeEach(async ({ page }) => {
    await entrarCon(page, correo);
  });

  test("guardar sin ejercicios muestra los mensajes de validación", async ({ page }) => {
    await page.goto("/rutinas/nueva");
    await page.getByRole("button", { name: "Guardar rutina" }).click();
    const errores = page.getByRole("alert").filter({ hasText: "al menos un ejercicio" });
    await expect(errores).toBeVisible();
    await expect(errores).toContainText("nombre de la rutina");
  });

  test("crear una rutina buscando ejercicios, ajustar series, guardar y verla en Mis rutinas", async ({
    page,
  }) => {
    await page.goto("/rutinas/nueva");
    await page.getByLabel("Nombre de la rutina").fill("Mi rutina de prueba");
    await buscarYAnadir(page, "sentadillas sumo", "Sentadillas sumo");
    await buscarYAnadir(page, "puente de cadera", "Puente de cadera");

    await page.getByLabel("Series de Sentadillas sumo").fill("5");
    await page.getByLabel("Repeticiones mínimas de Sentadillas sumo").fill("6");
    await page.getByLabel("Repeticiones máximas de Sentadillas sumo").fill("8");

    // Subir el puente por encima de las sentadillas.
    await page.getByRole("button", { name: "Subir Puente de cadera" }).click();

    await page.getByRole("button", { name: "Guardar rutina" }).click();
    await expect(page).toHaveURL(/\/panel\/rutinas$/);

    const tarjeta = page.getByRole("article").filter({ hasText: "Mi rutina de prueba" });
    await expect(tarjeta).toBeVisible();
    await expect(tarjeta.getByText("5 × 6-8")).toBeVisible();
    // El puente quedó el primero del día 1.
    const nombres = await tarjeta.getByRole("listitem").allInnerTexts();
    expect(nombres[0]).toContain("Puente de cadera");
    expect(nombres[1]).toContain("Sentadillas sumo");
  });

  test("borrar la rutina deja Mis rutinas vacío con un mensaje útil", async ({ page }) => {
    await page.goto("/panel/rutinas");
    const tarjeta = page.getByRole("article").filter({ hasText: "Mi rutina de prueba" });
    await expect(tarjeta).toBeVisible();
    await tarjeta.getByRole("button", { name: "Borrar Mi rutina de prueba" }).click();
    await expect(page.getByRole("article").filter({ hasText: "Mi rutina de prueba" })).toHaveCount(0);
    await expect(page.getByText("Aún no has creado ninguna rutina")).toBeVisible();
  });
});
