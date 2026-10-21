"use server";

import { redirect } from "next/navigation";
import { mensajeDeError, validarCredenciales } from "@/lib/auth/validate";
import { createServerClient } from "@/lib/supabase/server";

export type EstadoForm = { error?: string; aviso?: string };

function leer(datos: FormData) {
  return {
    correo: String(datos.get("correo") ?? "").trim(),
    contrasena: String(datos.get("contrasena") ?? ""),
  };
}

export async function entrar(_: EstadoForm, datos: FormData): Promise<EstadoForm> {
  const { correo, contrasena } = leer(datos);
  const fallo = validarCredenciales(correo, contrasena);
  if (fallo) return { error: fallo };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) return { error: mensajeDeError(error.code) };
  redirect("/panel");
}

export async function registrar(_: EstadoForm, datos: FormData): Promise<EstadoForm> {
  const { correo, contrasena } = leer(datos);
  const fallo = validarCredenciales(correo, contrasena);
  if (fallo) return { error: fallo };

  const origen = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: { emailRedirectTo: `${origen}/auth/callback` },
  });
  if (error) return { error: mensajeDeError(error.code) };
  if (data.session) redirect("/panel");
  return {
    aviso: "Cuenta creada. Te hemos enviado un correo: pulsa el enlace para confirmarla y después entra.",
  };
}

export async function salir() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
