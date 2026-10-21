import { describe, expect, it } from "vitest";
import { getGuideBySlug, listGuides, readingMinutes, type Guia } from "./index";

describe("guías", () => {
  const guias = listGuides();

  it("hay 5 guías con slug único", () => {
    expect(guias).toHaveLength(5);
    expect(new Set(guias.map((g) => g.slug)).size).toBe(5);
  });

  it.each(guias.map((g) => [g.slug, g] as const))("%s tiene título, resumen, fechas, secciones y fuentes", (_, g) => {
    expect(g.slug).toMatch(/^[a-z0-9-]+$/);
    expect(g.titulo.length).toBeGreaterThan(3);
    expect(g.resumen.length).toBeGreaterThan(20);
    expect(g.resumen.length).toBeLessThanOrEqual(160);
    expect(g.publicada).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(g.actualizada >= g.publicada).toBe(true);
    expect(g.secciones.length).toBeGreaterThan(0);
    for (const s of g.secciones) expect(s.bloques.length).toBeGreaterThan(0);
    expect(g.fuentes.length).toBeGreaterThan(0);
    for (const f of g.fuentes) expect(f.url).toMatch(/^https:\/\//);
    for (const e of g.enForja) expect(e.href).toMatch(/^\//);
  });

  it("busca por slug", () => {
    expect(getGuideBySlug("descanso")?.titulo).toBe("Descanso y sueño");
    expect(getGuideBySlug("no-existe")).toBeUndefined();
  });

  it("calcula los minutos de lectura (mínimo 1)", () => {
    const base: Guia = { ...guias[0], secciones: [{ titulo: "x", bloques: [{ tipo: "p", texto: "hola" }] }] };
    expect(readingMinutes(base)).toBe(1);
    const larga: Guia = { ...base, secciones: [{ titulo: "x", bloques: [{ tipo: "lista", items: ["palabra ".repeat(599)] }] }] };
    expect(readingMinutes(larga)).toBe(3);
  });
});
