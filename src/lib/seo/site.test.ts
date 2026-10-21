import { describe, expect, it } from "vitest";
import { GUIAS } from "@/lib/guides/content";
import { articleLd, jsonLd, url, websiteLd } from "./site";

describe("seo", () => {
  it("construye direcciones absolutas sin barra doble", () => {
    expect(url("/")).toMatch(/^https?:\/\/[^/]+$/);
    expect(url("/guias")).toMatch(/^https?:\/\/[^/]+\/guias$/);
  });

  it("escapa < para que el JSON-LD no pueda cerrar la etiqueta script", () => {
    const texto = jsonLd({ nombre: "</script><script>alert(1)</script>" });
    expect(texto).not.toContain("<");
    expect(JSON.parse(texto).nombre).toBe("</script><script>alert(1)</script>");
  });

  it("WebSite y Organization se enlazan entre sí", () => {
    const [web, org] = websiteLd()["@graph"];
    expect(web["@type"]).toBe("WebSite");
    expect(org["@type"]).toBe("Organization");
    expect(web.publisher?.["@id"]).toBe(org["@id"]);
  });

  it("Article de una guía con fechas, dirección y fuentes", () => {
    const g = GUIAS[0];
    const a = articleLd(g);
    expect(a["@type"]).toBe("Article");
    expect(a.headline).toBe(g.titulo);
    expect(a.datePublished).toBe(g.publicada);
    expect(a.mainEntityOfPage).toBe(url(`/guias/${g.slug}`));
    expect(a.citation).toHaveLength(g.fuentes.length);
  });
});
