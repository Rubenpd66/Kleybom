import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import AvisoInvitado from "@/components/auth/AvisoInvitado";
import MonthView from "@/components/calendar/MonthView";
import PlanSessionDialog from "@/components/calendar/PlanSessionDialog";
import { getCurrentUser } from "@/lib/auth/session";
import { addMonths, monthGrid, toLocalDateKey } from "@/lib/calendar/dates";
import {
  countSessions,
  getUserTimezone,
  listRoutineOptions,
  listSessions,
  ZONA_POR_DEFECTO,
  type Sesion,
} from "@/lib/calendar/queries";
import { esClaveDeDia, esClaveDeMes } from "@/lib/calendar/validate";
import { es } from "@/lib/i18n/es";
import { borrarSesion, cambiarEstado } from "./actions";

const t = es.calendario;

export const metadata: Metadata = { title: `${t.titulo} — ${es.marca}`, robots: { index: false } };

type Params = Promise<Record<string, string | string[] | undefined>>;

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const claveMes = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;
const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });
const nombreDia = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", timeZone: "UTC" });

function BotonEstado({ id, estado, texto }: { id: number; estado: string; texto: string }) {
  return (
    <form action={cambiarEstado.bind(null, id, estado)}>
      <button type="submit" className="h-9 rounded-md border-[1.5px] border-hierro px-3 text-sm font-bold">
        {texto}
      </button>
    </form>
  );
}

function SesionDelDia({ s }: { s: Sesion }) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-linea bg-papel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold">
          {s.routine ? (
            s.routine.slug ? (
              <Link href={`/rutinas/${s.routine.slug}`} className="text-azul underline">
                {s.routine.name}
              </Link>
            ) : (
              s.routine.name
            )
          ) : (
            t.actividadLibre
          )}
          {s.routine_day_index && <span className="font-normal"> · {es.rutinas.dia(s.routine_day_index)}</span>}
        </span>
        <span
          className={`rounded-full px-3 py-0.5 text-sm ${
            s.status === "hecha" ? "bg-temple font-medium text-hierro" : "border border-hierro"
          }`}
        >
          {t.estados[s.status]}
        </span>
      </div>
      {s.note && <p className="text-sm text-acero">{s.note}</p>}
      <div className="flex flex-wrap gap-2">
        {s.status !== "hecha" && <BotonEstado id={s.id} estado="hecha" texto={t.marcarHecha} />}
        {s.status !== "saltada" && <BotonEstado id={s.id} estado="saltada" texto={t.marcarSaltada} />}
        {s.status !== "planificada" && <BotonEstado id={s.id} estado="planificada" texto={t.marcarPlanificada} />}
        <form action={borrarSesion.bind(null, s.id)}>
          <button type="submit" className="h-9 rounded-md px-3 text-sm font-bold text-azul underline">
            {t.borrar}
          </button>
        </form>
      </div>
    </article>
  );
}

async function Contenido({ searchParams }: { searchParams: Params }) {
  await connection();
  // Sin cuenta se ve el mes vacío y el formulario; al guardar se pide entrar.
  const usuario = await getCurrentUser();

  const sp = await searchParams;
  const zona = usuario ? await getUserTimezone(usuario.id) : ZONA_POR_DEFECTO;
  const hoy = toLocalDateKey(new Date(), zona);
  const textoMes = uno(sp.mes);
  const mes = esClaveDeMes(textoMes) ? textoMes : hoy.slice(0, 7);
  const [year, month] = [Number(mes.slice(0, 4)), Number(mes.slice(5, 7))];
  const textoDia = uno(sp.dia);
  const seleccionado = esClaveDeDia(textoDia) ? textoDia : null;
  const fechaFormulario = seleccionado ?? (hoy.startsWith(mes) ? hoy : `${mes}-01`);

  const semanas = monthGrid(year, month);
  const [sesiones, total, rutinas] = await Promise.all([
    usuario ? listSessions(usuario.id, semanas[0][0], semanas.at(-1)!.at(-1)!) : [],
    usuario ? countSessions(usuario.id) : 0,
    listRoutineOptions(),
  ]);
  const anterior = addMonths(year, month, -1);
  const siguiente = addMonths(year, month, 1);
  const delDia = seleccionado ? sesiones.filter((s) => s.date === seleccionado) : [];

  return (
    <>
      {!usuario && <AvisoInvitado ruta="/calendario" que="el calendario" />}
      {usuario && total === 0 && (
        <p className="mt-6 max-w-[62ch] rounded-xl border border-linea bg-papel p-4">{t.vacio}</p>
      )}
      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <section aria-labelledby="titulo-mes">
          <div className="mb-4 flex items-center justify-between gap-2">
            <Link
              href={`/calendario?mes=${claveMes(anterior.year, anterior.month)}`}
              className="text-sm font-bold text-azul underline"
            >
              {t.mesAnterior}
            </Link>
            <h2 id="titulo-mes" className="font-display text-[1.7rem] font-bold">
              {nombreMes.format(new Date(Date.UTC(year, month - 1, 1)))}
            </h2>
            <Link
              href={`/calendario?mes=${claveMes(siguiente.year, siguiente.month)}`}
              className="text-sm font-bold text-azul underline"
            >
              {t.mesSiguiente}
            </Link>
          </div>
          <MonthView year={year} month={month} sesiones={sesiones} hoy={hoy} seleccionado={seleccionado} />
        </section>

        <div className="flex flex-col gap-10">
          {seleccionado && (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-[1.7rem] font-bold">
                {t.sesionesDelDia(nombreDia.format(new Date(`${seleccionado}T00:00:00Z`)))}
              </h2>
              {delDia.length === 0 ? (
                <p className="text-sm text-acero">{t.ningunaEseDia}</p>
              ) : (
                delDia.map((s) => <SesionDelDia key={s.id} s={s} />)
              )}
            </section>
          )}
          <PlanSessionDialog fecha={fechaFormulario} rutinas={rutinas} />
        </div>
      </div>
    </>
  );
}

export default function CalendarioPage(props: PageProps<"/calendario">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {t.titulo}
      </h1>
      <p className="mt-3 max-w-[62ch] text-acero">{t.descripcion}</p>
      <p className="mt-3">
        <Link href="/entreno" className="font-bold text-azul underline">
          {es.entreno.empezarEntreno}
        </Link>
      </p>
      <Suspense fallback={<p className="mt-8 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
