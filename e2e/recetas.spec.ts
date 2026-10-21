import { expect, test } from "@playwright/test";

test("el listado muestra las 30 recetas", async ({ page }) => {
  await page.goto("/recetas");
  await expect(page.getByRole("heading", { level: 1, name: "Recetas" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Recetas" }).getByRole("listitem")).toHaveCount(30);
});

test("la ficha muestra ingredientes, pasos y nutrientes por ración", async ({ page }) => {
  await page.goto("/recetas");
  await page.getByRole("link", { name: "Tortilla de patatas" }).click();
  await expect(page).toHaveURL(/\/recetas\/tortilla-de-patatas$/);
  await expect(page.getByRole("heading", { level: 1, name: "Tortilla de patatas" })).toBeVisible();
  await expect(page.getByRole("article").getByText("4 raciones", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Huevo, entero, crudo, fresco/ })).toBeVisible();
  await expect(page.getByText("300 g")).toBeVisible();
  await expect(page.getByRole("list", { name: "Pasos" }).getByRole("listitem")).toHaveCount(5);
  const tabla = page.getByRole("table", { name: /por ración/ });
  await expect(tabla.getByRole("row", { name: /Energía/ })).toContainText("326,2 kcal");
  await expect(page.getByText("no sustituye a un profesional")).toBeVisible();
});

test("una receta que no existe muestra la página de no encontrado", async ({ page }) => {
  await page.goto("/recetas/no-existe");
  await expect(page.getByRole("heading", { name: "Receta no encontrada" })).toBeVisible();
});

test("en móvil no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  for (const ruta of ["/recetas", "/recetas/pollo-con-arroz-y-brocoli"]) {
    await page.goto(ruta);
    const desborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desborda, ruta).toBe(false);
  }
});
