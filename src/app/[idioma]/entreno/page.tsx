import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { connection } from "next/server";
import { Suspense } from "react";
import AvisoInvitado from "@/components/auth/AvisoInvitado";
import LiveSession from "@/components/training/LiveSession";
import StartForm from "@/components/training/StartForm";
import { getCurrentUser } from "@/lib/auth/session";
import { toLocalDateKey } from "@/lib/calendar/dates";
import { getUserTimezone, listRoutineOptions } from "@/lib/calendar/queries";
import { formatNutriente } from "@/lib/foods/format";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { compareSessions } from "@/lib/training/progression";
import {
  getDayExercises,
  getPreviousSets,
  getSets,
  getWorkout,
  listPlannedWithRoutine,
  type Workout,
} from "@/lib/training/queries";
import { createServerClient } from "@/lib/supabase/server";
import { empezarPlanificada } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.entreno.titulo} — ${es.marca}`, robots: { index: false } };
}

type Params = Promise<Record<string, string | string[] | undefined>>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const conSigno = (n: number, unidad: string, idioma: "es" | "en") => `${n > 0 ? "+" : ""}${formatNutriente(n, unidad, idioma)}`;

async function Resumen({ w, userId }: { w: Workout; userId: string }) {
  const [series, es, idioma] = await Promise.all([getSets(w.id), getT(), getIdioma()]);
  const t = es.entreno;
  const volumen = series.reduce((a, s) => a + s.weight_kg * s.reps, 0);
  const ejercicios = new Set(series.map((s) => s.exercise_id)).size;

  // Sesión anterior terminada de la misma rutina y día, para comparar.
  const supabase = await createServerClient();
  let comparacion: { volumeDelta: number; best1RMDelta: number } | null = null;
  if (w.routine_id) {
    const { data: previa } = await supabase
      .from("workout_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("routine_id", w.routine_id)
      .eq("routine_day_index", w.routine_day_index ?? 1)
      .neq("id", w.id)
      .not("finished_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (previa) comparacion = compareSessions(await getSets(previa.id), series);
  }

  return (
    <section aria-labelledby="resumen" className="mt-6 max-w-2xl rounded-xl border-[1.5px] border-hierro bg-papel p-5">
      <h2 id="resumen" className="font-display text-[1.7rem] font-bold">
        {t.resumen}
      </h2>
      {w.routine_name && <p className="mt-1 text-acero">{w.routine_name}</p>}
      <dl className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <dt className="text-sm text-acero">{t.ejercicios}</dt>
          <dd className="text-xl font-bold">{ejercicios}</dd>
        </div>
        <div>
          <dt className="text-sm text-acero">{t.seriesEtiqueta}</dt>
          <dd className="text-xl font-bold">{t.series(series.length)}</dd>
        </div>
        <div>
          <dt className="text-sm text-acero">{t.volumen}</dt>
          <dd className="text-xl font-bold">{formatNutriente(volumen, "kg", idioma)}</dd>
        </div>
      </dl>
      <div className="mt-4 text-sm">
        {comparacion ? (
          <>
            <p className="font-bold">{t.comparado}</p>
            <p>{t.volumenDelta(conSigno(comparacion.volumeDelta, "kg", idioma))}</p>
            <p>{t.mejorDelta(conSigno(comparacion.best1RMDelta, "kg", idioma))}</p>
          </>
        ) : (
          <p className="text-acero">{t.primeraSesion}</p>
        )}
      </div>
      <p className="mt-5 flex flex-wrap gap-4 text-sm">
        <Link href="/calendario" className="font-bold text-azul underline">
          {t.verCalendario}
        </Link>
        <Link href="/entreno" className="font-bold text-azul underline">
          {t.otroEntreno}
        </Link>
      </p>
    </section>
  );
}

async function Contenido({ searchParams }: { searchParams: Params }) {
  await connection();
  const [usuario, es, idioma] = await Promise.all([getCurrentUser(), getT(), getIdioma()]);
  const t = es.entreno;
  if (!usuario) {
    // Sin cuenta: se ve cómo empezar un entreno; al empezarlo se pide entrar.
    return (
      <>
        <AvisoInvitado ruta="/entreno" />
        <section className="mt-10">
          <h2 className="font-display text-[1.7rem] font-bold">{t.otraTitulo}</h2>
          <StartForm rutinas={await listRoutineOptions(undefined, idioma)} />
        </section>
      </>
    );
  }

  const id = Number(uno((await searchParams).id));
  if (Number.isInteger(id) && id > 0) {
    const w = await getWorkout(id, usuario.id, undefined, idioma);
    if (!w) return <p className="mt-6">{t.noEncontrado}</p>;
    if (w.finished_at) return <Resumen w={w} userId={usuario.id} />;

    const ejercicios = w.routine_id ? await getDayExercises(w.routine_id, w.routine_day_index ?? 1, undefined, idioma) : [];
    if (ejercicios.length === 0) return <p className="mt-6">{t.sinEjercicios}</p>;
    const [guardadas, previas] = await Promise.all([
      getSets(w.id),
      getPreviousSets(usuario.id, ejercicios.map((e) => e.exercise_id), w.id),
    ]);
    return (
      <>
        {w.routine_name && (
          <p className="mt-4 font-bold">
            {w.routine_name} · {es.rutinas.dia(w.routine_day_index ?? 1)}
          </p>
        )}
        <LiveSession
          workoutId={w.id}
          fecha={w.date}
          ejercicios={ejercicios}
          guardadas={guardadas}
          anteriores={Object.fromEntries(previas)}
        />
      </>
    );
  }

  const hoy = toLocalDateKey(new Date(), await getUserTimezone(usuario.id));
  const [planificadas, rutinas] = await Promise.all([listPlannedWithRoutine(usuario.id, hoy, undefined, idioma), listRoutineOptions(undefined, idioma)]);
  return (
    <>
      <section className="mt-8">
        <h2 className="font-display text-[1.7rem] font-bold">{t.hoyTitulo}</h2>
        {planificadas.length === 0 ? (
          <p className="mt-2 text-sm text-acero">
            {t.nadaHoy}{" "}
            <Link href="/calendario" className="text-azul underline">
              {t.planificar}
            </Link>
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {planificadas.map((p) => (
              <article key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-linea bg-papel p-4">
                <span className="font-bold">
                  {p.routine_name}
                  {p.routine_day_index && <span className="font-normal"> · {es.rutinas.dia(p.routine_day_index)}</span>}
                </span>
                <form action={empezarPlanificada.bind(null, p.id)}>
                  <button type="submit" className="h-10 rounded-md bg-hierro px-5 font-bold text-tiza">
                    {t.empezar}
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="mt-10">
        <h2 className="font-display text-[1.7rem] font-bold">{t.otraTitulo}</h2>
        <StartForm rutinas={rutinas} />
      </section>
    </>
  );
}

export default async function EntrenoPage(props: PageProps<"/[idioma]/entreno">) {
  const es = await getT();
  const t = es.entreno;
  return (
    <main className="mx-auto w-full lg:px-10 2xl:px-16 flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <Suspense fallback={<p className="mt-8 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
