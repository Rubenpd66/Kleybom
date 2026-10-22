"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { validarPerfil } from "@/lib/profile/validate";
import { tDeCookie } from "@/lib/i18n/servidor";
import { createServerClient } from "@/lib/supabase/server";

export type EstadoPerfil = { error?: string; aviso?: string };

export async function guardarPerfil(_: EstadoPerfil, datos: FormData): Promise<EstadoPerfil> {
  const [usuario, es] = await Promise.all([getCurrentUser(), tDeCookie()]);
  const t = es.perfil;
  if (!usuario) return { error: t.errores.sesion };

  const campo = (n: string) => String(datos.get(n) ?? "");
  const r = validarPerfil({
    nombre: campo("nombre"),
    sexo: campo("sexo"),
    nacimiento: campo("nacimiento"),
    altura: campo("altura"),
  }, undefined, t.errores);
  if ("error" in r) return { error: r.error };

  const supabase = await createServerClient();
  const { error } = await supabase.from("profiles").upsert({ id: usuario.id, ...r.datos });
  if (error) return { error: t.errores.general };
  return { aviso: t.guardado };
}
