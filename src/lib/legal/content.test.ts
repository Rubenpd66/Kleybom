import { describe, expect, it } from "vitest";
import { avisoLegal, cookies, privacidad, type Activos, type TextoLegal } from "./content";
import { avisoLegalEn, cookiesEn, privacidadEn } from "./content-en";

const texto = (t: TextoLegal) =>
  t.secciones
    .flatMap((s) => [s.titulo, ...s.bloques.flatMap((b) => ("texto" in b ? [b.texto] : "items" in b ? b.items : []))])
    .join("\n");
const titulos = (t: TextoLegal) => t.secciones.map((s) => s.titulo);

const NADA: Activos = { anuncios: false, donaciones: false };
const TODO: Activos = { anuncios: true, donaciones: true };
const CASOS: Activos[] = [NADA, { anuncios: true, donaciones: false }, { anuncios: false, donaciones: true }, TODO];

describe("textos legales", () => {
  it("sin anuncios ni donaciones dicen que no hay publicidad ni banner, y no nombran a AdSense ni a Stripe", () => {
    const todo = [avisoLegal(NADA), privacidad(NADA), cookies(NADA)].map(texto).join("\n");
    expect(todo).toContain("No muestra publicidad.");
    expect(todo).toContain("Por qué no hay banner de cookies");
    expect(todo).not.toMatch(/AdSense|Stripe/);
  });

  it("con anuncios explican AdSense, dónde no hay anuncios, el consentimiento y cómo retirarlo", () => {
    const a: Activos = { anuncios: true, donaciones: false };
    expect(texto(avisoLegal(a))).toContain("Se financia con publicidad de Google AdSense.");
    const priv = texto(privacidad(a));
    for (const frase of ["Google Ireland Limited", "art. 6.1.a RGPD", "Privacidad y cookies", "policies.google.com/technologies/partner-sites"]) {
      expect(priv).toContain(frase);
    }
    const ck = texto(cookies(a));
    expect(ck).toContain("Cookies de publicidad (Google AdSense)");
    expect(ck).toContain("Rechazar es igual de fácil que aceptar");
    expect(ck).toContain("tu zona personal");
    expect(ck).not.toContain("Por qué no hay banner de cookies");
  });

  it("con donaciones explican Stripe, que no hay certificados y cuánto se guardan los datos", () => {
    const d: Activos = { anuncios: false, donaciones: true };
    expect(texto(avisoLegal(d))).toContain("no dan derecho a deducciones fiscales");
    const priv = texto(privacidad(d));
    expect(priv).toContain("Stripe Payments Europe, Limited");
    expect(priv).toContain("obligación legal (art. 6.1.c RGPD)");
    expect(priv).toContain("entre cuatro y seis años");
    expect(texto(avisoLegal(d))).toContain("no muestra publicidad");
  });

  it("los datos de salud nunca se usan para publicidad, esté activo lo que esté", () => {
    for (const c of CASOS) expect(texto(privacidad(c))).toContain("no se usan para publicidad ni se comparten con anunciantes");
  });

  it("la versión inglesa tiene los mismos apartados que la española en todos los casos", () => {
    for (const c of CASOS) {
      expect(titulos(avisoLegalEn(c)).length).toBe(titulos(avisoLegal(c)).length);
      expect(titulos(privacidadEn(c)).length).toBe(titulos(privacidad(c)).length);
      expect(titulos(cookiesEn(c)).length).toBe(titulos(cookies(c)).length);
      expect(texto(privacidadEn(c)).includes("AdSense")).toBe(c.anuncios);
      expect(texto(privacidadEn(c)).includes("Stripe")).toBe(c.donaciones);
    }
  });
});
