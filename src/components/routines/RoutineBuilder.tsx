"use client";

import { useReducer, useState, useTransition } from "react";
import {
  buscarEjercicios,
  guardarRutina,
  type ResultadoBusqueda,
} from "@/app/rutinas/nueva/actions";
import { es } from "@/lib/i18n/es";
import { builderReducer, emptyDraft } from "@/lib/routines/builder";
import { GOALS, LEVELS } from "@/lib/routines/validate";

const t = es.constructor;
const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";
const numero = "h-10 w-20 rounded-md border-[1.5px] border-hierro bg-papel px-2";
const boton = "h-10 rounded-md border-[1.5px] border-hierro px-3 text-sm font-bold";

export default function RoutineBuilder() {
  const [estado, dispatch] = useReducer(builderReducer, undefined, emptyDraft);
  const [nombres, setNombres] = useState<Record<number, string>>({});
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda | null>(null);
  const [diaDestino, setDiaDestino] = useState(1);
  const [errores, setErrores] = useState<string[]>([]);
  const [buscando, buscar] = useTransition();
  const [guardando, guardar] = useTransition();

  const dias = Array.from({ length: estado.days_per_week }, (_, i) => i + 1);
  const destino = Math.min(diaDestino, estado.days_per_week);

  function lanzarBusqueda() {
    buscar(async () => setResultados(await buscarEjercicios(texto)));
  }

  function enviar() {
    guardar(async () => {
      const r = await guardarRutina(estado);
      setErrores(r?.errores ?? []);
    });
  }

  return (
    <div className="mt-8 flex flex-col gap-10">
      <section className="grid max-w-3xl gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-3">
          {t.nombre}
          <input
            value={estado.name}
            maxLength={100}
            onChange={(e) => dispatch({ type: "setMeta", name: e.target.value })}
            className={campo}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-1">
          {t.objetivo}
          <select
            value={estado.goal}
            onChange={(e) => dispatch({ type: "setMeta", goal: e.target.value as (typeof GOALS)[number] })}
            className={campo}
          >
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {es.rutinas.objetivos[g]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-1">
          {t.nivel}
          <select
            value={estado.level}
            onChange={(e) => dispatch({ type: "setMeta", level: e.target.value as (typeof LEVELS)[number] })}
            className={campo}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {es.rutinas.niveles[l]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm font-bold">
            {t.buscarEtiqueta}
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  lanzarBusqueda();
                }
              }}
              className={campo}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold">
            {t.anadirAlDia}
            <select value={destino} onChange={(e) => setDiaDestino(Number(e.target.value))} className={campo}>
              {dias.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={lanzarBusqueda}
            disabled={buscando}
            className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza disabled:opacity-60"
          >
            {t.buscar}
          </button>
        </div>
        {resultados && (
          <ul className="mt-3 flex flex-col gap-2" aria-live="polite">
            {resultados.length === 0 && <li className="text-sm text-acero">{t.sinResultados}</li>}
            {resultados.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  aria-label={t.anadir(r.name_es)}
                  onClick={() => {
                    setNombres((n) => ({ ...n, [r.id]: r.name_es }));
                    dispatch({ type: "addExercise", exercise_id: r.id, day_index: destino });
                  }}
                  className="w-full rounded-md border border-linea bg-papel px-3 py-2 text-left hover:bg-white"
                >
                  + {r.name_es}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-8">
        {dias.map((d) => {
          const lista = estado.exercises.filter((e) => e.day_index === d);
          return (
            <section key={d} aria-label={t.dia(d)}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-[1.7rem] font-bold">{t.dia(d)}</h2>
                {estado.days_per_week > 1 && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "removeDay", day_index: d })}
                    className={boton}
                  >
                    {t.quitarDia(d)}
                  </button>
                )}
              </div>
              {lista.length === 0 ? (
                <p className="mt-3 text-sm text-acero">{t.diaVacio}</p>
              ) : (
                <ul className="mt-3 flex flex-col divide-y divide-linea rounded-xl border border-linea bg-papel">
                  {lista.map((e) => {
                    const nombre = nombres[e.exercise_id] ?? `#${e.exercise_id}`;
                    const pos = e.position ?? 1;
                    return (
                      <li key={`${d}-${pos}`} className="flex flex-col gap-3 p-4">
                        <span className="font-bold">{nombre}</span>
                        <div className="flex flex-wrap items-end gap-3 text-sm">
                          <label className="flex flex-col gap-1 font-bold">
                            Series
                            <input
                              type="number"
                              aria-label={t.series(nombre)}
                              value={e.sets}
                              onChange={(ev) =>
                                dispatch({ type: "setSets", day_index: d, position: pos, sets: Number(ev.target.value) })
                              }
                              className={numero}
                            />
                          </label>
                          <label className="flex flex-col gap-1 font-bold">
                            Rep. mín.
                            <input
                              type="number"
                              aria-label={t.repsMin(nombre)}
                              value={e.reps_min}
                              onChange={(ev) =>
                                dispatch({
                                  type: "setReps",
                                  day_index: d,
                                  position: pos,
                                  reps_min: Number(ev.target.value),
                                  reps_max: e.reps_max,
                                })
                              }
                              className={numero}
                            />
                          </label>
                          <label className="flex flex-col gap-1 font-bold">
                            Rep. máx.
                            <input
                              type="number"
                              aria-label={t.repsMax(nombre)}
                              value={e.reps_max}
                              onChange={(ev) =>
                                dispatch({
                                  type: "setReps",
                                  day_index: d,
                                  position: pos,
                                  reps_min: e.reps_min,
                                  reps_max: Number(ev.target.value),
                                })
                              }
                              className={numero}
                            />
                          </label>
                          <label className="flex flex-col gap-1 font-bold">
                            Descanso (s)
                            <input
                              type="number"
                              aria-label={t.descanso(nombre)}
                              value={e.rest_seconds}
                              onChange={(ev) =>
                                dispatch({
                                  type: "setRest",
                                  day_index: d,
                                  position: pos,
                                  rest_seconds: Number(ev.target.value),
                                })
                              }
                              className={numero}
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            aria-label={t.subir(nombre)}
                            disabled={pos === 1}
                            onClick={() => dispatch({ type: "moveExercise", day_index: d, from: pos, to: pos - 1 })}
                            className={`${boton} disabled:opacity-40`}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label={t.bajar(nombre)}
                            disabled={pos === lista.length}
                            onClick={() => dispatch({ type: "moveExercise", day_index: d, from: pos, to: pos + 1 })}
                            className={`${boton} disabled:opacity-40`}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            aria-label={t.quitar(nombre)}
                            onClick={() => dispatch({ type: "removeExercise", day_index: d, position: pos })}
                            className={boton}
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
        {estado.days_per_week < 7 && (
          <button type="button" onClick={() => dispatch({ type: "addDay" })} className={`${boton} w-fit`}>
            {t.anadirDia}
          </button>
        )}
      </div>

      {errores.length > 0 && (
        <div role="alert" className="max-w-3xl rounded-md border-[1.5px] border-hierro bg-papel p-4 text-sm">
          <ul className="list-disc pl-5">
            {errores.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={enviar}
        disabled={guardando}
        className="h-11 w-fit rounded-md bg-hierro px-8 font-bold text-tiza disabled:opacity-60"
      >
        {guardando ? t.guardando : t.guardar}
      </button>
    </div>
  );
}
