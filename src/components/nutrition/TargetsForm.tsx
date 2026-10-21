"use client";

import { useId, useState, useTransition } from "react";
import { guardarObjetivos, type EstadoObjetivos } from "@/app/nutricion/objetivos/actions";
import { es } from "@/lib/i18n/es";
import {
  computeTargets,
  MINIMO_KCAL,
  RANGOS,
  type Actividad,
  type Objetivo,
  type Sexo,
} from "@/lib/nutrition/targets";

const t = es.objetivos;
const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

const aNumero = (s: string) => (s.trim() === "" ? Number.NaN : Number(s.replace(",", ".")));

export type ValoresIniciales = { sex: Sexo | ""; age: string; height_cm: string; weight_kg: string };

export default function TargetsForm({ iniciales }: { iniciales: ValoresIniciales }) {
  const id = useId();
  const [sex, setSex] = useState<Sexo | "">(iniciales.sex);
  const [age, setAge] = useState(iniciales.age);
  const [height, setHeight] = useState(iniciales.height_cm);
  const [weight, setWeight] = useState(iniciales.weight_kg);
  const [activity, setActivity] = useState<Actividad>("ligero");
  const [goal, setGoal] = useState<Objetivo>("mantener");
  const [estado, setEstado] = useState<EstadoObjetivos>({});
  const [guardando, guardar] = useTransition();

  const numeros = { age: aNumero(age), height_cm: aNumero(height), weight_kg: aNumero(weight) };
  const completo = sex !== "" && age.trim() !== "" && height.trim() !== "" && weight.trim() !== "";

  // Primer dato fuera de rango (mensaje concreto); si todo está bien, el cálculo.
  let error: string | null = null;
  if (completo) {
    for (const k of ["age", "height_cm", "weight_kg"] as const) {
      const [min, max] = RANGOS[k];
      const v = numeros[k];
      if (!Number.isFinite(v) || v < min || v > max) {
        error = t.errores[k];
        break;
      }
    }
  }
  const resultado = completo && !error ? computeTargets({ sex: sex as Sexo, ...numeros, activity, goal }) : null;

  function enviar() {
    if (!resultado) return;
    guardar(async () => setEstado(await guardarObjetivos({ sex: sex as Sexo, ...numeros, activity, goal })));
  }

  const etiqueta = "flex flex-col gap-1 text-sm font-bold";
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={etiqueta}>
          <label htmlFor={`${id}-sexo`}>{t.sexo}</label>
          <select id={`${id}-sexo`} value={sex} onChange={(e) => setSex(e.target.value as Sexo | "")} className={campo}>
            <option value="">{t.elegir}</option>
            <option value="mujer">{t.sexos.mujer}</option>
            <option value="hombre">{t.sexos.hombre}</option>
          </select>
        </div>
        <label className={etiqueta}>
          {t.edad}
          <input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} className={campo} />
        </label>
        <label className={etiqueta}>
          {t.altura}
          <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} className={campo} />
        </label>
        <label className={etiqueta}>
          {t.peso}
          <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className={campo} />
        </label>
        <div className={`${etiqueta} sm:col-span-2`}>
          <label htmlFor={`${id}-actividad`}>{t.actividad}</label>
          <select
            id={`${id}-actividad`}
            value={activity}
            onChange={(e) => setActivity(e.target.value as Actividad)}
            className={campo}
          >
            {Object.entries(t.actividades).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className={`${etiqueta} sm:col-span-2`}>
          <label htmlFor={`${id}-objetivo`}>{t.objetivo}</label>
          <select
            id={`${id}-objetivo`}
            value={goal}
            onChange={(e) => setGoal(e.target.value as Objetivo)}
            className={campo}
          >
            {Object.entries(t.objetivosOpciones).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section aria-labelledby={`${id}-estimacion`} className="rounded-xl border-[1.5px] border-hierro bg-papel p-5">
        <h2 id={`${id}-estimacion`} className="font-display text-[1.7rem] font-bold">
          {t.estimacion}
        </h2>
        {error && (
          <p role="alert" className="mt-3 rounded-md border-[1.5px] border-hierro p-3 text-sm">
            {error}
          </p>
        )}
        {!resultado && !error && <p className="mt-3 text-sm text-acero">{t.rellena}</p>}
        {resultado && (
          <>
            <p className="mt-3 font-display text-4xl font-extrabold">
              {resultado.kcal} kcal <span className="text-base font-normal text-acero">{t.porDia}</span>
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-acero">{t.proteinas}</dt>
                <dd className="text-lg font-bold">{resultado.protein_g} g</dd>
              </div>
              <div>
                <dt className="text-acero">{t.hidratos}</dt>
                <dd className="text-lg font-bold">{resultado.carbs_g} g</dd>
              </div>
              <div>
                <dt className="text-acero">{t.grasas}</dt>
                <dd className="text-lg font-bold">{resultado.fat_g} g</dd>
              </div>
            </dl>
            {resultado.floorApplied && (
              <p className="mt-4 rounded-md bg-temple p-3 text-sm text-tinta">{t.minimo(MINIMO_KCAL[sex as Sexo])}</p>
            )}
          </>
        )}
        {estado.error && (
          <p role="alert" className="mt-4 text-sm">
            {estado.error}
          </p>
        )}
        {estado.aviso && (
          <p role="status" className="mt-4 text-sm font-bold">
            {estado.aviso}
          </p>
        )}
        <button
          type="button"
          onClick={enviar}
          disabled={!resultado || guardando}
          className="mt-5 h-11 rounded-md bg-hierro px-6 font-bold text-tiza disabled:opacity-40"
        >
          {t.guardar}
        </button>
      </section>
    </div>
  );
}
