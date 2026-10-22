import { es, type Diccionario } from "@/lib/i18n/es";
import { daysInMonth } from "./dates";

export function esClaveDeMes(s: string): boolean {
  const m = /^(\d{4})-(\d{2})$/.exec(s);
  return !!m && Number(m[2]) >= 1 && Number(m[2]) <= 12;
}

export function esClaveDeDia(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= daysInMonth(anio, mes);
}

export type SesionEntrada = { fecha: string; rutina: string; dia: string; nota: string };
export type SesionDatos = {
  date: string;
  routine_id: number | null;
  routine_day_index: number | null;
  note: string | null;
};

const entero = (s: string) => (/^\d+$/.test(s) ? Number(s) : Number.NaN);

export function validarSesion(
  e: SesionEntrada,
  t: Diccionario["calendario"]["errores"] = es.calendario.errores,
): { datos: SesionDatos } | { error: string } {
  const fecha = e.fecha.trim();
  if (!esClaveDeDia(fecha)) return { error: t.fecha };

  const textoRutina = e.rutina.trim();
  const rutina = textoRutina ? entero(textoRutina) : null;
  if (rutina !== null && (!Number.isInteger(rutina) || rutina < 1)) return { error: t.rutina };

  const textoDia = e.dia.trim();
  const dia = textoDia ? entero(textoDia) : null;
  if (dia !== null && (!Number.isInteger(dia) || dia < 1 || dia > 7))
    return { error: t.dia };
  if (dia !== null && rutina === null) return { error: t.diaSinRutina };

  const nota = e.nota.trim();
  if (nota.length > 300) return { error: t.nota };

  return { datos: { date: fecha, routine_id: rutina, routine_day_index: dia, note: nota || null } };
}
