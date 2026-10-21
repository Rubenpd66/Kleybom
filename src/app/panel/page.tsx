import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { salir } from "@/app/(auth)/actions";
import ProgressBar from "@/components/motion/ProgressBar";
import { getCurrentUser } from "@/lib/auth/session";
import { toLocalDateKey } from "@/lib/calendar/dates";
import { getUserTimezone, listSessions } from "@/lib/calendar/queries";
import { formatNutriente } from "@/lib/foods/format";
import { es } from "@/lib/i18n/es";
import { summarizeDay } from "@/lib/nutrition/diary";
import { getGoals, listEntries } from "@/lib/nutrition/queries";
import { addDays, currentStreak, weekStartOf, weeklyVolume } from "@/lib/stats/aggregate";
import { getSetsSince, getTrainedDates } from "@/lib/stats/queries";
import { createServerClient } from "@/lib/supabase/server";

const t = es.panel;

export const metadata: Metadata = { title: `${es.auth.panel} — ${es.marca}`, robots: { index: false } };

function Tarjeta({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2 rounded-xl border border-linea bg-papel p-5">
      <h2 id={id} className="font-display text-2xl font-bold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

async function Contenido() {
  await connection();
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/entrar");

  const hoy = toLocalDateKey(new Date(), await getUserTimezone(usuario.id));
  const lunes = weekStartOf(hoy);
  const supabase = await createServerClient();
  const [sesionesHoy, entradas, objetivos, fechas, series, { count: medidas }, { count: planificadas }] = await Promise.all([
    listSessions(usuario.id, hoy, hoy),
    listEntries(usuario.id, hoy),
    getGoals(usuario.id),
    getTrainedDates(usuario.id, addDays(hoy, -400)),
    getSetsSince(usuario.id, lunes),
    supabase.from("body_measurements").select("id", { count: "exact", head: true }).eq("user_id", usuario.id),
    supabase.from("planned_sessions").select("id", { count: "exact", head: true }).eq("user_id", usuario.id),
  ]);

  const nuevo = !objetivos && fechas.length === 0 && entradas.length === 0 && !medidas && !planificadas;
  const kcal = summarizeDay(entradas).total.kcal;
  const consumidas = formatNutriente(kcal ?? 0, "kcal");
  const entrenosSemana = new Set(fechas.filter((f) => f >= lunes && f <= hoy)).size;

  return (
    <>
      <p className="mt-3 text-acero">
        {es.auth.sesionComo} <strong>{usuario.email}</strong>
      </p>

      {nuevo && (
        <section className="mt-8 max-w-2xl rounded-xl border-[1.5px] border-hierro bg-papel p-5">
          <h2 id="pasos" className="font-display text-[1.7rem] font-bold">
            {t.pasosTitulo}
          </h2>
          <ol aria-labelledby="pasos" className="mt-4 flex flex-col gap-4">
            {t.pasos.map((p, i) => (
              <li key={p.enlace} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-temple font-bold text-hierro">
                  {i + 1}
                </span>
                <span>
                  {p.texto}{" "}
                  <Link href={p.enlace} className="font-bold text-azul underline">
                    {p.accion}
                  </Link>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta id="hoy" titulo={t.hoy}>
          {sesionesHoy.length === 0 ? (
            <p className="text-sm text-acero">
              {t.nadaHoy}{" "}
              <Link href="/calendario" className="text-azul underline">
                {t.planificar}
              </Link>
            </p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {sesionesHoy.map((s) => (
                <li key={s.id}>
                  <strong>{s.routine?.name ?? es.calendario.actividadLibre}</strong>
                  {s.status === "hecha" && <span className="ml-2 rounded-full bg-temple px-2 text-xs text-hierro">{t.hecha}</span>}
                </li>
              ))}
            </ul>
          )}
          <Link href="/entreno" className="mt-auto text-sm font-bold text-azul underline">
            {t.empezar}
          </Link>
        </Tarjeta>

        <Tarjeta id="calorias" titulo={t.caloriasHoy}>
          <p className="text-lg font-bold">{objetivos ? t.deObjetivo(consumidas, objetivos.kcal) : t.sinObjetivo(consumidas)}</p>
          {objetivos && <ProgressBar porcentaje={((kcal ?? 0) / objetivos.kcal) * 100} />}
          <Link href="/nutricion" className="mt-auto text-sm font-bold text-azul underline">
            {t.abrirDiario}
          </Link>
        </Tarjeta>

        <Tarjeta id="racha" titulo={t.racha}>
          <p className="font-display text-4xl font-extrabold">{t.rachaTexto(currentStreak(fechas, hoy))}</p>
          <p className="text-sm text-acero">{t.rachaAyuda}</p>
        </Tarjeta>

        <Tarjeta id="semana" titulo={t.semana}>
          <p className="text-lg font-bold">{t.entrenos(entrenosSemana)}</p>
          <p className="text-sm text-acero">{t.volumen(formatNutriente(weeklyVolume(series, lunes), "kg"))}</p>
          <Link href="/estadisticas" className="mt-auto text-sm font-bold text-azul underline">
            {t.verEstadisticas}
          </Link>
        </Tarjeta>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">{t.atajos}</h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/panel/rutinas" className="font-bold text-azul underline">
              {es.misRutinas.enlace}
            </Link>
          </li>
          <li>
            <Link href="/panel/medidas" className="font-bold text-azul underline">
              {es.medidas.enlace}
            </Link>
          </li>
          <li>
            <Link href="/nutricion/objetivos" className="font-bold text-azul underline">
              {es.diario.verObjetivos}
            </Link>
          </li>
          <li>
            <Link href="/panel/perfil" className="font-bold text-azul underline">
              {es.perfil.enlace}
            </Link>
          </li>
          <li>
            <a href="/api/cuenta/exportar" className="font-bold text-azul underline">
              {t.exportar}
            </a>
          </li>
        </ul>
      </section>

      <form action={salir} className="mt-8">
        <button type="submit" className="h-11 rounded-md border-[1.5px] border-hierro px-6 font-bold">
          {es.auth.salir}
        </button>
      </form>
    </>
  );
}

export default function PanelPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{es.auth.panel}</h1>
      <Suspense fallback={<p className="mt-3 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}
