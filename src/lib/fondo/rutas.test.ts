import { describe, expect, it } from "vitest";
import { ESCENAS, SECCIONES, escenaDeRuta, modoFondo } from "./rutas";

describe("cómo se dibuja el fondo 3D", () => {
  it("completo en pantallas anchas, ligero en móvil o con poca memoria, y nada con ahorro de datos", () => {
    expect(modoFondo({ ancho: 1280 })).toBe("completo");
    expect(modoFondo({ ancho: 768, memoriaGb: 8 })).toBe("completo");
    expect(modoFondo({ ancho: 412 })).toBe("ligero");
    expect(modoFondo({ ancho: 1280, memoriaGb: 3 })).toBe("ligero");
    expect(modoFondo({ ancho: 1280, memoriaGb: 1 })).toBe("ninguno");
    expect(modoFondo({ ancho: 412, ahorroDatos: true })).toBe("ninguno");
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
