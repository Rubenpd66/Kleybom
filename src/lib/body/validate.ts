import { esClaveDeDia } from "@/lib/calendar/validate";
import { es, type Diccionario } from "@/lib/i18n/es";

// Mismos límites que la tabla body_measurements.
export type MeasurementDraft = {
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  chest_cm: number | null;
};

const LIMITES = {
  weight_kg: { min: 20, max: 400, unidad: "kg" },
  waist_cm: { min: 30, max: 300, unidad: "cm" },
  hip_cm: { min: 30, max: 300, unidad: "cm" },
  chest_cm: { min: 30, max: 300, unidad: "cm" },
} as const;

export const CAMPOS = Object.keys(LIMITES) as (keyof typeof LIMITES)[];

// `hoy` (AAAA-MM-DD) permite rechazar fechas futuras; si no se pasa, no se comprueba.
// `t`: los mensajes en el idioma de la página (por defecto, español).
export function validateMeasurement(
  m: MeasurementDraft,
  hoy?: string,
  t: Diccionario["medidas"]["errores"] = es.medidas.errores,
): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!esClaveDeDia(m.date)) errors.push(t.fecha);
  else if (hoy && m.date > hoy) errors.push(t.futuro);

  if (CAMPOS.every((c) => m[c] === null)) errors.push(t.vacio);
  for (const c of CAMPOS) {
    const v = m[c];
    if (v === null) continue;
    const l = LIMITES[c];
    if (!Number.isFinite(v) || v < l.min || v > l.max) {
      errors.push(t.rango(t.campos[c], l.min, l.max, l.unidad));
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
