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
  // Hasta que la página no está lista (hidratada), Enter no hace nada: se reintenta.
  await expect(async () => {
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(boton).toHaveAttribute("aria-expanded", "true", { timeout: 1000 });
  }).toPass();
  const menu = page.locator("#menu-lateral");
  await expect(menu.getByRole("link", { name: "Entrar" })).toBeFocused();
  await expect(boton).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("inert", "");
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeFocused();
});
