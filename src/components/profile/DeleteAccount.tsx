"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/cliente";


// Formulario normal (POST) a la ruta de borrado. El servidor vuelve a comprobar la palabra.
export default function DeleteAccount() {
  const es = useT();
  const t = es.perfil;
  const [texto, setTexto] = useState("");

  return (
    <form
      method="post"
      action="/api/cuenta/borrar"
      className="mt-4 flex max-w-sm flex-col gap-4 rounded-xl border-[1.5px] border-hierro p-4"
    >
      <p className="text-sm">{t.borrarAviso}</p>
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.borrarEtiqueta}
        <input
          name="confirmacion"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoComplete="off"
          className="h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal"
        />
      </label>
      <button
        type="submit"
        disabled={texto !== t.palabraBorrar}
        className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza disabled:opacity-40"
      >
        {t.borrarBoton}
      </button>
    </form>
  );
}
