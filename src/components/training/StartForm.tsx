"use client";

import { useActionState, useId, useState } from "react";
import { empezarConRutina } from "@/app/[idioma]/entreno/actions";
import type { OpcionRutina } from "@/lib/calendar/queries";
import { useT } from "@/lib/i18n/cliente";

const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

export default function StartForm({ rutinas }: { rutinas: OpcionRutina[] }) {
  const es = useT();
  const t = es.entreno;
  const id = useId();
  const [estado, enviar, pendiente] = useActionState(empezarConRutina, {});
  const [rutina, setRutina] = useState(rutinas[0] ? String(rutinas[0].id) : "");
  const dias = rutinas.find((r) => String(r.id) === rutina)?.days_per_week ?? 1;

  return (
    <form action={enviar} className="mt-3 grid max-w-xl gap-3 sm:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-1 text-sm font-bold">
        <label htmlFor={`${id}-rutina`}>{t.rutina}</label>
        <select id={`${id}-rutina`} name="rutina" value={rutina} onChange={(e) => setRutina(e.target.value)} className={campo}>
          {rutinas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1 text-sm font-bold">
        <label htmlFor={`${id}-dia`}>{t.dia}</label>
        <select id={`${id}-dia`} name="dia" key={rutina} defaultValue="1" className={campo}>
          {Array.from({ length: dias }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {es.rutinas.dia(i + 1)}
            </option>
          ))}
        </select>
      </div>
      {estado.error && (
        <p role="alert" className="text-sm sm:col-span-2">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente || !rutina}
        className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        {t.empezarEntreno}
      </button>
    </form>
  );
}
