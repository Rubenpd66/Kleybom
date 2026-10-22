"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { CAMPOS, validateMeasurement, type MeasurementDraft } from "@/lib/body/validate";
import { toLocalDateKey } from "@/lib/calendar/dates";
import { getUserTimezone } from "@/lib/calendar/queries";
import { tDeCookie } from "@/lib/i18n/servidor";
import { createServerClient } from "@/lib/supabase/server";

export type EstadoMedidas = { errores?: string[]; aviso?: string };

const aNumero = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim().replace(",", ".");
  return s === "" ? null : Number(s);
};

export async function guardarMedidas(_: EstadoMedidas, form: FormData): Promise<EstadoMedidas> {
  const [usuario, es] = await Promise.all([getCurrentUser(), tDeCookie()]);
  if (!usuario) return { errores: [es.constructor.errorSesion] };

  const draft: MeasurementDraft = {
    date: String(form.get("fecha") ?? "").trim(),
    weight_kg: aNumero(form.get("peso")),
    waist_cm: aNumero(form.get("cintura")),
    hip_cm: aNumero(form.get("cadera")),
    chest_cm: aNumero(form.get("pecho")),
  };
  const hoy = toLocalDateKey(new Date(), await getUserTimezone(usuario.id));
  const v = validateMeasurement(draft, hoy, es.medidas.errores);
  if (!v.ok) return { errores: v.errors };

  const fila: Record<string, unknown> = { user_id: usuario.id, date: draft.date };
  for (const c of CAMPOS) fila[c] = draft[c] === null ? null : Math.round(draft[c]! * 10) / 10;
  const supabase = await createServerClient();
  // Una medición por día: si ya existe, se sustituye.
  const { error } = await supabase.from("body_measurements").upsert(fila, { onConflict: "user_id,date" });
  if (error) return { errores: [es.medidas.errorGeneral] };
  revalidatePath("/panel/medidas");
  return { aviso: es.medidas.guardado };
}

export async function borrarMedida(id: number) {
  const usuario = await getCurrentUser();
  if (!usuario || !Number.isInteger(id)) return;
  const supabase = await createServerClient();
  await supabase.from("body_measurements").delete().eq("id", id).eq("user_id", usuario.id);
  revalidatePath("/panel/medidas");
}
