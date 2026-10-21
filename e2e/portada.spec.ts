import { expect, test } from "@playwright/test";

test("la portada presenta la web y lleva a ejercicios y al registro", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Entrena, come y progresa/ })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Explorar ejercicios" })).toHaveAttribute("href", "/ejercicios");
  await expect(page.getByRole("main").getByRole("link", { name: "Crear mi cuenta" })).toHaveAttribute("href", "/registro");
});

test("el selector de músculos cambia los ejercicios con datos reales", async ({ page }) => {
  await page.goto("/");
  const grupos = page.getByRole("group", { name: "Grupos musculares" });
  await expect(grupos.getByRole("button", { name: "Pecho" })).toHaveAttribute("aria-pressed", "true");
  const lista = page.getByRole("region", { name: "¿Qué quieres trabajar hoy?" }).getByRole("list");
  await expect(lista.getByRole("listitem")).toHaveCount(3);
  await expect(lista).toContainText("Press de banca con mancuernas");

  await grupos.getByRole("button", { name: "Piernas" }).click();
  await expect(grupos.getByRole("button", { name: "Piernas" })).toHaveAttribute("aria-pressed", "true");
  await expect(grupos.getByRole("button", { name: "Pecho" })).toHaveAttribute("aria-pressed", "false");
  await expect(lista).toContainText("Sentadillas");
  await expect(page.getByRole("link", { name: "Ver todos los ejercicios de piernas" })).toHaveAttribute("href", "/ejercicios?muscle=cuadriceps");

  await lista.getByRole("link", { name: /Sentadillas/ }).click();
  await expect(page).toHaveURL(/\/ejercicios\/sentadillas$/);
});

test("muestra una ficha de ejercicio y un alimento reales, con su fuente", async ({ page }) => {
  await page.goto("/");
  const ficha = page.getByRole("article", { name: "Press de banca con mancuernas" });
  await expect(ficha.getByRole("listitem").filter({ hasText: "Pectoral" })).toBeVisible();
  await expect(ficha).toContainText("licencia CC-BY-SA");
  const tabla = page.getByRole("table", { name: /Plátanos, crudos · por 100 g/ });
  await expect(tabla.getByRole("row", { name: /Energía/ })).toContainText("89 kcal");
  await expect(page.getByText("Gráfico de ejemplo con datos inventados.")).toBeVisible();
});

test("en móvil (375 px) la portada no tiene scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
