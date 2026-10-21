import { describe, expect, it } from "vitest";
import { validarPerfil } from "./validate";

const hoy = new Date("2026-10-21T12:00:00Z");
const ok = { nombre: "Ana", sexo: "mujer", nacimiento: "1990-05-17", altura: "170" };

describe("validarPerfil", () => {
  it("acepta datos correctos y los convierte", () => {
    expect(validarPerfil(ok, hoy)).toEqual({
      datos: { display_name: "Ana", sex: "mujer", birth_date: "1990-05-17", height_cm: 170 },
    });
  });

  it("los campos vacíos pasan a null (todo es opcional)", () => {
    expect(validarPerfil({ nombre: " ", sexo: "", nacimiento: "", altura: "" }, hoy)).toEqual({
      datos: { display_name: null, sex: null, birth_date: null, height_cm: null },
    });
  });

  it("acepta la coma como separador decimal en la altura", () => {
    expect(validarPerfil({ ...ok, altura: "172,5" }, hoy)).toMatchObject({ datos: { height_cm: 172.5 } });
  });

  it("rechaza una altura fuera de rango o que no es un número", () => {
    expect(validarPerfil({ ...ok, altura: "50" }, hoy)).toHaveProperty("error");
    expect(validarPerfil({ ...ok, altura: "mucha" }, hoy)).toHaveProperty("error");
  });

  it("rechaza una fecha futura o inexistente", () => {
    expect(validarPerfil({ ...ok, nacimiento: "2030-01-01" }, hoy)).toHaveProperty("error");
    expect(validarPerfil({ ...ok, nacimiento: "2026-02-31" }, hoy)).toHaveProperty("error");
  });

  it("rechaza un sexo que no está en la lista y un nombre de más de 60 caracteres", () => {
    expect(validarPerfil({ ...ok, sexo: "otra cosa" }, hoy)).toHaveProperty("error");
    expect(validarPerfil({ ...ok, nombre: "a".repeat(61) }, hoy)).toHaveProperty("error");
  });
});
