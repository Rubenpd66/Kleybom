import { describe, expect, it } from "vitest";
import { normalizeText } from "./normalize";

describe("normalizeText", () => {
  it("pasa a minúsculas, quita tildes y colapsa espacios", () => {
    expect(normalizeText("  FLEXIÓN  de   Brazos ")).toBe("flexion de brazos");
  });

  it("convierte la ñ en n", () => {
    expect(normalizeText("Piña")).toBe("pina");
  });

  it("devuelve cadena vacía si está vacío", () => {
    expect(normalizeText("")).toBe("");
  });
});
