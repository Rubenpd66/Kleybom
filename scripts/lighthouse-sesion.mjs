// Mide con Lighthouse páginas con sesión iniciada: crea un usuario temporal con algo de actividad,
// entra con Playwright, pasa las cookies a Lighthouse y al final borra el usuario.
// Uso: node scripts/lighthouse-sesion.mjs <base> <ruta> [<ruta>...]   (necesita SUPABASE_SERVICE_ROLE_KEY en .env.local)
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const [base, ...rutas] = process.argv.slice(2);
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const correo = `lighthouse-${Date.now()}@example.com`;
const contrasena = "contrasena-de-prueba-123";

const { data, error } = await admin.auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true });
if (error) throw error;
const id = data.user.id;
try {
  // Algo de actividad para que las páginas no salgan vacías.
  const hoy = new Date().toISOString().slice(0, 10);
  await admin.from("nutrition_goals").insert({ user_id: id, kcal: 2200, protein_g: 120, carbs_g: 260, fat_g: 70 });
  await admin.from("body_measurements").insert([70.4, 70.1, 69.8].map((w, i) => ({ user_id: id, date: `2026-10-${String(1 + i * 7).padStart(2, "0")}`, weight_kg: w })));
  const { data: ej } = await admin.from("exercises").select("id").eq("slug", "sentadillas").single();
  for (const [i, dia] of ["2026-10-06", "2026-10-13", "2026-10-20"].entries()) {
    const { data: w } = await admin.from("workout_logs").insert({ user_id: id, date: dia, started_at: `${dia}T07:00:00Z`, finished_at: `${dia}T08:00:00Z` }).select("id").single();
    await admin.from("set_logs").insert({ workout_log_id: w.id, exercise_id: ej.id, set_index: 1, weight_kg: 50 + i * 2.5, reps: 8 });
  }
  const { data: platano } = await admin.from("foods").select("id").eq("slug", "platanos-crudos-173944").single();
  await admin.from("meal_entries").insert({ user_id: id, date: hoy, meal: "desayuno", food_id: platano.id, grams: 120 });

  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  await pagina.goto(`${base}/entrar`);
  await pagina.getByLabel("Correo electrónico").fill(correo);
  await pagina.getByLabel("Contraseña").fill(contrasena);
  await pagina.getByRole("button", { name: "Entrar" }).click();
  await pagina.waitForURL(/\/panel$/);
  const cookie = (await pagina.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
  await navegador.close();

  const dir = mkdtempSync(join(tmpdir(), "lh-sesion-"));
  for (const ruta of rutas) {
    const salida = join(dir, `${ruta.replace(/\W/g, "_")}.json`);
    try {
      execFileSync("npx", ["--yes", "lighthouse@12.8.2", base + ruta, "--quiet", "--output=json", `--output-path=${salida}`,
        "--chrome-flags=\"--headless=new --no-sandbox\"", "--only-categories=performance,accessibility,best-practices,seo",
        `--extra-headers="${JSON.stringify({ Cookie: cookie }).replace(/"/g, '\\"')}"`], { stdio: "ignore", shell: true });
    } catch {
      // Lighthouse a veces sale con error aunque haya escrito el informe.
    }
    const r = JSON.parse(readFileSync(salida, "utf8"));
    const p = (k) => Math.round((r.categories[k]?.score ?? 0) * 100);
    const fallos = Object.values(r.audits).filter((x) => x.score !== null && x.score < 0.9 && !["informative", "notApplicable", "manual"].includes(x.scoreDisplayMode)).map((x) => x.id);
    console.log(`${ruta.padEnd(24)} rend ${p("performance")} acc ${p("accessibility")} bp ${p("best-practices")} seo ${p("seo")} | URL final ${new URL(r.finalDisplayedUrl).pathname} | CLS ${r.audits["cumulative-layout-shift"].displayValue}`);
    if (fallos.length) console.log(`   fallos: ${fallos.join(", ")}`);
  }
} finally {
  await admin.auth.admin.deleteUser(id);
}
