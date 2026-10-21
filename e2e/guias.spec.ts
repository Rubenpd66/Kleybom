import { expect, test } from "@playwright/test";
import { GUIAS as guias } from "../src/lib/guides/content";

// En `npm run dev` recién arrancado, compilar la ficha a la vez desde varias pruebas a veces da un 500.
// Una visita previa la deja compilada (en producción las guías ya vienen generadas).
test.beforeAll(async ({ request }) => {
  await request.get(`/guias/${guias[0].slug}`);
});

test("el listado muestra las 5 guías y se llega desde la portada", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Guías" })).toHaveCount(0);
  await page.getByRole("navigation", { name: "Secciones" }).getByRole("link", { name: /Guías/ }).click();
  await expect(page).toHaveURL(/\/guias$/);
  await expect(page.getByRole("heading", { level: 1, name: "Guías" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Guías" }).getByRole("listitem")).toHaveCount(5);
});

for (const g of guias) {
  test(`la guía «${g.titulo}» muestra título, metadatos, aviso y fuentes`, async ({ page }) => {
    const r = await page.goto(`/guias/${g.slug}`);
    expect(r?.status()).toBe(200);
    await expect(page).toHaveTitle(`${g.titulo} — KleyBom`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", g.resumen);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.getByRole("heading", { level: 1, name: g.titulo })).toBeVisible();
    await expect(page.getByText(/min de lectura/)).toBeVisible();
    await expect(page.locator(`time[datetime="${g.actualizada}"]`)).toBeVisible();
    await expect(page.getByRole("note")).toContainText("no sustituye a un médico");
    const fuentes = page.getByRole("heading", { name: "Fuentes" }).locator("..").getByRole("listitem");
    await expect(fuentes).toHaveCount(g.fuentes.length);
  });
}

test("una guía que no existe da 404", async ({ page }) => {
  const r = await page.goto("/guias/no-existe");
  expect(r?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Guía no encontrada" })).toBeVisible();
});

test("en móvil (375 px) las guías no tienen scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  for (const ruta of ["/guias", "/guias/progresion"]) {
    await page.goto(ruta);
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho).toBeLessThanOrEqual(375);
  }
});
