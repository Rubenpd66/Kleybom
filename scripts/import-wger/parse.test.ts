import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseWgerExercise, type WgerExerciseInfo } from "./parse";

function fixture(nombre: string): WgerExerciseInfo {
  return JSON.parse(
    readFileSync(new URL(`./fixtures/${nombre}.json`, import.meta.url), "utf-8"),
  );
}

describe("parseWgerExercise", () => {
  it("con licencia: guarda licencia, autoría, fuente y texto de búsqueda", () => {
    const fila = parseWgerExercise(fixture("con-licencia"));
    expect(fila).not.toBeNull();
    expect(fila?.license).toBe("CC-BY-SA 4");
    expect(fila?.author).toBe("sevae");
    expect(fila?.source).toBe("wger");
    expect(fila?.source_id).toBe("41");
    expect(fila?.name_es).toBe("Rollout Abdominal con Barra");
    expect(fila?.slug).toBe("rollout-abdominal-con-barra");
    expect(fila?.search_text).toBe("rollout abdominal con barra");
    expect(fila?.needs_translation).toBe(false);
  });

  it("con licencia: convierte los <li> del HTML en pasos sin etiquetas", () => {
    const fila = parseWgerExercise(fixture("con-licencia"));
    expect(fila?.instructions_es.length).toBeGreaterThan(1);
    expect(fila?.instructions_es.join(" ")).not.toMatch(/<[^>]+>/);
  });

  it("sin licencia o sin autoría: devuelve null", () => {
    expect(parseWgerExercise(fixture("sin-licencia"))).toBeNull();
    const sinAutor = fixture("con-licencia");
    sinAutor.license_author = "";
    expect(parseWgerExercise(sinAutor)).toBeNull();
  });

  it("sin español: usa el inglés y marca needs_translation", () => {
    const fila = parseWgerExercise(fixture("sin-espanol"));
    expect(fila).not.toBeNull();
    expect(fila?.needs_translation).toBe(true);
    expect(fila?.name_es).toBe("2 Handed Kettlebell Swing");
  });

  it("sin ninguna traducción útil: devuelve null", () => {
    const e = fixture("con-licencia");
    e.translations = [];
    expect(parseWgerExercise(e)).toBeNull();
  });
});
