"use client";

import { useActionState, useId, useState } from "react";
import { planificarSesion } from "@/app/[idioma]/calendario/actions";
import type { OpcionRutina } from "@/lib/calendar/queries";
import { useT } from "@/lib/i18n/cliente";
const campo =
  "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

// Formulario para planificar una sesión en el día elegido (sin ventana modal: funciona igual en móvil).
export default function PlanSessionDialog({
  fecha,
  rutinas,
}: {
  fecha: string;
  rutinas: OpcionRutina[];
}) {
  const es = useT();
  const t = es.calendario;
  const [estado, enviar, pendiente] = useActionState(planificarSesion, {});
  const [rutina, setRutina] = useState("");
  const id = useId();
  const dias = rutinas.find((r) => String(r.id) === rutina)?.days_per_week ?? 0;

  return (
    <form action={enviar} noValidate className="flex flex-col gap-4">
      <h2 className="font-display text-[1.7rem] font-bold">
        {t.planificarTitulo}
      </h2>
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.fecha}
        <input
          key={fecha}
          name="fecha"
          type="date"
          defaultValue={fecha}
          className={campo}
        />
      </label>
      <div className="flex flex-col gap-1 text-sm font-bold">
        <label htmlFor={`${id}-rutina`}>{t.rutina}</label>
        <select
          id={`${id}-rutina`}
          name="rutina"
          value={rutina}
          onChange={(e) => setRutina(e.target.value)}
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
      <div className="flex flex-col gap-1 text-sm font-bold">
        <label htmlFor={`${id}-dia`}>{t.diaRutina}</label>
        <select
          id={`${id}-dia`}
          name="dia"
          disabled={!dias}
          defaultValue=""
          className={`${campo} disabled:opacity-50`}
        >
          <option value="">{t.cualquierDia}</option>
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
