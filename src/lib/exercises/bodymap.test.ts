import { describe, expect, it } from "vitest";
import { enlaceConMusculo, musculoDeZona, ZONA_A_MUSCULO, zonasDeMusculo } from "./bodymap";

describe("mapa corporal", () => {
  it("traduce zonas del dibujo a músculos del catálogo", () => {
    expect(musculoDeZona("chest")).toBe("pectoral");
    expect(musculoDeZona("upper-back")).toBe("dorsal-ancho");
    expect(musculoDeZona("forearm")).toBeNull();
  });

  it("solo usa músculos que existen en el catálogo", () => {
    const catalogo = ["deltoides-anterior", "dorsal-ancho", "gluteos", "cuadriceps", "pectoral", "abdominales", "biceps", "triceps", "trapecio", "isquiotibiales", "oblicuos", "gemelos", "braquial", "serrato-anterior", "soleo"];
    for (const m of Object.values(ZONA_A_MUSCULO)) expect(catalogo).toContain(m);
  });

  it("un músculo puede ocupar varias zonas", () => {
    expect(zonasDeMusculo("soleo").sort()).toEqual(["left-soleus", "right-soleus"]);
    expect(zonasDeMusculo("braquial")).toEqual([]);
  });

  it("el enlace conserva los demás filtros y vuelve a la página 1", () => {
    const actuales = new URLSearchParams("q=press&level=principiante&page=3&muscle=biceps");
    expect(enlaceConMusculo(actuales, "pectoral")).toBe("/ejercicios?q=press&level=principiante&muscle=pectoral");
    expect(enlaceConMusculo(actuales, null)).toBe("/ejercicios?q=press&level=principiante");
    expect(enlaceConMusculo(new URLSearchParams(), null)).toBe("/ejercicios");
  });
});
