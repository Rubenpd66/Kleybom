import { expect, test } from "@playwright/test";

test("buscar 'platano' encuentra 'Plátanos, crudos' el primero", async ({ page }) => {
  await page.goto("/alimentos");
  await page.getByRole("searchbox", { name: "Buscar alimento" }).fill("platano");
  await expect(page).toHaveURL(/q=platano/);
  const primero = page.getByRole("list", { name: "Alimentos" }).getByRole("listitem").first();
  await expect(primero).toContainText("Plátanos, crudos");
  await expect(primero).toContainText("89 kcal");
});

test("varias palabras en cualquier orden", async ({ page }) => {
  await page.goto("/alimentos?q=crudos+platanos");
  await expect(page.getByRole("link", { name: /Plátanos, crudos/ })).toBeVisible();
});

test("sin resultados explica qué hacer", async ({ page }) => {
  await page.goto("/alimentos?q=zzzzqqq");
  await expect(page.getByText("No hay alimentos con ese nombre")).toBeVisible();
});

test("la ficha muestra la tabla por 100 g, el reparto de calorías y la fuente", async ({ page }) => {
  await page.goto("/alimentos/platanos-crudos-173944");
  await expect(page.getByRole("heading", { level: 1, name: "Plátanos, crudos" })).toBeVisible();
  const tabla = page.getByRole("table", { name: /por 100 g/ });
  await expect(tabla.getByRole("row", { name: /Energía/ })).toContainText("89 kcal");
  await expect(tabla.getByRole("row", { name: /Hidratos de carbono/ })).toContainText("22,8 g");
  await expect(page.getByRole("img", { name: /Reparto de calorías/ })).toBeVisible();
  await expect(page.getByText("FoodData Central")).toBeVisible();
  await expect(page).toHaveTitle(/Plátanos, crudos/);
});

test("un nutriente ausente se muestra como '— sin dato', nunca como 0", async ({ page }) => {
  await page.goto("/alimentos/molusco-almeja-varias-especies-cocinado-empanado-y-frito-171974");
  const fibra = page.getByRole("row", { name: /Fibra/ });
  await expect(fibra).toContainText("—");
  await expect(fibra).not.toContainText("0 g");
});

test("desde el listado se llega a la ficha", async ({ page }) => {
  await page.goto("/alimentos?q=platanos+crudos");
  await page.getByRole("link", { name: /Plátanos, crudos/ }).click();
  await expect(page).toHaveURL(/\/alimentos\/platanos-crudos-173944$/);
});

test("un alimento que no existe muestra la página de no encontrado", async ({ page }) => {
  await page.goto("/alimentos/no-existe");
  await expect(page.getByRole("heading", { name: "Alimento no encontrado" })).toBeVisible();
});

test("en móvil no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  for (const ruta of ["/alimentos?q=pollo", "/alimentos/platanos-crudos-173944"]) {
    await page.goto(ruta);
    const desborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desborda, ruta).toBe(false);
  }
});

test("código de barras: un código no válido da un mensaje claro", async ({ page }) => {
  await page.goto("/alimentos");
  await page.getByRole("link", { name: "Buscar por código de barras" }).click();
  await page.getByLabel("Código de barras (EAN)").fill("12ab");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.locator("main [role=alert]")).toContainText("no es válido");
});

test("la API de Open Food Facts rechaza códigos no válidos", async ({ request }) => {
  const r = await request.get("/api/openfoodfacts/abc");
  expect(r.status()).toBe(400);
});
