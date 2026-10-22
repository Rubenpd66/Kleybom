import { expect, test } from "@playwright/test";

test("el selector cambia toda la web al inglés y vuelve al español, sin cambiar la dirección", async ({ page }) => {
  await page.goto("/");
  const selector = page.getByRole("group", { name: "Idioma" });
  await expect(selector.getByRole("button", { name: "es" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  await selector.getByRole("button", { name: "en" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Eat. Train. Progress." })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  // Tras recargar, el botón responde cuando la página está lista: se reintenta.
  await expect(async () => {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#menu-lateral").getByRole("link", { name: "Macro calculator" })).toBeVisible({ timeout: 1000 });
  }).toPass();

  // Los datos también: ejercicios, recetas y guías salen en inglés.
  await page.goto("/ejercicios/sentadillas");
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

test("una dirección con /en/ guarda el inglés y lleva a la dirección normal", async ({ page }) => {
  await page.goto("/en/recetas");
  await expect(page).toHaveURL(/\/recetas$/);
  await expect(page.getByRole("heading", { level: 1, name: "Recipes" })).toBeVisible();
  await page.goto("/es");
  await expect(page.getByRole("heading", { level: 1, name: "Come. Entrena. Progresa." })).toBeVisible();
});

test("en móvil (375 px) el selector de idioma cabe en la cabecera", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/");
  await expect(page.getByRole("group", { name: "Idioma" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
