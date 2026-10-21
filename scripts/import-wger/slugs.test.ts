import { describe, expect, it } from "vitest";
import { uniqueSlugs } from "./slugs";

describe("uniqueSlugs", () => {
  it("añade el source_id a los slugs repetidos", () => {
    const r = uniqueSlugs([
      { slug: "sentadilla", source_id: "1" },
      { slug: "sentadilla", source_id: "2" },
      { slug: "flexion", source_id: "3" },
    ]);
    expect(r.map((x) => x.slug)).toEqual(["sentadilla", "sentadilla-2", "flexion"]);
  });
});
