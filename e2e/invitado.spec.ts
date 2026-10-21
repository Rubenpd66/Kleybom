import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

try {
  process.loadEnvFile(".env.local");
} catch {
  // sin archivo: se usan las variables del entorno
}

const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, servicio!, { auth: { persistSession: false } });

const ABIERTAS = ["/calendario", "/nutricion", "/nutricion/objetivos", "/entreno", "/estadisticas", "/panel/medidas", "/rutinas/nueva"];

test("sin cuenta se pueden ver el calendario, los registros y las estadísticas, con aviso para guardar", async ({ page }) => {
  for (const ruta of ABIERTAS) {
    const r = await page.goto(ruta);
    expect(r?.status(), ruta).toBe(200);
    expect(new URL(page.url()).pathname, ruta).toBe(ruta);
    const aviso = page.getByRole("complementary", { name: "Sin cuenta" });
    await expect(aviso, ruta).toContainText("no se guarda nada");
    await expect(aviso.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", `/entrar?volver=${encodeURIComponent(ruta)}`);
  }
});

test("la zona de cuenta sigue siendo privada y recuerda a dónde volver", async ({ page }) => {
  for (const ruta of ["/panel", "/panel/perfil", "/panel/rutinas"]) {
    await page.goto(ruta);
    await expect(page).toHaveURL(`/entrar?volver=${encodeURIComponent(ruta)}`);
  }
});

test("sin cuenta, al intentar guardar se pide entrar y no se guarda nada", async ({ page }) => {
  await page.goto("/calendario");
  await page.getByRole("button", { name: "Planificar", exact: true }).click();
  await expect(page.locator("form [role=alert]")).toContainText("Para guardar necesitas entrar en tu cuenta");
});

test.describe("volver tras entrar", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const correo = `test-volver-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const contrasena = "contrasena-de-prueba-123";
  let id = "";
  test.beforeAll(async () => {
    const { data, error } = await admin().auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
    if (error) throw error;
    id = data.user.id;
  });
  test.afterAll(async () => {
    if (id) await admin().auth.admin.deleteUser(id);
  });

  test("desde el aviso del calendario se entra y se vuelve al calendario", async ({ page }) => {
    await page.goto("/calendario");
    await page.getByRole("complementary", { name: "Sin cuenta" }).getByRole("link", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/entrar\?volver=%2Fcalendario$/);
    await page.getByLabel("Correo electrónico").fill(correo);
    await page.getByLabel("Contraseña").fill(contrasena);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/calendario$/);
    await expect(page.getByRole("complementary", { name: "Sin cuenta" })).toHaveCount(0);
  });
});
