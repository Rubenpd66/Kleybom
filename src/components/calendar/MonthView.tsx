import Link from "next/link";
import { monthGrid } from "@/lib/calendar/dates";
import type { Sesion } from "@/lib/calendar/queries";
import { es } from "@/lib/i18n/es";

const t = es.calendario;

const etiquetaDia = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const MARCA = { planificada: "•", hecha: "✓", saltada: "–" } as const;

export default function MonthView({
  year,
  month,
  sesiones,
  hoy,
  seleccionado,
}: {
  year: number;
  month: number;
  sesiones: Sesion[];
  hoy: string;
  seleccionado: string | null;
}) {
  const mes = `${year}-${String(month).padStart(2, "0")}`;
  const porDia = new Map<string, Sesion[]>();
  for (const s of sesiones) porDia.set(s.date, [...(porDia.get(s.date) ?? []), s]);

  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <thead>
        <tr>
          {t.diasSemana.map((d, i) => (
            <th key={d} scope="col" className="pb-2 font-bold">
              <abbr title={t.diasSemanaLargos[i]} className="no-underline">
                {d}
              </abbr>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {monthGrid(year, month).map((semana) => (
          <tr key={semana[0]}>
            {semana.map((dia) => {
              const delMes = dia.startsWith(mes);
              const lista = porDia.get(dia) ?? [];
              const esHoy = dia === hoy;
              const elegido = dia === seleccionado;
              const etiqueta = `${etiquetaDia.format(new Date(`${dia}T00:00:00Z`))}, ${t.sesiones(lista.length)}${esHoy ? `, ${t.hoy.toLowerCase()}` : ""}`;
              return (
                <td key={dia} className="border border-linea p-0 align-top">
                  <Link
                    href={`/calendario?mes=${dia.slice(0, 7)}&dia=${dia}`}
                    aria-label={etiqueta}
                    aria-current={elegido ? "date" : undefined}
                    className={`flex min-h-14 flex-col gap-1 p-1 sm:min-h-24 sm:p-2 ${
                      delMes ? "bg-papel" : "bg-tiza text-acero"
                    } ${elegido ? "outline outline-[3px] -outline-offset-[3px] outline-hierro" : ""} hover:bg-realce`}
                  >
                    <span
                      className={`w-fit rounded-full px-1.5 font-bold ${esHoy ? "bg-temple text-tinta" : ""}`}
                    >
                      {Number(dia.slice(8))}
                    </span>
                    {lista.length > 0 && (
                      <>
                        <span className="text-xs font-bold sm:hidden" aria-hidden="true">
                          {lista.map((s) => MARCA[s.status]).join("")}
                        </span>
                        <span className="hidden flex-col gap-0.5 sm:flex" aria-hidden="true">
                          {lista.slice(0, 2).map((s) => (
                            <span key={s.id} className="truncate text-xs">
                              {MARCA[s.status]} {s.routine?.name ?? s.note ?? t.actividadLibre}
                            </span>
                          ))}
                          {lista.length > 2 && <span className="text-xs text-acero">+{lista.length - 2}</span>}
                        </span>
                      </>
                    )}
                  </Link>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
