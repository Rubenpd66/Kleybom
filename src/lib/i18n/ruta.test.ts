import { describe, expect, it } from "vitest";
import { conIdioma, idiomaEnRuta, llevaIdioma, sinIdioma } from "./ruta";

describe("llevaIdioma", () => {
  it("las páginas llevan idioma", () => {
    for (const r of ["/", "/ejercicios", "/ejercicios/sentadillas", "/panel/perfil", "/autor"]) expect(llevaIdioma(r)).toBe(true);
  });
  it("la API, la vuelta del login y los archivos especiales no", () => {
    for (const r of ["/api/health", "/auth/callback", "/robots.txt", "/sitemap.xml", "/ads.txt", "/favicon.ico", "/icon.svg", "/apple-icon.png"]) {
      expect(llevaIdioma(r)).toBe(false);
    }
  });
});

describe("idiomaEnRuta", () => {
  it("reconoce /en/... y /es", () => {
    expect(idiomaEnRuta("/en/ejercicios")).toEqual({ idioma: "en", resto: "/ejercicios" });
    expect(idiomaEnRuta("/es")).toEqual({ idioma: "es", resto: "/" });
  });
  it("no confunde otras rutas", () => {
    expect(idiomaEnRuta("/ejercicios")).toBeNull();
    expect(idiomaEnRuta("/fr/algo")).toBeNull();
    expect(idiomaEnRuta("/entreno")).toBeNull();
  });
});

describe("sinIdioma", () => {
  it("quita el idioma de la ruta interna y deja igual la visible", () => {
    expect(sinIdioma("/es/guias")).toBe("/guias");
    expect(sinIdioma("/en")).toBe("/");
    expect(sinIdioma("/guias")).toBe("/guias");
    expect(sinIdioma("/entreno")).toBe("/entreno");
  });
});

describe("conIdioma", () => {
  it("el español va sin prefijo y el inglés con /en", () => {
    expect(conIdioma("es", "/ejercicios")).toBe("/ejercicios");
    expect(conIdioma("en", "/ejercicios")).toBe("/en/ejercicios");
    expect(conIdioma("en", "/")).toBe("/en");
    expect(conIdioma("en", "/?cuenta=borrada")).toBe("/en?cuenta=borrada");
    expect(conIdioma("en", "/ejercicios?muscle=pecho#lista")).toBe("/en/ejercicios?muscle=pecho#lista");
  });
  it("no toca lo que no es una página nuestra", () => {
    expect(conIdioma("en", "/api/cuenta/borrar")).toBe("/api/cuenta/borrar");
    expect(conIdioma("en", "/auth/callback")).toBe("/auth/callback");
    expect(conIdioma("en", "/en/guias")).toBe("/en/guias");
    expect(conIdioma("en", "https://otra.web/x")).toBe("https://otra.web/x");
    expect(conIdioma("en", "//otra.web/x")).toBe("//otra.web/x");
    expect(conIdioma("en", "#contenido")).toBe("#contenido");
  });
});
