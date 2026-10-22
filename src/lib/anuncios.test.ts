import { describe, expect, it } from "vitest";
import { bloqueAdsense, idAdsense, lineaAdsTxt } from "./anuncios";

describe("anuncios", () => {
  it("acepta un ID de editor de AdSense y rechaza el resto", () => {
    expect(idAdsense("ca-pub-1234567890123456")).toBe("ca-pub-1234567890123456");
    expect(idAdsense(" ca-pub-1234567890123456 ")).toBe("ca-pub-1234567890123456");
    expect(idAdsense(undefined)).toBeNull();
    expect(idAdsense("")).toBeNull();
    expect(idAdsense("pub-1234567890123456")).toBeNull();
    expect(idAdsense('ca-pub-1234567890123456"><script>')).toBeNull();
  });
  it("el bloque de anuncios son solo cifras", () => {
    expect(bloqueAdsense("1234567890")).toBe("1234567890");
    expect(bloqueAdsense("12ab")).toBeNull();
    expect(bloqueAdsense('123456" onload="x')).toBeNull();
    expect(bloqueAdsense(undefined)).toBeNull();
  });
  it("ads.txt lleva el ID sin el prefijo ca-", () => {
    expect(lineaAdsTxt("ca-pub-1234567890123456")).toBe("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
  });
});
