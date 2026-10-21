"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { validarPerfil } from "@/lib/profile/validate";
import { createServerClient } from "@/lib/supabase/server";

export type EstadoPerfil = { error?: string; aviso?: string };

export async function guardarPerfil(_: EstadoPerfil, datos: FormData): Promise<EstadoPerfil> {
  const usuario = await getCurrentUser();
  if (!usuario) return { error: "Tu sesión ha caducado. Entra de nuevo para guardar los cambios." };

  const campo = (n: string) => String(datos.get(n) ?? "");
  const r = validarPerfil({
    nombre: campo("nombre"),
    sexo: campo("sexo"),
    nacimiento: campo("nacimiento"),
    altura: campo("altura"),
  });
  if ("error" in r) return { error: r.error };

  const supabase = await createServerClient();
  const { error } = await supabase.from("profiles").upsert({ id: usuario.id, ...r.datos });
  if (error) return { error: "No se han podido guardar los datos. Inténtalo de nuevo en unos minutos." };
  return { aviso: "Datos guardados." };
}
