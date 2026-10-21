"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

export async function borrarRutina(id: number) {
  const usuario = await getCurrentUser();
  if (!usuario || !Number.isInteger(id)) return;
  const supabase = await createServerClient();
  // Además de la política de la base, se filtra por dueño.
  await supabase.from("routines").delete().eq("id", id).eq("owner_id", usuario.id);
  revalidatePath("/panel/rutinas");
}
