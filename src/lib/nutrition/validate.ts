import { MAX_GRAMOS } from "./portion";

// Gramos escritos por el usuario ("150", "150,5"). Mismos límites que la base de datos.
export function validarGramos(texto: string): { gramos: number } | { error: string } {
  const limpio = String(texto ?? "").trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return { error: "Escribe los gramos con números, por ejemplo 150." };
  const gramos = Math.round(Number(limpio) * 10) / 10;
  if (gramos <= 0 || gramos > MAX_GRAMOS) {
    return { error: `La cantidad debe estar entre 0,1 y ${MAX_GRAMOS} g.` };
  }
  return { gramos };
}
