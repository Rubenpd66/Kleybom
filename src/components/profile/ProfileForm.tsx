"use client";

import { useActionState } from "react";
import { guardarPerfil } from "@/app/[idioma]/panel/perfil/actions";
import { useT } from "@/lib/i18n/cliente";

const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

type Valores = { display_name: string | null; sex: string | null; birth_date: string | null; height_cm: number | null };

export default function ProfileForm({ valores }: { valores: Valores }) {
  const es = useT();
  const t = es.perfil;
  const [estado, enviar, pendiente] = useActionState(guardarPerfil, {});

  return (
    <form action={enviar} noValidate className="mt-6 flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.nombre}
        <input name="nombre" defaultValue={valores.display_name ?? ""} maxLength={60} className={campo} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.sexo}
        <select name="sexo" defaultValue={valores.sex ?? ""} className={campo}>
          <option value="">{t.sinIndicar}</option>
          <option value="mujer">{t.mujer}</option>
          <option value="hombre">{t.hombre}</option>
          <option value="otro">{t.otro}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.nacimiento}
        <input name="nacimiento" type="date" defaultValue={valores.birth_date ?? ""} className={campo} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.altura}
        <input name="altura" inputMode="decimal" defaultValue={valores.height_cm ?? ""} className={campo} />
      </label>

      {estado.error && (
        <p role="alert" className="rounded-md border-[1.5px] border-hierro bg-papel p-3 text-sm">
          {estado.error}
        </p>
      )}
      {estado.aviso && (
        <p role="status" className="rounded-md border-[1.5px] border-azul bg-papel p-3 text-sm">
          {estado.aviso}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza disabled:opacity-60"
      >
        {t.guardar}
      </button>
    </form>
  );
}
