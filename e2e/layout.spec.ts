import { expect, test } from "@playwright/test";

test("el pie muestra el aviso de salud", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("no sustituye a un médico")).toBeVisible();
});

test("en 375 px el menú se abre y no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.locator("#menu-lateral").getByRole("link", { name: "Ejercicios" })).toBeVisible();
  const desborda = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(desborda).toBe(false);
});

test("el menú lateral tiene todas las secciones y se abre al acercar el ratón al borde derecho", async ({ page }) => {
  await page.goto("/");
  const menu = page.locator("#menu-lateral");
  await expect(menu).toHaveAttribute("inert", "");
  const { width } = page.viewportSize()!;
  await page.mouse.move(width - 300, 300);
  await page.mouse.move(width - 4, 300, { steps: 5 });
  await expect(menu).not.toHaveAttribute("inert");
  for (const nombre of ["Entrar", "Ejercicios", "Rutinas", "Calendario", "Diario de comidas", "Calculadora de macros", "Alimentos", "Recetas", "Guías", "Estadísticas"]) {
    await expect(menu.getByRole("link", { name: nombre, exact: true })).toBeVisible();
  }
  await page.mouse.move(200, 300, { steps: 5 });
  await expect(menu).toHaveAttribute("inert", "");
});

test("el buscador de la cabecera encuentra en toda la web y lleva a la página de resultados", async ({ page }) => {
  await page.goto("/");
  const caja = page.getByRole("banner").getByRole("combobox");
  const lista = page.getByRole("listbox");
  // Hasta que la página no está lista, escribir no busca: se reintenta.
  const escribir = async (texto: string, espera: RegExp) =>
    expect(async () => {
      await caja.fill("");
      await caja.fill(texto);
      await expect(lista.getByRole("option", { name: espera })).toBeVisible({ timeout: 3000 });
    }).toPass();
  await escribir("gazpacho", /Gazpacho andaluz/);
  await caja.press("ArrowDown");
  await caja.press("Enter");
  await expect(page).toHaveURL(/\/recetas\/gazpacho-andaluz$/);

  await page.goto("/");
  await escribir("calculadora", /Calculadora de macros/);
  await caja.press("Enter");
  await expect(page).toHaveURL(/\/buscar\?q=calculadora$/);
  await expect(page.getByRole("main").getByRole("link", { name: /Calculadora de macros/ })).toBeVisible();
});
