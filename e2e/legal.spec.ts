import { expect, test } from "@playwright/test";

test("el pie lleva a las tres páginas legales y el aviso legal identifica al titular", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Aviso legal" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Aviso legal" })).toBeVisible();
  const titular = page.getByRole("heading", { name: "Titular de la web" }).locator("..");
  for (const dato of ["Ruben Perez Dominguez", "04657271R", "San Lorenzo de la Parrilla", "rubenpd66@gmail.com"]) {
    await expect(titular).toContainText(dato);
  }
  for (const [ruta, titulo] of [["/privacidad", "Política de privacidad"], ["/cookies", "Política de cookies"]]) {
    const r = await page.goto(ruta);
    expect(r?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
  }
});

test("la privacidad explica datos de salud, conservación, derechos y borrado", async ({ page }) => {
  await page.goto("/privacidad");
  const texto = page.getByRole("article");
  for (const frase of ["art. 9.2.a RGPD", "Cuánto tiempo los guardamos", "portabilidad", "borra tu cuenta", "www.aepd.es", "14 años"]) {
    await expect(texto).toContainText(frase);
  }
});

test("sin sesión no se instala ninguna cookie ni se carga ningún script de otro dominio", async ({ page, context }) => {
  const externos: string[] = [];
  page.on("request", (r) => {
    if (r.resourceType() === "script" && new URL(r.url()).host !== new URL(page.url() || "http://localhost:3000").host) externos.push(r.url());
  });
  for (const ruta of ["/", "/ejercicios", "/guias/descanso", "/alimentos"]) await page.goto(ruta);
  expect(externos).toEqual([]);
  expect(await context.cookies()).toEqual([]);
});

test("el registro exige aceptar la privacidad y el consentimiento de datos de salud", async ({ page }) => {
  await page.goto("/registro");
  const correo = `nadie-${Date.now()}@example.com`;
  await page.getByLabel("Correo electrónico").fill(correo);
  await page.getByLabel("Contraseña").fill("contrasena-larga-123");
  const crear = page.getByRole("button", { name: "Crear mi cuenta" });
  const alerta = page.locator("form [role=alert]");

  await crear.click();
  await expect(alerta).toContainText("política de privacidad");
  // Tras el error se conserva el correo (la contraseña, por seguridad, no).
  await expect(page.getByLabel("Correo electrónico")).toHaveValue(correo);

  await page.getByRole("checkbox", { name: /política de privacidad/ }).check();
  await page.getByLabel("Contraseña").fill("contrasena-larga-123");
  await crear.click();
  await expect(alerta).toContainText("datos de salud");
  await expect(page.getByRole("checkbox", { name: /política de privacidad/ })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: /consentimiento expreso/ })).not.toBeChecked();
});
