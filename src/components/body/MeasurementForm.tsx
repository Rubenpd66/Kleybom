"use client";

import { useActionState } from "react";
import { guardarMedidas } from "@/app/[idioma]/panel/medidas/actions";
import { useT } from "@/lib/i18n/cliente";

const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

export type ValoresMedida = { fecha: string; peso: string; cintura: string; cadera: string; pecho: string };

export default function MeasurementForm({ valores, titulo }: { valores: ValoresMedida; titulo: string }) {
  const es = useT();
  const t = es.medidas;
  const [estado, enviar, pendiente] = useActionState(guardarMedidas, {});
  return (
    <form action={enviar} noValidate key={valores.fecha} className="flex flex-col gap-4 rounded-xl border-[1.5px] border-hierro bg-papel p-5">
      <h2 className="font-display text-[1.7rem] font-bold">{titulo}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">
          {t.fecha}
          <input name="fecha" type="date" defaultValue={valores.fecha} className={campo} />
        </label>
        {(
          [
            ["peso", t.peso],
            ["cintura", t.cintura],
            ["cadera", t.cadera],
            ["pecho", t.pecho],
          ] as const
        ).map(([nombre, etiqueta]) => (
          <label key={nombre} className="flex flex-col gap-1 text-sm font-bold">
            {etiqueta}
            <input name={nombre} inputMode="decimal" defaultValue={valores[nombre]} className={campo} />
          </label>
        ))}
      </div>
      <p className="text-sm text-acero">{t.ayuda}</p>
      {estado.errores && (
        <ul role="alert" className="list-disc rounded-md border-[1.5px] border-hierro p-3 pl-7 text-sm">
          {estado.errores.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      {estado.aviso && (
        <p role="status" className="text-sm font-bold">
          {estado.aviso}
        </p>
      )}
      <button type="submit" disabled={pendiente} className="h-11 w-fit rounded-md bg-hierro px-6 font-bold text-tiza disabled:opacity-60">
        {t.guardar}
      </button>
    </form>
  );
}
