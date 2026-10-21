// Fechas del calendario sin librerías. Las fechas se representan como "AAAA-MM-DD" (clave de día),
// que se ordena y compara como texto. Los meses van de 1 a 12.

// Día local de un instante en una zona horaria (formato AAAA-MM-DD).
export function toLocalDateKey(d: Date, tz: string): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)!.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

function comprobarMes(month: number) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`Mes no válido: ${month}`);
  }
}

export function daysInMonth(year: number, month: number): number {
  comprobarMes(month);
  // Día 0 del mes siguiente = último día de este mes (en UTC, sin efectos de zona horaria).
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const clave = (d: Date) => d.toISOString().slice(0, 10);

// Semanas del mes (empiezan en lunes), rellenando con días del mes anterior y del siguiente.
export function monthGrid(year: number, month: number): string[][] {
  comprobarMes(month);
  const primero = new Date(Date.UTC(year, month - 1, 1));
  const relleno = (primero.getUTCDay() + 6) % 7; // lunes = 0 … domingo = 6
  const filas = Math.ceil((relleno + daysInMonth(year, month)) / 7);
  const semanas: string[][] = [];
  for (let f = 0; f < filas; f++) {
    const semana: string[] = [];
    for (let c = 0; c < 7; c++) {
      semana.push(clave(new Date(Date.UTC(year, month - 1, 1 - relleno + f * 7 + c))));
    }
    semanas.push(semana);
  }
  return semanas;
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  comprobarMes(month);
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
}
