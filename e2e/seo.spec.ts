import { expect, test } from "@playwright/test";

test("robots.txt deja fuera las zonas privadas y enlaza el sitemap", async ({ request }) => {
  const texto = await (await request.get("/robots.txt")).text();
  expect(texto).toContain("Allow: /");
  for (const ruta of ["/panel", "/nutricion", "/entreno", "/api/"]) expect(texto).toContain(`Disallow: ${ruta}`);
  expect(texto).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
});

test("el sitemap incluye guías, rutinas, recetas, ejercicios y alimentos, y nada privado", async ({ request }) => {
  const r = await request.get("/sitemap.xml");
  expect(r.status()).toBe(200);
  const xml = await r.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  for (const ruta of ["/", "/guias", "/guias/empezar-a-entrenar", "/rutinas/movilidad-en-casa", "/recetas/tortilla-de-patatas", "/ejercicios/sentadillas", "/alimentos/platanos-crudos-173944"]) {
    expect(urls).toContain(ruta);
  }
  expect(urls.length).toBeGreaterThan(6000);
  expect(new Set(urls).size).toBe(urls.length);
  expect(urls.some((u) => /^\/(panel|nutricion|entreno|calendario|estadisticas)/.test(u))).toBe(false);
});

test("cada página pública tiene título y descripción propios", async ({ page }) => {
  const rutas = ["/", "/ejercicios", "/ejercicios/sentadillas", "/rutinas", "/rutinas/movilidad-en-casa", "/alimentos", "/alimentos/platanos-crudos-173944", "/recetas", "/recetas/tortilla-de-patatas", "/guias", "/guias/descanso"];
  const titulos = new Set<string>();
  const descripciones = new Set<string>();
  for (const ruta of rutas) {
    await page.goto(ruta);
    const titulo = await page.title();
    const descripcion = await page.locator('meta[name="description"]').getAttribute("content");
    expect(titulo, ruta).toBeTruthy();
    expect(descripcion, ruta).toBeTruthy();
    titulos.add(titulo);
    descripciones.add(descripcion!);
  }
  expect(titulos.size).toBe(rutas.length);
  expect(descripciones.size).toBe(rutas.length);
});

test("datos estructurados: WebSite y Organization en la portada, Article en las guías", async ({ page }) => {
  const leer = async () => Promise.all((await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)));
  await page.goto("/");
  const portada = (await leer()).flatMap((d) => d["@graph"] ?? [d]).map((d) => d["@type"]);
  expect(portada).toEqual(expect.arrayContaining(["WebSite", "Organization"]));

  await page.goto("/guias/habitos");
  const [articulo] = await leer();
  expect(articulo["@type"]).toBe("Article");
  expect(articulo.headline).toBe("Crear el hábito");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/guias\/habitos$/);
});
