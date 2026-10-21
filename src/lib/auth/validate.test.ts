import { describe, expect, it } from "vitest";
import { faltanConsentimientos, mensajeDeError, rutaDeVuelta, validarConsentimientos, validarCredenciales } from "./validate";

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

describe("validarConsentimientos", () => {
  it("exige aceptar la privacidad y el tratamiento de datos de salud", () => {
    expect(validarConsentimientos(false, true)).toMatch(/política de privacidad/);
    expect(validarConsentimientos(true, false)).toMatch(/datos de salud/);
    expect(validarConsentimientos(false, false)).toMatch(/política de privacidad/);
    expect(validarConsentimientos(true, true)).toBeNull();
  });
});

describe("rutaDeVuelta", () => {
  it("acepta rutas internas con parámetros", () => {
    expect(rutaDeVuelta("/calendario")).toBe("/calendario");
    expect(rutaDeVuelta("/nutricion?dia=2026-10-21")).toBe("/nutricion?dia=2026-10-21");
  });
  it("manda al panel si no hay ruta o apunta a otra web", () => {
    for (const malo of [null, "", "calendario", "https://malo.com", "//malo.com", String.raw`/\malo.com`, `/${"a".repeat(300)}`]) {
      expect(rutaDeVuelta(malo)).toBe("/panel");
    }
  });
});

describe("faltanConsentimientos", () => {
  it("pide los consentimientos a quien entró con Google y aún no los dio", () => {
    expect(faltanConsentimientos({ app_metadata: { providers: ["google"] }, user_metadata: {} })).toBe(true);
  });
  it("no molesta a quien ya los dio, a las cuentas de correo ni a quien no ha entrado", () => {
    expect(faltanConsentimientos({ app_metadata: { providers: ["google"] }, user_metadata: { privacidad_aceptada: "2026-10-22" } })).toBe(false);
    expect(faltanConsentimientos({ app_metadata: { providers: ["email"] }, user_metadata: {} })).toBe(false);
    expect(faltanConsentimientos({ app_metadata: { providers: ["email", "google"] }, user_metadata: {} })).toBe(false);
    expect(faltanConsentimientos(undefined)).toBe(false);
  });
});
