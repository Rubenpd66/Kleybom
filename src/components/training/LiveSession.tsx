"use client";

import { useRouter } from "next/navigation";
import { useReducer, useRef, useState, useTransition } from "react";
import { borrarSerie, registrarSerie, terminarEntreno } from "@/app/[idioma]/entreno/actions";
import { formatNutriente } from "@/lib/foods/format";
import { useIdioma, useT } from "@/lib/i18n/cliente";
import type { EjercicioDelDia, SerieGuardada } from "@/lib/training/queries";
import { nuevaSesion, sessionReducer, type ActiveSession } from "@/lib/training/session";
import { useRestTimer } from "@/lib/training/useRestTimer";
import SetRow from "./SetRow";

const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal tabular-nums";
const aNumero = (s: string) => (s.trim() === "" ? Number.NaN : Number(s.trim().replace(",", ".")));

function estadoInicial(fecha: string, guardadas: SerieGuardada[]): ActiveSession {
  // Se reconstruye el estado con las series ya guardadas (por si se recargó la página).
  return guardadas.reduce(
    (s, g) => sessionReducer(s, { type: "logSet", exercise_id: g.exercise_id, weight_kg: g.weight_kg, reps: g.reps }),
    nuevaSesion({ date: fecha }),
  );
}

function Ejercicio({
  e,
  series,
  anterior,
  error,
  ocupado,
  onRegistrar,
  onQuitar,
}: {
  e: EjercicioDelDia;
  series: { numero: number; weight_kg: number; reps: number; indiceGlobal: number }[];
  anterior: SerieGuardada[] | undefined;
  error: string | null;
  ocupado: boolean;
  onRegistrar: (peso: number, reps: number) => void;
  onQuitar: (indiceGlobal: number) => void;
}) {
  const t = useT().entreno;
  const idioma = useIdioma();
  const ultima = anterior?.[0];
  const [peso, setPeso] = useState(ultima ? (idioma === "es" ? String(ultima.weight_kg).replace(".", ",") : String(ultima.weight_kg)) : "");
  const [reps, setReps] = useState(ultima ? String(ultima.reps) : "");
  const id = `ej-${e.exercise_id}`;
  const rangoReps = e.reps_min === e.reps_max ? `${e.reps_min}` : `${e.reps_min}-${e.reps_max}`;

  return (
    <section aria-labelledby={id} className="rounded-xl border border-linea bg-papel p-4">
      <h2 id={id} className="font-display text-2xl font-bold">
        {e.name_es}
      </h2>
      <p className="mt-1 text-sm text-acero">{t.objetivo(e.sets, rangoReps, e.rest_seconds)}</p>
      <p className="mt-1 text-sm">
        {anterior && anterior.length > 0
          ? anterior.map((s) => t.ultimaVez(formatNutriente(s.weight_kg, "kg", idioma), s.reps)).slice(0, 1)
          : t.primeraVez}
      </p>

      {series.length > 0 && (
        <ul className="mt-3 divide-y divide-linea">
          {series.map((s) => (
            <SetRow
              key={s.indiceGlobal}
              numero={s.numero}
              weight_kg={s.weight_kg}
              reps={s.reps}
              deshabilitado={ocupado}
              onQuitar={() => onQuitar(s.indiceGlobal)}
            />
          ))}
        </ul>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t.peso}
          <input inputMode="decimal" value={peso} onChange={(x) => setPeso(x.target.value)} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t.reps}
          <input inputMode="numeric" value={reps} onChange={(x) => setReps(x.target.value)} className={campo} />
        </label>
        <button
          type="button"
          disabled={ocupado}
          onClick={() => onRegistrar(aNumero(peso), aNumero(reps))}
          className="col-span-2 h-11 rounded-md bg-hierro px-5 font-bold text-tiza disabled:opacity-60 sm:col-span-1"
        >
          {t.registrar}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-md border-[1.5px] border-hierro p-3 text-sm">
          {error}
        </p>
      )}
    </section>
  );
}

export default function LiveSession({
  workoutId,
  fecha,
  ejercicios,
  guardadas,
  anteriores,
}: {
  workoutId: number;
  fecha: string;
  ejercicios: EjercicioDelDia[];
  guardadas: SerieGuardada[];
  anteriores: Record<number, SerieGuardada[]>;
}) {
  const t = useT().entreno;
  const router = useRouter();
  const [estado, dispatch] = useReducer(sessionReducer, undefined, () => estadoInicial(fecha, guardadas));
  // ids de la base, en el mismo orden que estado.sets.
  const ids = useRef<number[]>(guardadas.map((g) => g.id));
  const [errores, setErrores] = useState<Record<number, string | null>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [ocupado, empezar] = useTransition();
  const descanso = useRestTimer();
  const [avisarFin, setAvisarFin] = useState(false);

  function registrar(e: EjercicioDelDia, peso: number, reps: number) {
    // Primero se valida en el navegador con el reductor; si es válido, se guarda y luego se añade.
    const prueba = sessionReducer(estado, { type: "logSet", exercise_id: e.exercise_id, weight_kg: peso, reps });
    if (prueba.error) {
      setErrores((x) => ({ ...x, [e.exercise_id]: t.errores[prueba.error!] }));
      return;
    }
    empezar(async () => {
      const r = await registrarSerie({ workout_log_id: workoutId, exercise_id: e.exercise_id, weight_kg: peso, reps });
      if (r.error || !r.id) {
        setErrores((x) => ({ ...x, [e.exercise_id]: r.error ?? t.errorGeneral }));
        return;
      }
      ids.current = [...ids.current, r.id];
      dispatch({ type: "logSet", exercise_id: e.exercise_id, weight_kg: peso, reps });
      setErrores((x) => ({ ...x, [e.exercise_id]: null }));
      descanso.start(e.rest_seconds);
      setAvisarFin(e.rest_seconds > 0);
    });
  }

  function quitar(indiceGlobal: number) {
    const serie = estado.sets[indiceGlobal];
    const idBase = ids.current[indiceGlobal];
    if (!serie || idBase === undefined) return;
    empezar(async () => {
      const r = await borrarSerie(idBase);
      if (r.error) {
        setErrores((x) => ({ ...x, [serie.exercise_id]: r.error ?? null }));
        return;
      }
      ids.current = ids.current.filter((_, i) => i !== indiceGlobal);
      dispatch({ type: "deleteSet", exercise_id: serie.exercise_id, set_index: serie.set_index });
    });
  }

  function terminar() {
    const prueba = sessionReducer(estado, { type: "finish" });
    if (prueba.error) {
      setErrorGeneral(t.errores[prueba.error]);
      return;
    }
    empezar(async () => {
      const r = await terminarEntreno(workoutId);
      if (r.error) setErrorGeneral(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {ejercicios.map((e) => (
        <Ejercicio
          key={e.exercise_id}
          e={e}
          series={estado.sets
            .map((s, i) => ({ ...s, indiceGlobal: i }))
            .filter((s) => s.exercise_id === e.exercise_id)
            .map((s) => ({ numero: s.set_index, weight_kg: s.weight_kg, reps: s.reps, indiceGlobal: s.indiceGlobal }))}
          anterior={anteriores[e.exercise_id]}
          error={errores[e.exercise_id] ?? null}
          ocupado={ocupado}
          onRegistrar={(p, r) => registrar(e, p, r)}
          onQuitar={quitar}
        />
      ))}
      {(descanso.running || avisarFin) && (
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border-[1.5px] border-hierro bg-temple p-4 text-tinta">
          {descanso.running ? (
            <p role="timer" className="font-display text-2xl font-bold tabular-nums">
              {t.descansoQueda(descanso.remaining)}
            </p>
          ) : (
            <p aria-live="polite" className="aviso-entra font-bold">
              {t.descansoFin}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              descanso.stop();
              setAvisarFin(false);
            }}
            aria-label={descanso.running ? undefined : t.cerrarAviso}
            className="h-10 rounded-md border-[1.5px] border-hierro px-4 text-sm font-bold"
          >
            {descanso.running ? t.saltarDescanso : "✕"}
          </button>
        </div>
      )}
      {errorGeneral && (
        <p role="alert" className="rounded-md border-[1.5px] border-hierro bg-papel p-3 text-sm">
          {errorGeneral}
        </p>
      )}
      <button
        type="button"
        onClick={terminar}
        disabled={ocupado}
        className="h-12 w-full rounded-md bg-temple px-6 font-bold text-tinta disabled:opacity-60 sm:w-fit"
      >
        {t.terminar}
      </button>
    </div>
  );
}
