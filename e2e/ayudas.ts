import { expect, type Browser, type BrowserContext, type Page, type TestInfo } from "@playwright/test";

// Supabase limita los inicios de sesión por IP (unos 30 cada 5 minutos). Para no agotarlo,
// cada grupo de tests inicia sesión UNA vez por la pantalla real y reutiliza las cookies.
type Cookies = Awaited<ReturnType<BrowserContext["cookies"]>>;
const sesiones = new Map<string, Cookies>();

export async function iniciarSesionUnaVez(
  browser: Browser,
  info: TestInfo,
  correo: string,
  contrasena: string,
): Promise<void> {
  const contexto = await browser.newContext({ baseURL: info.project.use.baseURL });
  const page = await contexto.newPage();
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(correo);
  await page.getByLabel("Contraseña").fill(contrasena);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/panel$/);
  sesiones.set(correo, await contexto.cookies());
  await contexto.close();
}

// Pone las cookies de la sesión ya iniciada y abre el panel.
export async function entrarCon(page: Page, correo: string): Promise<void> {
  const cookies = sesiones.get(correo);
  if (!cookies) throw new Error(`No hay sesión guardada para ${correo}: llama antes a iniciarSesionUnaVez.`);
  await page.context().addCookies(cookies);
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/panel$/);
}
