import { expect, test } from "@playwright/test";

test("la portada es breve y lleva a ejercicios y al registro", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Entrena. Come. Progresa." })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Explorar ejercicios" })).toHaveAttribute("href", "/ejercicios");
  await expect(page.getByRole("main").getByRole("link", { name: "Crear mi cuenta" })).toHaveAttribute("href", "/registro");
  // Sin fotos estáticas: la parte visual son el fondo 3D y los elementos interactivos.
  await expect(page.getByRole("main").locator("img, picture")).toHaveCount(0);
});

test("los accesos muestran las cifras reales del catálogo", async ({ page }) => {
  await page.goto("/");
  const accesos = page.getByRole("navigation", { name: "Secciones" });
  await expect(accesos.getByRole("link")).toHaveCount(6);
  await expect(accesos.getByRole("link", { name: /Ejercicios/ })).toContainText(/\d{3}/);
  // En español los números de 4 cifras van sin punto (6038); a partir de 5, con punto (10.000).
  await expect(accesos.getByRole("link", { name: /Alimentos/ })).toContainText(/\d{4}/);
});

test("el selector de músculos cambia los ejercicios con datos reales", async ({ page }) => {
  await page.goto("/");
  const grupos = page.getByRole("group", { name: "Grupos musculares" });
  await expect(grupos.getByRole("button", { name: "Pecho" })).toHaveAttribute("aria-pressed", "true");
  const lista = page.getByRole("region", { name: "¿Qué trabajas hoy?" }).getByRole("list");
  await expect(lista.getByRole("listitem")).toHaveCount(3);
  await expect(lista).toContainText("Press de banca con mancuernas");

  await grupos.getByRole("button", { name: "Piernas" }).click();
  await expect(grupos.getByRole("button", { name: "Piernas" })).toHaveAttribute("aria-pressed", "true");
  await expect(lista).toContainText("Sentadillas");
  await expect(page.getByRole("link", { name: "Todos los de piernas" })).toHaveAttribute("href", "/ejercicios?muscle=cuadriceps");

  await lista.getByRole("link", { name: /Sentadillas/ }).click();
  await expect(page).toHaveURL(/\/ejercicios\/sentadillas$/);
});

test("al compartir en redes se usa la imagen de 1200 × 630", async ({ page }) => {
  for (const ruta of ["/", "/guias/descanso"]) {
    await page.goto(ruta);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/img\/compartir\.jpg$/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  }
});

test("en móvil (375 px) la portada no tiene scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
