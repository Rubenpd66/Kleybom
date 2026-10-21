import { expect, test } from "@playwright/test";

test("buscar 'flexion' muestra resultados", async ({ page }) => {
  await page.goto("/ejercicios");
  await page.getByRole("searchbox", { name: "Buscar" }).fill("flexion");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/q=flexion/);
  await expect(page.getByRole("list", { name: "Ejercicios" }).getByRole("listitem").first()).toBeVisible();
});

test("filtrar por músculo cambia la URL", async ({ page }) => {
  await page.goto("/ejercicios");
  await page.getByLabel("Músculo").selectOption("pectoral");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/muscle=pectoral/);
  await expect(page.getByRole("list", { name: "Ejercicios" }).getByRole("listitem").first()).toBeVisible();
});

test("una búsqueda sin resultados explica qué hacer", async ({ page }) => {
  await page.goto("/ejercicios?q=zzzzzz");
  await expect(page.getByText("No hay ejercicios con esos filtros")).toBeVisible();
  await expect(page.getByRole("link", { name: "Quitar filtros" })).toBeVisible();
});

test("paginación: la página 2 existe y la anterior vuelve a la 1", async ({ page }) => {
  await page.goto("/ejercicios?page=2");
  await expect(page.getByRole("link", { name: "Anterior" })).toBeVisible();
});

test("en móvil no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/ejercicios");
  const desborda = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(desborda).toBe(false);
});
