// Plan de una rutina en el calendario: qué días de la semana se entrena según los días de la rutina,
// repartiendo los descansos de la forma habitual (3 días → lunes, miércoles y viernes).
import { daysInMonth } from "./dates";

// Desplazamientos desde el primer día de entreno de la semana (0 = ese día, 1 = el siguiente...).
// Empezando en lunes salen los repartos de siempre: 2 → L J · 3 → L X V · 4 → L M J V · 5 → L M X V S.
const PATRONES: Record<number, number[]> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export type Repetir = "dia" | "mes" | "4semanas";
export const REPETIR: Repetir[] = ["dia", "mes", "4semanas"];

const UN_DIA = 86_400_000;
const aFecha = (clave: string) => Date.UTC(Number(clave.slice(0, 4)), Number(clave.slice(5, 7)) - 1, Number(clave.slice(8, 10)));
const aClave = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function patronSemanal(diasPorSemana: number): number[] {
  return PATRONES[Math.min(7, Math.max(1, Math.round(diasPorSemana)))];
}

// Último día del plan: el mismo día, el final de ese mes o cuatro semanas (28 días) desde el inicio.
export function finDelPlan(inicio: string, repetir: Repetir): string {
  if (repetir === "dia") return inicio;
  if (repetir === "4semanas") return aClave(aFecha(inicio) + 27 * UN_DIA);
  const [anio, mes] = [Number(inicio.slice(0, 4)), Number(inicio.slice(5, 7))];
  return `${inicio.slice(0, 7)}-${String(daysInMonth(anio, mes)).padStart(2, "0")}`;
}

// Sesiones del plan: cada fecha con el día de la rutina que toca, que va rotando (Día 1, Día 2... y vuelta
// a empezar). El patrón arranca el día elegido, así ese día siempre se entrena.
export function planDeRutina(
  inicio: string,
  diasPorSemana: number,
  repetir: Repetir,
  primerDia = 1,
): { fecha: string; dia: number }[] {
  const dias = Math.min(7, Math.max(1, Math.round(diasPorSemana)));
  const patron = new Set(patronSemanal(dias));
  const desde = aFecha(inicio);
  const hasta = aFecha(finDelPlan(inicio, repetir));
  const plan: { fecha: string; dia: number }[] = [];
  for (let ms = desde, i = 0; ms <= hasta; ms += UN_DIA, i++) {
    if (!patron.has(i % 7)) continue;
    plan.push({ fecha: aClave(ms), dia: ((primerDia - 1 + plan.length) % dias) + 1 });
  }
  return plan;
}
