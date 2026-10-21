import { expect, test } from "@playwright/test";

const lista = (page: import("@playwright/test").Page) =>
  page.getByRole("list", { name: "Rutinas" }).getByRole("listitem");

test("el listado muestra las 6 plantillas", async ({ page }) => {
  await page.goto("/rutinas");
  await expect(page.getByRole("heading", { level: 1, name: "Rutinas" })).toBeVisible();
  // No se cuenta exacto: los tests de seguridad crean plantillas temporales en paralelo.
  for (const nombre of [
    "Cuerpo completo para principiantes (3 días)",
    "Torso / pierna (4 días)",
    "Empuje / tirón / pierna (6 días)",
    "Fuerza básica (3 días)",
    "Movilidad en casa",
    "Iniciación sin material (3 días)",
  ]) {
    await expect(page.getByRole("link", { name: nombre })).toBeVisible();
  }
});

test("filtrar por objetivo cambia la URL y el resultado", async ({ page }) => {
  await page.goto("/rutinas");
  await page.getByLabel("Objetivo").selectOption("movilidad");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page).toHaveURL(/goal=movilidad/);
  await expect(lista(page)).toHaveCount(1);
  await expect(page.getByText("Movilidad en casa")).toBeVisible();
});

test("filtrar por nivel", async ({ page }) => {
  await page.goto("/rutinas?level=avanzado");
  await expect(lista(page)).toHaveCount(1);
  await expect(page.getByText("Empuje / tirón / pierna (6 días)")).toBeVisible();
});

test("sin resultados explica qué hacer", async ({ page }) => {
  await page.goto("/rutinas?goal=perdida_grasa");
  await expect(page.getByText("No hay rutinas con esos filtros")).toBeVisible();
  await expect(page.getByRole("link", { name: "Quitar filtros" })).toBeVisible();
});

test("el detalle muestra los días, series, repeticiones y enlaces a los ejercicios", async ({ page }) => {
  await page.goto("/rutinas/fuerza-basica-3-dias");
  await expect(page.getByRole("heading", { level: 1, name: /Fuerza básica/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Día 1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Día 3" })).toBeVisible();
  await expect(page.getByText("5 × 5").first()).toBeVisible();
  await expect(page.getByText("profesional sanitario").first()).toBeVisible();

  await page.getByRole("link", { name: "Sentadillas" }).first().click();
  await expect(page).toHaveURL(/\/ejercicios\/sentadillas$/);
});

test("los ejercicios por tiempo muestran la duración y no '3 × 1'", async ({ page }) => {
  await page.goto("/rutinas/iniciacion-sin-material");
  await expect(page.getByText("Mantén la posición de 20 a 30 segundos.").first()).toBeVisible();
  await expect(page.getByText("3 × 1", { exact: true })).toHaveCount(0);
});

test("una rutina que no existe muestra la página de no encontrado", async ({ page }) => {
  await page.goto("/rutinas/no-existe");
  await expect(page.getByRole("heading", { name: "Rutina no encontrada" })).toBeVisible();
});

test("en móvil no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  for (const ruta of ["/rutinas", "/rutinas/torso-pierna-4-dias"]) {
    await page.goto(ruta);
    const desborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desborda, ruta).toBe(false);
  }
});

test("al imprimir no salen la cabecera, el pie ni el botón, y sí la tabla de la rutina", async ({ page }) => {
  await page.goto("/rutinas/fuerza-basica-3-dias");
  await expect(page.getByRole("button", { name: "Imprimir / guardar PDF" })).toBeVisible();
  await expect(page.locator("header")).toBeVisible();

  await page.emulateMedia({ media: "print" });
  await expect(page.locator("header")).toBeHidden();
  await expect(page.locator("footer").first()).toBeHidden();
  await expect(page.getByRole("button", { name: "Imprimir / guardar PDF" })).toBeHidden();
  await expect(page.getByRole("table").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: /Fuerza básica/ })).toBeVisible();
});

test("el botón de imprimir abre el diálogo de impresión", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __impreso: number }).__impreso = 0;
    window.print = () => {
      (window as unknown as { __impreso: number }).__impreso++;
    };
  });
  await page.goto("/rutinas/fuerza-basica-3-dias");
  await page.getByRole("button", { name: "Imprimir / guardar PDF" }).click();
  expect(await page.evaluate(() => (window as unknown as { __impreso: number }).__impreso)).toBe(1);
});
