import { describe, expect, it } from "vitest";
import { ESCENAS, SECCIONES, debeMostrarFondo, escenaDeRuta } from "./rutas";

describe("cuándo se dibuja el fondo 3D", () => {
  it("solo en pantallas anchas, sin ahorro de datos y con memoria suficiente", () => {
    expect(debeMostrarFondo({ ancho: 1280 })).toBe(true);
    expect(debeMostrarFondo({ ancho: 768, memoriaGb: 8 })).toBe(true);
    expect(debeMostrarFondo({ ancho: 412 })).toBe(false);
    expect(debeMostrarFondo({ ancho: 1280, ahorroDatos: true })).toBe(false);
    expect(debeMostrarFondo({ ancho: 1280, memoriaGb: 2 })).toBe(false);
  });
});

describe("fondo 3D por sección", () => {
  it("cada sección tiene su escena", () => {
    expect(escenaDeRuta("/")).toBe("chispas");
    expect(escenaDeRuta("/ejercicios")).toBe("discos");
    expect(escenaDeRuta("/ejercicios/sentadillas")).toBe("discos");
    expect(escenaDeRuta("/rutinas/nueva")).toBe("series");
    expect(escenaDeRuta("/nutricion/objetivos")).toBe("diario");
    expect(escenaDeRuta("/panel/medidas")).toBe("constelacion");
  });

  it("no se repiten escenas entre secciones (salvo entrar y registro, que son la misma pantalla)", () => {
    const usadas = SECCIONES.filter(([r]) => r !== "/registro").map(([, e]) => e);
    usadas.push("chispas");
    expect(new Set(usadas).size).toBe(usadas.length);
    expect(new Set(usadas)).toEqual(new Set(ESCENAS));
  });

  it("las páginas legales y desconocidas no llevan fondo, y un prefijo no engaña", () => {
    for (const ruta of ["/privacidad", "/aviso-legal", "/cookies", "/no-existe", "/ejerciciosx"]) expect(escenaDeRuta(ruta)).toBeNull();
  });
});
