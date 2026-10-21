import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { entrarCon, iniciarSesionUnaVez } from "./ayudas";

try {
  process.loadEnvFile(".env.local");
} catch {
  // sin archivo: se usan las variables del entorno
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = () => createClient(url, servicio!, { auth: { persistSession: false } });
const contrasena = "contrasena-de-prueba-123";
const marca = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

test("exportar exige sesión", async ({ request }) => {
  const r = await request.get("/api/cuenta/exportar");
  expect(r.status()).toBe(401);
});

test.describe("exportar mis datos", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  const correoA = `test-exp-a-${marca}@example.com`;
  const correoB = `test-exp-b-${marca}@example.com`;
  const ids: Record<string, string> = {};

  test.beforeAll(async ({ browser }, info) => {
    const db = admin();
    for (const [k, correo] of [["a", correoA], ["b", correoB]] as const) {
      const { data, error } = await db.auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
      if (error) throw error;
      ids[k] = data.user.id;
      await db.from("profiles").insert({ id: data.user.id, display_name: `Nombre ${k.toUpperCase()}`, height_cm: k === "a" ? 170 : 181 });
      await db.from("body_measurements").insert({ user_id: data.user.id, date: "2026-10-01", weight_kg: k === "a" ? 70 : 99.9 });
      await db.from("planned_sessions").insert({ user_id: data.user.id, date: "2026-10-02", note: `nota-${k}` });
      await db.from("routines").insert({ owner_id: data.user.id, name: `Rutina de ${k}`, goal: "fuerza", level: "principiante", days_per_week: 1 });
    }
    await iniciarSesionUnaVez(browser, info, correoA, contrasena);
  });

  test.afterAll(async () => {
    for (const id of Object.values(ids)) await admin().auth.admin.deleteUser(id);
  });

  test("descarga un JSON con todos los datos del usuario y ninguno de otro", async ({ page }) => {
    await entrarCon(page, correoA);
    const r = await page.request.get("/api/cuenta/exportar");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("application/json");
    expect(r.headers()["content-disposition"]).toMatch(/attachment; filename="kleybom-mis-datos-\d{4}-\d{2}-\d{2}\.json"/);
    expect(r.headers()["cache-control"]).toContain("no-store");

    const datos = await r.json();
    expect(datos.cuenta.email).toBe(correoA);
    expect(datos.perfil.display_name).toBe("Nombre A");
    expect(datos.medidas).toHaveLength(1);
    expect(datos.calendario[0].note).toBe("nota-a");
    expect(datos.rutinas.map((x: { name: string }) => x.name)).toEqual(["Rutina de a"]);
    for (const clave of ["objetivos_nutricion", "diario_comidas", "entrenos"]) expect(datos).toHaveProperty(clave);

    const texto = JSON.stringify(datos);
    expect(texto).not.toContain(correoB);
    expect(texto).not.toContain(ids.b);
    expect(texto).not.toContain("Nombre B");
    expect(texto).not.toContain("nota-b");
    expect(texto).not.toContain("Rutina de b");
    expect(texto).not.toContain("99.9");
  });
});
