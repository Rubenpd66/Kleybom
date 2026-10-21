import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

try {
  process.loadEnvFile(".env.local");
} catch {
  // sin archivo: se usan las variables del entorno
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;

test("una ruta privada redirige a /entrar si no hay sesión", async ({ page }) => {
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/entrar(\?volver=.*)?$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("contraseña demasiado corta: mensaje claro en el registro", async ({ page }) => {
  await page.goto("/registro");
  await page.getByLabel("Correo electrónico").fill("alguien@correo.es");
  await page.getByLabel("Contraseña").fill("corta");
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("al menos 8 caracteres");
});

test("credenciales incorrectas: mensaje claro al entrar", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill("no-existe@correo.es");
  await page.getByLabel("Contraseña").fill("contraseña-incorrecta");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("no son correctos");
});

test("entrar y registro ofrecen continuar con Google", async ({ page }) => {
  for (const ruta of ["/entrar", "/registro"]) {
    await page.goto(ruta);
    await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible();
  }
});

test.describe("cuenta de Google sin consentimientos", () => {
  test.skip(!clave, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");

  // Se simula una cuenta creada con Google: proveedor "google" y sin consentimientos guardados.
  const correo = `test-google-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const contrasena = "contrasena-de-prueba-123";
  let id = "";
  const admin = () => createClient(url, clave!, { auth: { persistSession: false } });

  test.beforeAll(async () => {
    const { data, error } = await admin().auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
    if (error) throw error;
    id = data.user.id;
    await admin().auth.admin.updateUserById(id, { app_metadata: { provider: "google", providers: ["google"] } });
  });

  test.afterAll(async () => {
    if (id) await admin().auth.admin.deleteUser(id);
  });

  test("tiene que aceptar la privacidad y los datos de salud antes de usar la web", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("Correo electrónico").fill(correo);
    await page.getByLabel("Contraseña").fill(contrasena);
    await page.getByRole("button", { name: "Entrar" }).click();
    // Con Google se vuelve por /auth/callback (una petición nueva que pasa por el proxy); aquí, la siguiente visita.
    await expect(page).toHaveURL(/\/panel$/);
    await page.goto("/calendario");
    await expect(page).toHaveURL(/\/consentimiento/);

    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page.locator("form [role=alert]")).toContainText("política de privacidad");

    await page.getByLabel(/política de privacidad/).check();
    await page.getByLabel(/consentimiento expreso/).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page).toHaveURL(/\/calendario$/);

    const { data } = await admin().auth.admin.getUserById(id);
    expect(data.user?.user_metadata.privacidad_aceptada).toBeTruthy();
  });
});

test.describe("con una cuenta confirmada", () => {
  test.skip(!clave, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");

  const correo = `test-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const contrasena = "contrasena-de-prueba-123";
  let id = "";
  const admin = () => createClient(url, clave!, { auth: { persistSession: false } });

  test.beforeAll(async () => {
    const { data, error } = await admin().auth.admin.createUser({
      email: correo,
      password: contrasena,
      email_confirm: true,
    });
    if (error) throw error;
    id = data.user.id;
  });

  test.afterAll(async () => {
    if (id) await admin().auth.admin.deleteUser(id);
  });

  test("entrar, ver el panel y cerrar sesión", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("Correo electrónico").fill(correo);
    await page.getByLabel("Contraseña").fill(contrasena);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByText(correo)).toBeVisible();

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/entrar(\?volver=.*)?$/);

    await page.goto("/panel");
    await expect(page).toHaveURL(/\/entrar(\?volver=.*)?$/);
  });
});
