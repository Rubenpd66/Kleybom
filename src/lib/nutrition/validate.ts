import { es, type Diccionario } from "@/lib/i18n/es";
import { MAX_GRAMOS } from "./portion";

// Gramos escritos por el usuario ("150", "150,5"). Mismos límites que la base de datos.
export function validarGramos(texto: string, t: Diccionario["diario"] = es.diario): { gramos: number } | { error: string } {
  const limpio = String(texto ?? "").trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return { error: t.errorGramosFormato };
  const gramos = Math.round(Number(limpio) * 10) / 10;
  if (gramos <= 0 || gramos > MAX_GRAMOS) {
    return { error: t.errorGramosRango(MAX_GRAMOS) };
  }
  return { gramos };
}
