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
  // La zona es ancha (40 px): no hace falta llegar al último píxel, donde está la barra de desplazamiento.
  await page.mouse.move(width - 30, 300, { steps: 5 });
  await expect(menu).not.toHaveAttribute("inert");
  for (const nombre of ["Entrar", "Ejercicios", "Rutinas", "Calendario", "Diario de comidas", "Calculadora de macros", "Alimentos", "Recetas", "Guías", "Estadísticas"]) {
    await expect(menu.getByRole("link", { name: nombre, exact: true })).toBeVisible();
  }
  await page.mouse.move(200, 300, { steps: 5 });
  await expect(menu).toHaveAttribute("inert", "");
});

test("el menú lateral se abre al pasar el ratón por el botón Menú", async ({ page }) => {
  await page.goto("/");
  const menu = page.locator("#menu-lateral");
  await expect(menu).toHaveAttribute("inert", "");
  await page.getByRole("banner").getByRole("button", { name: "Abrir menú" }).hover();
  await expect(menu).not.toHaveAttribute("inert");
});

test("en pantalla grande el menú se abre en toda la franja derecha, pero no encima de un enlace", async ({ page }) => {
  await page.setViewportSize({ width: 1900, height: 1000 });
  await page.goto("/");
  const menu = page.locator("#menu-lateral");
  const boton = (await page.getByRole("banner").getByRole("button", { name: "Abrir menú" }).boundingBox())!;
  // La página tiene un ancho máximo: a 1900 px queda margen a los lados.
  const contenido = (await page.getByRole("main").locator("> div").first().boundingBox())!;
  expect(contenido.x).toBeGreaterThan(150);
  // Encima de un enlace de la tarjeta de músculos (dentro de la franja) no se abre.
  const enlace = page.getByRole("region", { name: "¿Qué trabajas hoy?" }).getByRole("link").first();
  const caja = (await enlace.boundingBox())!;
  const x = Math.max(boton.x + 10, caja.x + 10);
  await page.mouse.move(200, 500);
  await page.mouse.move(x, caja.y + caja.height / 2, { steps: 4 });
  await page.waitForTimeout(500);
  await expect(menu).toHaveAttribute("inert", "");
  // En un hueco libre de la franja (sin enlaces ni botones debajo), sí.
  const libreY = await page.evaluate((px) => {
    for (let y = 120; y < innerHeight; y += 10) {
      const el = document.elementFromPoint(px, y);
      if (el && !el.closest("a, button, input, select, textarea, label, [role='button']")) return y;
    }
    return -1;
  }, boton.x + 20);
  expect(libreY).toBeGreaterThan(0);
  await page.mouse.move(boton.x + 20, libreY, { steps: 4 });
  await expect(menu).not.toHaveAttribute("inert");
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
