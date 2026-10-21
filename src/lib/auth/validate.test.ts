import { describe, expect, it } from "vitest";
import { mensajeDeError, validarCredenciales } from "./validate";

describe("validarCredenciales", () => {
  it("acepta un correo y una contraseña de 8 o más caracteres", () => {
    expect(validarCredenciales("ana@correo.es", "12345678")).toBeNull();
  });

  it("rechaza un correo sin formato válido", () => {
    expect(validarCredenciales("ana", "12345678")).toMatch(/correo/i);
  });

  it("rechaza una contraseña de menos de 8 caracteres", () => {
    expect(validarCredenciales("ana@correo.es", "1234567")).toMatch(/8 caracteres/);
  });
});

describe("mensajeDeError", () => {
  it("traduce los códigos conocidos de Supabase", () => {
    expect(mensajeDeError("invalid_credentials")).toMatch(/correo o la contraseña/);
    expect(mensajeDeError("email_not_confirmed")).toMatch(/confirmado tu correo/i);
    expect(mensajeDeError("user_already_exists")).toMatch(/ya existe/i);
  });

  it("usa un mensaje general si el código no se conoce", () => {
    expect(mensajeDeError("algo_raro")).toMatch(/inténtalo de nuevo/i);
    expect(mensajeDeError(undefined)).toMatch(/inténtalo de nuevo/i);
  });
});
