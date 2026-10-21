import { expect, test, type Page } from "@playwright/test";

// Lee la animación y la transición calculadas de un elemento.
const movimiento = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { animacion: s.animationName, transicion: s.transitionDuration };
  });

test.describe("en 375 px con movimiento normal", () => {
  test.use({ viewport: { width: 375, height: 700 } });

  test("el menú móvil entra con transición", async ({ page }) => {
    await page.goto("/guias");
    await page.getByRole("button", { name: "Abrir menú" }).click();
    expect((await movimiento(page, "#menu-movil")).transicion).not.toBe("0s");
    await expect(page.locator("#menu-movil")).toHaveCSS("opacity", "1");
  });
});

test.describe("en 375 px con prefers-reduced-motion: reduce", () => {
  test.use({ viewport: { width: 375, height: 700 }, reducedMotion: "reduce" });

  test("no hay animaciones ni transiciones y todo se ve", async ({ page }) => {
    await page.goto("/guias");
    expect(await movimiento(page, ".tarjeta-hover")).toEqual({ animacion: "none", transicion: "0s" });
    await page.getByRole("button", { name: "Abrir menú" }).click();
    const menu = page.locator("#menu-movil");
    expect(await movimiento(page, "#menu-movil")).toEqual({ animacion: "none", transicion: "0s" });
    await expect(menu).toHaveCSS("opacity", "1");
    await expect(menu.getByRole("link", { name: "Ejercicios" })).toBeVisible();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});
