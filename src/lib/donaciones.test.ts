import { describe, expect, it } from "vitest";
import { enlaceDonaciones } from "./donaciones";

describe("enlaceDonaciones", () => {
  it("acepta enlaces de pago de Stripe por HTTPS", () => {
    expect(enlaceDonaciones("https://buy.stripe.com/abc123")).toBe("https://buy.stripe.com/abc123");
    expect(enlaceDonaciones(" https://donate.stripe.com/xyz ")).toBe("https://donate.stripe.com/xyz");
  });
  it("sin valor no hay donaciones", () => {
    expect(enlaceDonaciones(undefined)).toBeNull();
    expect(enlaceDonaciones("")).toBeNull();
  });
  it("rechaza otras webs, HTTP, credenciales y basura", () => {
    expect(enlaceDonaciones("http://buy.stripe.com/abc")).toBeNull();
    expect(enlaceDonaciones("https://stripe.com.malo.es/abc")).toBeNull();
    expect(enlaceDonaciones("https://buy.stripe.com@malo.es/abc")).toBeNull();
    expect(enlaceDonaciones("https://paypal.me/yo")).toBeNull();
    expect(enlaceDonaciones("javascript:alert(1)")).toBeNull();
    expect(enlaceDonaciones("no es una url")).toBeNull();
  });
});
