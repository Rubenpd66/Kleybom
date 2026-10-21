import { expect, test } from "@playwright/test";

test("el pie muestra el aviso de salud", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("no sustituye a un médico")).toBeVisible();
});

test("en 375 px el menú se abre y no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.locator("#menu-movil").getByRole("link", { name: "Ejercicios" })).toBeVisible();
  const desborda = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(desborda).toBe(false);
});
