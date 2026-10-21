import { expect, test } from "@playwright/test";

test("el primer Tab muestra «Saltar al contenido» y lleva al contenido principal", async ({ page }) => {
  await page.goto("/ejercicios");
  await page.keyboard.press("Tab");
  const saltar = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(saltar).toBeFocused();
  await expect(saltar).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenido$/);
});

test("todo lo enfocable lleva un contorno visible", async ({ page }) => {
  await page.goto("/guias");
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const contorno = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const s = getComputedStyle(el);
      return { estilo: s.outlineStyle, ancho: parseFloat(s.outlineWidth) };
    });
    expect(contorno.estilo).not.toBe("none");
    expect(contorno.ancho).toBeGreaterThanOrEqual(2);
  }
});

test("en móvil (375 px) el menú se abre con teclado y Escape lo cierra devolviendo el foco", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/");
  const boton = page.getByRole("button", { name: "Abrir menú" });
  await boton.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#menu-movil")).toBeVisible();
  await expect(page.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.locator("#menu-movil")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeFocused();
});
