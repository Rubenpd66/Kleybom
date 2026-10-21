"use server";

import { redirect } from "next/navigation";
import { VERSION_PRIVACIDAD, mensajeDeError, rutaDeVuelta, validarConsentimientos, validarCredenciales } from "@/lib/auth/validate";
import { createServerClient } from "@/lib/supabase/server";

// `valores` devuelve lo escrito para volver a rellenar el formulario tras un error (React lo vacía al enviar).
export type EstadoForm = { error?: string; aviso?: string; valores?: { correo: string; privacidad?: boolean; salud?: boolean } };

function leer(datos: FormData) {
  return {
    correo: String(datos.get("correo") ?? "").trim(),
    contrasena: String(datos.get("contrasena") ?? ""),
  };
}

export async function entrar(_: EstadoForm, datos: FormData): Promise<EstadoForm> {
  const { correo, contrasena } = leer(datos);
  const fallo = validarCredenciales(correo, contrasena);
  if (fallo) return { error: fallo, valores: { correo } };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) return { error: mensajeDeError(error.code), valores: { correo } };
  redirect(rutaDeVuelta(datos.get("volver")));
}

export async function registrar(_: EstadoForm, datos: FormData): Promise<EstadoForm> {
  const { correo, contrasena } = leer(datos);
  const privacidad = datos.get("privacidad") === "si";
  const salud = datos.get("salud") === "si";
  const valores = { correo, privacidad, salud };
  const fallo = validarCredenciales(correo, contrasena) ?? validarConsentimientos(privacidad, salud);
  if (fallo) return { error: fallo, valores };

  const origen = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createServerClient();
  // Prueba del consentimiento (art. 7.1 RGPD): cuándo y qué versión de la política se aceptó.
  const ahora = new Date().toISOString();
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      emailRedirectTo: `${origen}/auth/callback?volver=${encodeURIComponent(rutaDeVuelta(datos.get("volver")))}`,
      data: { privacidad_aceptada: ahora, privacidad_version: VERSION_PRIVACIDAD, consentimiento_salud: ahora },
    },
  });
  if (error) return { error: mensajeDeError(error.code), valores };
  if (data.session) redirect(rutaDeVuelta(datos.get("volver")));
  return {
    aviso: "Cuenta creada. Te hemos enviado un correo: pulsa el enlace para confirmarla y después entra.",
  };
}

// Entrar (o crear la cuenta) con Google. Supabase devuelve la dirección de Google y, al volver,
// /auth/callback canjea el código. Si la cuenta es nueva, allí se piden los consentimientos.
export async function conGoogle(datos: FormData) {
  const origen = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const volver = rutaDeVuelta(datos.get("volver"));
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origen}/auth/callback?volver=${encodeURIComponent(volver)}` },
  });
  if (error || !data.url) redirect("/entrar?error=google");
  redirect(data.url);
}

// Primera entrada con Google: se guardan los mismos consentimientos que en el registro con correo.
export async function aceptarConsentimientos(_: EstadoForm, datos: FormData): Promise<EstadoForm> {
  const privacidad = datos.get("privacidad") === "si";
  const salud = datos.get("salud") === "si";
  const fallo = validarConsentimientos(privacidad, salud);
  if (fallo) return { error: fallo, valores: { correo: "", privacidad, salud } };

  const supabase = await createServerClient();
  const ahora = new Date().toISOString();
  const { error } = await supabase.auth.updateUser({
    data: { privacidad_aceptada: ahora, privacidad_version: VERSION_PRIVACIDAD, consentimiento_salud: ahora },
  });
  if (error) return { error: mensajeDeError(error.code), valores: { correo: "", privacidad, salud } };
  // El proxy mira el token: se renueva para que ya lleve los consentimientos.
  await supabase.auth.refreshSession();
  redirect(rutaDeVuelta(datos.get("volver")));
}

export async function salir() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
