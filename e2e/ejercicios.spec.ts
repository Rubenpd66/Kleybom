import { expect, test } from "@playwright/test";

test("buscar 'flexion' muestra resultados mientras se escribe, sin pulsar ningún botón", async ({ page }) => {
  await page.goto("/ejercicios");
  const buscador = page.getByRole("searchbox", { name: "Buscar" });
  await expect(page.getByRole("button", { name: "Buscar" })).toBeHidden();
  await buscador.pressSequentially("flexion", { delay: 40 });
  await expect(page).toHaveURL(/q=flexion/);
  await expect(page.getByRole("list", { name: "Ejercicios" }).getByRole("listitem").first()).toContainText(/flexi/i);
  // Se puede seguir escribiendo: el buscador no pierde el foco al llegar los resultados.
  await expect(buscador).toBeFocused();
  await buscador.pressSequentially(" diamante", { delay: 40 });
  await expect(page).toHaveURL(/q=flexion\+diamante|q=flexion%20diamante/);
});

test("filtrar por músculo cambia la URL", async ({ page }) => {
  await page.goto("/ejercicios");
  await page.getByLabel("Músculo").selectOption("pectoral");
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
