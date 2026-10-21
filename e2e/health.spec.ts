import { expect, test } from "@playwright/test";

test("GET /api/health responde ok", async ({ request }) => {
  const r = await request.get("/api/health");
  expect(r.status()).toBe(200);
  expect(await r.json()).toEqual({ ok: true });
});
