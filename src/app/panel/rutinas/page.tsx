import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { es } from "@/lib/i18n/es";
import { formatearSeries } from "@/lib/routines/format";
import { getMyRoutines } from "@/lib/routines/queries";
import { borrarRutina } from "./actions";

const t = es.misRutinas;

export const metadata: Metadata = { title: `${t.titulo} — ${es.marca}`, robots: { index: false } };

async function Contenido() {
  await connection();
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/entrar");
  const rutinas = await getMyRoutines(usuario.id);

  if (rutinas.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-linea bg-papel p-6">
        <p>{t.vacio}</p>
        <Link href="/rutinas/nueva" className="mt-4 inline-block font-bold text-azul underline">
          {es.constructor.crear}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      {rutinas.map((r) => (
        <article key={r.id} className="rounded-xl border border-linea bg-papel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight">{r.name}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-temple px-3 py-0.5 text-sm font-medium text-hierro">
                  {es.rutinas.objetivos[r.goal]}
                </span>
                <span className="rounded-full border border-hierro px-3 py-0.5 text-sm">
                  {es.rutinas.niveles[r.level]}
                </span>
              </p>
            </div>
            <form action={borrarRutina.bind(null, r.id)}>
              <button
                type="submit"
                aria-label={t.borrar(r.name)}
                className="h-10 rounded-md border-[1.5px] border-hierro px-3 text-sm font-bold"
              >
                Borrar
              </button>
            </form>
          </div>
          {r.dias.map((d) => (
            <section key={d.dia} className="mt-5">
              <h3 className="font-bold">{es.rutinas.dia(d.dia)}</h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {d.ejercicios.map((e, i) => (
                  <li key={`${d.dia}-${i}`}>
                    <Link href={`/ejercicios/${e.exercise.slug}`} className="text-azul underline">
                      {e.exercise.name_es}
                    </Link>
                    <span className="text-acero">
                      {" "}
                      · {formatearSeries(e.sets, e.reps_min, e.reps_max)} · {es.rutinas.descanso(e.rest_seconds)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      ))}
    </div>
  );
}

export default function MisRutinasPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <Link href="/panel" className="text-sm font-bold text-azul underline">
        {es.perfil.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {t.titulo}
      </h1>
      <p className="mt-3">
        <Link href="/rutinas/nueva" className="font-bold text-azul underline">
          {es.constructor.crear}
        </Link>
      </p>
      <Suspense fallback={<p className="mt-6 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}
