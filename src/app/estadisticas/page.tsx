import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import AvisoInvitado from "@/components/auth/AvisoInvitado";
import { BarChart, COLOR_SERIE, LineChart, StatTile } from "@/components/stats/Charts";
import { getCurrentUser } from "@/lib/auth/session";
import { toLocalDateKey } from "@/lib/calendar/dates";
import { getUserTimezone, ZONA_POR_DEFECTO } from "@/lib/calendar/queries";
import { formatNutriente } from "@/lib/foods/format";
import { es } from "@/lib/i18n/es";
import { addDays, currentStreak, movingAverage, weekStartOf, weeklyVolumeSeries, type Punto } from "@/lib/stats/aggregate";
import { getExerciseNames, getSetsSince, getTrainedDates, getWeightSeries } from "@/lib/stats/queries";
import { estimate1RM } from "@/lib/training/progression";

const t = es.estadisticas;

export const metadata: Metadata = { title: `${t.titulo} — ${es.marca}`, robots: { index: false } };

type Params = Promise<Record<string, string | string[] | undefined>>;
const fechaCorta = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtFecha = (f: string) => fechaCorta.format(new Date(`${f}T00:00:00Z`));
const kg = (v: number) => formatNutriente(Math.round(v * 10) / 10, "kg");

function Seccion({ id, titulo, ayuda, children }: { id: string; titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-linea bg-papel p-5">
      <h2 id={id} className="font-display text-[1.7rem] font-bold">
        {titulo}
      </h2>
      {ayuda && <p className="mt-1 text-sm text-acero">{ayuda}</p>}
      {children}
    </section>
  );
}

async function Contenido({ searchParams }: { searchParams: Params }) {
  await connection();
  const usuario = await getCurrentUser();

  const hoy = toLocalDateKey(new Date(), usuario ? await getUserTimezone(usuario.id) : ZONA_POR_DEFECTO);
  const desde = addDays(hoy, -182);
  // Sin cuenta no hay datos: se ve el estado vacío con el aviso para entrar.
  const [fechas, series, pesos] = usuario
    ? await Promise.all([getTrainedDates(usuario.id, desde), getSetsSince(usuario.id, desde), getWeightSeries(usuario.id, desde)])
    : [[], [], []];

  if (fechas.length === 0 && pesos.length === 0) {
    return (
      <div className="mt-8 max-w-[62ch] rounded-xl border border-linea bg-papel p-6">
        {!usuario && <AvisoInvitado ruta="/estadisticas" />}
        <p>{t.vacio}</p>
        <p className="mt-4 flex flex-wrap gap-4">
          <Link href="/entreno" className="font-bold text-azul underline">
            {t.empezarEntreno}
          </Link>
          <Link href="/panel/medidas" className="font-bold text-azul underline">
            {t.apuntarPeso}
          </Link>
        </p>
      </div>
    );
  }

  // Constancia.
  const unicas = [...new Set(fechas)];
  const lunes = weekStartOf(hoy);
  const estaSemana = unicas.filter((f) => f >= lunes && f <= hoy).length;
  const ultimos30 = unicas.filter((f) => f > addDays(hoy, -30) && f <= hoy).length;

  // Volumen semanal (12 semanas).
  const volumen = weeklyVolumeSeries(series, lunes, 12);
  const mediaVolumen = volumen.reduce((a, p) => a + p.value, 0) / volumen.length;

  // 1RM estimado por ejercicio: el más frecuente por defecto, o el elegido.
  const frecuencia = new Map<number, number>();
  for (const s of series) frecuencia.set(s.exercise_id, (frecuencia.get(s.exercise_id) ?? 0) + 1);
  const ejercicios = [...frecuencia.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const nombres = await getExerciseNames(ejercicios);
  const pedido = Number((await searchParams).ejercicio);
  const elegido = ejercicios.includes(pedido) ? pedido : ejercicios[0];
  const porDia = new Map<string, number>();
  for (const s of series) {
    if (s.exercise_id !== elegido || !Number.isInteger(s.reps) || s.reps < 1 || s.reps > 30) continue;
    porDia.set(s.date, Math.max(porDia.get(s.date) ?? 0, estimate1RM(s.weight_kg, s.reps)));
  }
  const rm: Punto[] = [...porDia.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, value]) => ({ date, value }));
  const nombreElegido = elegido ? (nombres.get(elegido) ?? "") : "";

  const media = movingAverage(pesos, 7);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Seccion id="constancia" titulo={t.constancia}>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatTile valor={t.racha(currentStreak(unicas, hoy))} etiqueta={t.rachaEtiqueta} />
          <StatTile valor={String(estaSemana)} etiqueta={t.estaSemana} />
          <StatTile valor={String(ultimos30)} etiqueta={t.ultimos30} />
        </div>
      </Seccion>

      <Seccion id="volumen" titulo={t.volumen} ayuda={t.volumenAyuda}>
        {series.length === 0 ? (
          <p className="mt-3 text-sm text-acero">{t.sinEntrenos}</p>
        ) : (
          <BarChart
            titulo={t.volumen}
            resumen={t.volumenResumen(kg(volumen.at(-1)!.value), kg(mediaVolumen))}
            puntos={volumen}
            formato={kg}
            formatoFecha={fmtFecha}
            nombreValor={t.volumen}
          />
        )}
      </Seccion>

      <Seccion id="rm" titulo={t.rm} ayuda={t.rmAyuda}>
        {ejercicios.length === 0 ? (
          <p className="mt-3 text-sm text-acero">{t.sinEntrenos}</p>
        ) : (
          <>
            <form method="get" className="mt-3 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm font-bold">
                {t.ejercicio}
                <select name="ejercicio" defaultValue={elegido} className="h-10 rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal">
                  {ejercicios.map((id) => (
                    <option key={id} value={id}>
                      {nombres.get(id) ?? id}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="h-10 rounded-md border-[1.5px] border-hierro px-4 text-sm font-bold">
                {t.ver}
              </button>
            </form>
            {rm.length > 0 && (
              <LineChart
                titulo={t.rmTitulo(nombreElegido)}
                resumen={t.rmResumen(kg(rm.at(-1)!.value), kg(Math.max(...rm.map((p) => p.value))))}
                series={[{ nombre: t.rm, color: COLOR_SERIE.principal, puntos: rm }]}
                formato={kg}
                formatoFecha={fmtFecha}
              />
            )}
          </>
        )}
      </Seccion>

      <Seccion id="peso" titulo={t.peso}>
        {pesos.length === 0 ? (
          <p className="mt-3 text-sm text-acero">
            {t.sinPeso}{" "}
            <Link href="/panel/medidas" className="text-azul underline">
              {t.apuntarPeso}
            </Link>
          </p>
        ) : (
          <LineChart
            titulo={t.peso}
            resumen={t.pesoResumen(kg(pesos.at(-1)!.value), kg(media.at(-1)!.value))}
            series={[
              { nombre: t.pesoSerie, color: COLOR_SERIE.principal, puntos: pesos },
              { nombre: t.mediaMovil, color: COLOR_SERIE.secundaria, puntos: media, discontinua: true },
            ]}
            formato={kg}
            formatoFecha={fmtFecha}
          />
        )}
      </Seccion>
    </div>
  );
}

export default function EstadisticasPage(props: PageProps<"/estadisticas">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <Suspense fallback={<p className="mt-8 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
