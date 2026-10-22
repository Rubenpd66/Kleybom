import { describe, expect, it } from "vitest";
import { idiomaEnRuta, llevaIdioma } from "./ruta";

describe("llevaIdioma", () => {
  it("las páginas llevan idioma", () => {
    for (const r of ["/", "/ejercicios", "/ejercicios/sentadillas", "/panel/perfil", "/autor"]) expect(llevaIdioma(r)).toBe(true);
  });
  it("la API, la vuelta del login y los archivos especiales no", () => {
    for (const r of ["/api/health", "/auth/callback", "/robots.txt", "/sitemap.xml", "/favicon.ico", "/icon.svg", "/apple-icon.png"]) {
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
