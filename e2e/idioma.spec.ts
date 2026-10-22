import { expect, test } from "@playwright/test";

test("el selector lleva a la versión inglesa (/en) y de vuelta a la española, cada una con su dirección", async ({ page }) => {
  await page.goto("/");
  const selector = page.getByRole("group", { name: "Idioma" });
  await expect(selector.getByRole("button", { name: "es" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  await selector.getByRole("button", { name: "en" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Eat. Train. Progress." })).toBeVisible();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  // Tras recargar, el botón responde cuando la página está lista: se reintenta.
  await expect(async () => {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#menu-lateral").getByRole("link", { name: "Macro calculator" })).toBeVisible({ timeout: 1000 });
  }).toPass();

  // Los datos también: ejercicios, recetas y guías salen en inglés.
  // Quien eligió inglés y entra por una dirección sin prefijo pasa a la inglesa.
  await page.goto("/ejercicios/sentadillas");
  await expect(page).toHaveURL(/\/en\/ejercicios\/sentadillas$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/squat/i);
  await expect(page.getByText("Main muscles")).toBeVisible();
  await page.goto("/recetas/gazpacho-andaluz");
  await expect(page.getByRole("heading", { level: 1, name: "Andalusian gazpacho" })).toBeVisible();
  await page.goto("/guias/descanso");
  await expect(page.getByRole("heading", { level: 1, name: "Rest and sleep" })).toBeVisible();

  await page.getByRole("group", { name: "Language" }).getByRole("button", { name: "es" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Descanso y sueño" })).toBeVisible();
  await expect(page).toHaveURL(/\/guias\/descanso$/);
});

test("el inglés tiene su propia dirección y el español, la normal; /es lleva a la normal", async ({ page }) => {
  await page.goto("/en/recetas");
  await expect(page).toHaveURL(/\/en\/recetas$/);
  await expect(page.getByRole("heading", { level: 1, name: "Recipes" })).toBeVisible();
  // Los enlaces internos de la versión inglesa se quedan en /en.
  await expect(page.getByRole("main").getByRole("link").first()).toHaveAttribute("href", /^\/en\//);
  await page.goto("/es");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Come. Entrena. Progresa." })).toBeVisible();
});

test("sin cookie, la dirección sin prefijo es siempre español (lo que ven los buscadores)", async ({ request }) => {
  const html = await (await request.get("/guias/descanso")).text();
  expect(html).toContain('<html lang="es"');
  const ingles = await (await request.get("/en/guias/descanso")).text();
  expect(ingles).toContain('<html lang="en"');
});

test("la zona privada también está protegida con el prefijo /en", async ({ page }) => {
  await page.goto("/en/panel");
  await expect(page).toHaveURL(/\/en\/entrar\?volver=%2Fpanel$/);
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/entrar\?volver=%2Fpanel$/);
});

test("en móvil (375 px) el selector de idioma cabe en la cabecera", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/");
  await expect(page.getByRole("group", { name: "Idioma" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
