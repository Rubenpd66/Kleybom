import { expect, test } from "@playwright/test";

// Ejercicio real importado de wger (autor "cybro", CC-BY-SA 4).
const URL = "/ejercicios/puente-de-cadera";

test("la ficha muestra nombre, músculos, pasos y atribución", async ({ page }) => {
  await page.goto(URL);
  await expect(page.getByRole("heading", { level: 1, name: "Puente de cadera" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Músculos principales" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Músculos secundarios" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cómo se hace" })).toBeVisible();
  await expect(page.getByText("cybro")).toBeVisible();
  await expect(page.getByRole("link", { name: /CC-BY-SA 4/ })).toBeVisible();
  await expect(page).toHaveTitle(/Puente de cadera/);
});

test("un slug inexistente muestra la página de no encontrado", async ({ page }) => {
  await page.goto("/ejercicios/no-existe-este-ejercicio");
  await expect(page.getByRole("heading", { name: "Ejercicio no encontrado" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
});

test("desde el listado se llega a la ficha", async ({ page }) => {
  await page.goto("/ejercicios?q=puente+de+cadera");
  await page.getByRole("link", { name: "Puente de cadera" }).first().click();
  await expect(page).toHaveURL(/\/ejercicios\/puente-de-cadera/);
});
