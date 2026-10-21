import { expect, test } from "@playwright/test";

test("al pulsar un músculo en el mapa se filtran los ejercicios y se marca en el selector", async ({ page }) => {
  await page.goto("/ejercicios?q=press");
  const mapa = page.getByRole("region", { name: "Elige en el cuerpo" });
  await expect(mapa.getByRole("img", { name: /Mapa del cuerpo/ })).toBeVisible();

  // El pecho es la primera zona del dibujo frontal de react-body-highlighter.
  await mapa.locator("figure").first().locator("polygon").first().click();
  await expect(page).toHaveURL(/\/ejercicios\?q=press&muscle=pectoral$/);
  await expect(page.getByLabel("Músculo")).toHaveValue("pectoral");
  await expect(page.getByLabel("Buscar por nombre")).toHaveValue("press");
  await expect(mapa).toContainText("Músculo elegido: Pectoral.");
  await expect(page.getByRole("list", { name: "Ejercicios" })).toContainText("Press de banca");

  await mapa.getByRole("link", { name: "Quitar" }).click();
  await expect(page).toHaveURL(/\/ejercicios\?q=press$/);
  await expect(page.getByLabel("Músculo")).toHaveValue("");
});

test("en móvil (375 px) el mapa cabe sin scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/ejercicios");
  await expect(page.getByRole("region", { name: "Elige en el cuerpo" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
