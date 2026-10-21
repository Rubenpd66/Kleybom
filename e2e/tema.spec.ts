import { expect, test } from "@playwright/test";

const fondo = (page: import("@playwright/test").Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test("sigue el tema del sistema: claro y oscuro", async ({ browser }) => {
  for (const [esquema, color] of [["light", "rgb(237, 239, 234)"], ["dark", "rgb(17, 20, 22)"]] as const) {
    const contexto = await browser.newContext({ colorScheme: esquema });
    const page = await contexto.newPage();
    await page.goto("/");
    expect(await fondo(page)).toBe(color);
    await contexto.close();
  }
});

test("el botón cambia el tema, se recuerda al volver y no parpadea", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Cambiar a modo oscuro" }).click();
  expect(await fondo(page)).toBe("rgb(17, 20, 22)");
  await expect(page.getByRole("button", { name: "Cambiar a modo claro" })).toBeVisible();
  // Al recargar, el script del <head> aplica el tema antes de pintar.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "oscuro");
  expect(await fondo(page)).toBe("rgb(17, 20, 22)");
});

test("la cabecera solo muestra el icono KB, con nombre accesible", async ({ page }) => {
  await page.goto("/ejercicios");
  const logo = page.getByRole("banner").getByRole("link", { name: "KleyBom: ir al inicio" });
  await expect(logo).toBeVisible();
  await expect(logo).toHaveText("");
});
