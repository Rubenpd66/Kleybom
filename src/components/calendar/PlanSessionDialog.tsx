"use client";

import { useActionState, useId, useState } from "react";
import { planificarSesion } from "@/app/[idioma]/calendario/actions";
import { planDeRutina, REPETIR, type Repetir } from "@/lib/calendar/plan";
import type { OpcionRutina } from "@/lib/calendar/queries";
import { esClaveDeDia } from "@/lib/calendar/validate";
import { LOCALE } from "@/lib/i18n";
import { useIdioma, useT } from "@/lib/i18n/cliente";
const campo =
  "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

// Formulario para planificar una sesión en el día elegido (sin ventana modal: funciona igual en móvil).
// Con una rutina, por defecto apunta todos sus días hasta final de mes, con los descansos repartidos
// (3 días → lunes, miércoles y viernes si se empieza en lunes). Debajo se ve qué días se apuntarán.
export default function PlanSessionDialog({
  fecha,
  rutinas,
}: {
  fecha: string;
  rutinas: OpcionRutina[];
}) {
  const es = useT();
  const idioma = useIdioma();
  const t = es.calendario;
  const [estado, enviar, pendiente] = useActionState(planificarSesion, {});
  const [dia, setDia] = useState(fecha);
  const [rutina, setRutina] = useState("");
  const [repetir, setRepetir] = useState<Repetir>("mes");
  const [diaRutina, setDiaRutina] = useState("");
  const id = useId();
  const dias = rutinas.find((r) => String(r.id) === rutina)?.days_per_week ?? 0;
  const repite = dias > 0 && repetir !== "dia";

  // Vista previa: cuántas sesiones y qué días de la semana (los de la primera semana del plan).
  const plan = repite && esClaveDeDia(dia) ? planDeRutina(dia, dias, repetir, Number(diaRutina) || 1) : [];
  const nombresDias = plan.slice(0, dias).map((p) => t.diasSemanaLargos[(new Date(`${p.fecha}T00:00:00Z`).getUTCDay() + 6) % 7].toLowerCase());
  const resumen = plan.length > 0 ? t.resumenPlan(plan.length, new Intl.ListFormat(LOCALE[idioma], { type: "conjunction" }).format(nombresDias)) : null;

  return (
    <form action={enviar} noValidate className="flex flex-col gap-4">
      <h2 className="font-display text-[1.7rem] font-bold">
        {t.planificarTitulo}
      </h2>
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.fecha}
        <input
          name="fecha"
          type="date"
          value={dia}
          onChange={(e) => setDia(e.target.value)}
          className={campo}
        />
      </label>
      <div className="flex flex-col gap-1 text-sm font-bold">
        <label htmlFor={`${id}-rutina`}>{t.rutina}</label>
        <select
          id={`${id}-rutina`}
          name="rutina"
          value={rutina}
          onChange={(e) => {
            setRutina(e.target.value);
            setDiaRutina("");
          }}
          className={campo}
        >
          <option value="">{t.sinRutina}</option>
          {rutinas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      {dias > 0 && (
        <div className="flex flex-col gap-1 text-sm font-bold">
          <label htmlFor={`${id}-repetir`}>{t.repetir}</label>
          <select
            id={`${id}-repetir`}
            name="repetir"
            value={repetir}
            onChange={(e) => setRepetir(e.target.value as Repetir)}
            className={campo}
          >
            {REPETIR.map((r) => (
              <option key={r} value={r}>
                {t.repetirOpciones[r]}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-col gap-1 text-sm font-bold">
        <label htmlFor={`${id}-dia`}>{repite ? t.diaInicio : t.diaRutina}</label>
        <select
          id={`${id}-dia`}
          name="dia"
          disabled={!dias}
          value={repite ? diaRutina || "1" : diaRutina}
          onChange={(e) => setDiaRutina(e.target.value)}
          className={`${campo} disabled:opacity-50`}
        >
          {!repite && <option value="">{t.cualquierDia}</option>}
          {Array.from({ length: dias }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {es.rutinas.dia(i + 1)}
            </option>
          ))}
        </select>
      </div>
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.nota}
        <input name="nota" maxLength={300} className={campo} />
      </label>
      {resumen && (
        <p aria-live="polite" className="rounded-md border border-linea bg-realce p-3 text-sm">
          {resumen}
        </p>
      )}
      {estado.error && (
        <p
          role="alert"
          className="rounded-md border-[1.5px] border-hierro bg-papel p-3 text-sm"
        >
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza disabled:opacity-60"
      >
        {t.planificar}
      </button>
    </form>
  );
}
