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

// Que tampoco se descargue three.js en móvil se comprobó con la build de producción
// (9 scripts frente a 12 en escritorio); `next dev` precarga los módulos dinámicos y aquí no sirve.
test("en móvil (375 px) no se dibuja el fondo", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/estadisticas");
  await page.waitForTimeout(5000); // más que la espera hasta que el navegador está libre
  await expect(lienzo(page)).not.toHaveClass(/fondo-visible/);
  await expect(lienzo(page)).not.toHaveAttribute("data-animando", /.*/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
