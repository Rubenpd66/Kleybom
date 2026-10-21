import { expect, test } from "@playwright/test";

const lienzo = (page: import("@playwright/test").Page) => page.locator("canvas.fondo-3d");

test("cada sección carga su propio fondo 3D, detrás del contenido y oculto a lectores de pantalla", async ({ page }) => {
  const vistas = new Set<string>();
  for (const [ruta, escena] of [["/", "chispas"], ["/ejercicios", "discos"], ["/guias", "camino"], ["/calendario", "semana"]] as const) {
    await page.goto(ruta);
    await expect(lienzo(page)).toHaveClass(/fondo-visible/, { timeout: 15000 });
    await expect(lienzo(page)).toHaveAttribute("data-escena", escena);
    await expect(lienzo(page)).toHaveAttribute("aria-hidden", "true");
    // "si" con tarjeta gráfica; el navegador de pruebas dibuja por software y lo deja quieto ("no").
    await expect(lienzo(page)).toHaveAttribute("data-animando", /^(si|no)$/);
    await expect(lienzo(page)).toHaveCSS("position", "fixed");
    await expect(lienzo(page)).toHaveCSS("pointer-events", "none");
    vistas.add(escena);
  }
  expect(vistas.size).toBe(4);
});

test("el fondo no tapa nada: los enlaces se pueden pulsar encima", async ({ page }) => {
  await page.goto("/ejercicios");
  await expect(lienzo(page)).toHaveClass(/fondo-visible/, { timeout: 15000 });
  await page.getByRole("banner").getByRole("link", { name: "Rutinas" }).click();
  await expect(page).toHaveURL(/\/rutinas$/);
  await expect(lienzo(page)).toHaveAttribute("data-escena", "series", { timeout: 15000 });
});

test("las páginas legales no llevan fondo", async ({ page }) => {
  await page.goto("/privacidad");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(lienzo(page)).toHaveCount(0);
});

test.describe("con prefers-reduced-motion: reduce", () => {
  test.use({ reducedMotion: "reduce" });
  test("el fondo se dibuja quieto, sin animación", async ({ page }) => {
    await page.goto("/guias");
    await expect(lienzo(page)).toHaveAttribute("data-animando", "no", { timeout: 15000 });
  });
});

// En móvil el fondo (versión ligera) no se carga al abrir la página, solo tras el primer gesto:
// así no frena la carga. Que three.js no se descargue antes se comprueba con la build de producción;
// `next dev` precarga los módulos dinámicos.
test("en móvil (375 px) el fondo aparece tras el primer gesto, no al abrir la página", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/estadisticas");
  await page.waitForTimeout(4000); // más que la espera hasta que el navegador está libre
  await expect(lienzo(page)).not.toHaveClass(/fondo-visible/);
  await page.mouse.wheel(0, 300);
  await expect(lienzo(page)).toHaveClass(/fondo-visible/, { timeout: 15000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("al cambiar de tema el fondo se vuelve a dibujar con los colores nuevos", async ({ page }) => {
  await page.goto("/guias");
  await expect(lienzo(page)).toHaveClass(/fondo-visible/, { timeout: 15000 });
  const antes = await lienzo(page).elementHandle();
  await page.getByRole("button", { name: /Cambiar a modo (oscuro|claro)/ }).click();
  await expect(lienzo(page)).toHaveClass(/fondo-visible/, { timeout: 15000 });
  // Lienzo nuevo (la escena lee los colores al montarse).
  expect(await page.evaluate((viejo) => viejo !== document.querySelector("canvas.fondo-3d"), antes)).toBe(true);
});
