import { esClaveDeDia } from "@/lib/calendar/validate";

// Mismos límites que la tabla body_measurements.
export type MeasurementDraft = {
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  chest_cm: number | null;
};

const LIMITES = {
  weight_kg: { min: 20, max: 400, nombre: "El peso", unidad: "kg" },
  waist_cm: { min: 30, max: 300, nombre: "La cintura", unidad: "cm" },
  hip_cm: { min: 30, max: 300, nombre: "La cadera", unidad: "cm" },
  chest_cm: { min: 30, max: 300, nombre: "El pecho", unidad: "cm" },
} as const;

export const CAMPOS = Object.keys(LIMITES) as (keyof typeof LIMITES)[];

// `hoy` (AAAA-MM-DD) permite rechazar fechas futuras; si no se pasa, no se comprueba.
export function validateMeasurement(m: MeasurementDraft, hoy?: string): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!esClaveDeDia(m.date)) errors.push("Elige una fecha válida.");
  else if (hoy && m.date > hoy) errors.push("La fecha no puede ser futura.");

  if (CAMPOS.every((c) => m[c] === null)) errors.push("Escribe al menos un dato (peso o alguna medida).");
  for (const c of CAMPOS) {
    const v = m[c];
    if (v === null) continue;
    const l = LIMITES[c];
    if (!Number.isFinite(v) || v < l.min || v > l.max) {
      errors.push(`${l.nombre} debe estar entre ${l.min} y ${l.max} ${l.unidad}.`);
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
