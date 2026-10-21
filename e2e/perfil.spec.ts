import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { entrarCon, iniciarSesionUnaVez } from "./ayudas";


try {
  process.loadEnvFile(".env.local");
} catch {
  // sin archivo: se usan las variables del entorno
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sinSesion = { auth: { persistSession: false } };
const admin = () => createClient(url, servicio!, sinSesion);
const contrasena = "contrasena-de-prueba-123";
const unico = () => `test-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

async function crearUsuario(correo: string): Promise<string> {
  const { data, error } = await admin().auth.admin.createUser({
    email: correo,
    password: contrasena,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

async function entrar(page: Page, correo: string) {
  await entrarCon(page, correo);
}

test("el perfil exige sesión", async ({ page }) => {
  await page.goto("/panel/perfil");
  await expect(page).toHaveURL(/\/entrar(\?volver=.*)?$/);
});

test.describe("con cuentas de prueba", () => {
  test.skip(!servicio, "falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  test.describe.configure({ mode: "serial" });

  const correoA = unico();
  const correoB = unico();
  let idA = "";
  let idB = "";

  test.beforeAll(async ({ browser }, info) => {
    idA = await crearUsuario(correoA);
    idB = await crearUsuario(correoB);
    await iniciarSesionUnaVez(browser, info, correoA, contrasena);
    await iniciarSesionUnaVez(browser, info, correoB, contrasena);
  });

  test.afterAll(async () => {
    for (const id of [idA, idB]) if (id) await admin().auth.admin.deleteUser(id);
  });

  test("guardar el perfil y verlo después de recargar", async ({ page }) => {
    await entrar(page, correoA);
    await page.goto("/panel/perfil");
    await page.getByLabel("Nombre").fill("Ana");
    await page.getByLabel("Sexo").selectOption("mujer");
    await page.getByLabel("Fecha de nacimiento").fill("1990-05-17");
    await page.getByLabel("Altura (cm)").fill("170,5");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByRole("status")).toContainText("Datos guardados");

    await page.reload();
    await expect(page.getByLabel("Nombre")).toHaveValue("Ana");
    await expect(page.getByLabel("Altura (cm)")).toHaveValue("170.5");
  });

  test("una altura imposible muestra un mensaje claro", async ({ page }) => {
    await entrar(page, correoA);
    await page.goto("/panel/perfil");
    await page.getByLabel("Altura (cm)").fill("50");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.locator("form [role=alert]")).toContainText("entre 100 y 250");
  });

  test("seguridad: B y un anónimo no ven ni tocan el perfil de A", async () => {
    // Asegura que A tiene perfil (si el test anterior no llegó a guardarlo).
    await admin().from("profiles").upsert({ id: idA, display_name: "Ana" });

    const anonimo = createClient(url, publica, sinSesion);
    expect((await anonimo.from("profiles").select("id")).data).toEqual([]);

    const b = createClient(url, publica, sinSesion);
    const { error: errLogin } = await b.auth.signInWithPassword({ email: correoB, password: contrasena });
    expect(errLogin).toBeNull();

    expect((await b.from("profiles").select("id").eq("id", idA)).data).toEqual([]);

    const edicion = await b.from("profiles").update({ display_name: "hackeado" }).eq("id", idA).select();
    expect(edicion.data).toEqual([]);

    const insercion = await b.from("profiles").insert({ id: idA, display_name: "x" });
    expect(insercion.error).not.toBeNull();

    const { data } = await admin().from("profiles").select("display_name").eq("id", idA).single();
    expect(data?.display_name).toBe("Ana");
  });

  test("borrar la cuenta pide escribir BORRAR y después cierra la sesión y borra los datos", async ({
    page,
  }) => {
    await admin().from("profiles").upsert({ id: idB, display_name: "Berta" });
    await entrar(page, correoB);
    await page.goto("/panel/perfil");

    // La ruta rechaza la petición sin la palabra de confirmación.
    const rechazada = await page.request.post("/api/cuenta/borrar", { form: { confirmacion: "borrar" } });
    expect(rechazada.status()).toBe(400);

    const boton = page.getByRole("button", { name: "Borrar mi cuenta para siempre" });
    await expect(boton).toBeDisabled();
    await page.getByLabel("Para confirmar, escribe BORRAR").fill("BORRAR");
    await expect(boton).toBeEnabled();
    await boton.click();

    await expect(page).toHaveURL(/\/\?cuenta=borrada$/);
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/entrar(\?volver=.*)?$/);

    const perfil = await admin().from("profiles").select("id").eq("id", idB);
    expect(perfil.data).toEqual([]);
    const usuario = await admin().auth.admin.getUserById(idB);
    expect(usuario.data.user).toBeNull();
    idB = "";
  });

  test("la ruta de borrado sin sesión responde 401", async ({ request }) => {
    const r = await request.post("/api/cuenta/borrar", { form: { confirmacion: "BORRAR" } });
    expect(r.status()).toBe(401);
  });
});
