"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { EstadoForm } from "@/app/(auth)/actions";
import { es } from "@/lib/i18n/es";

const t = es.auth;
const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

export default function AuthForm({
  modo,
  action,
}: {
  modo: "entrar" | "registro";
  action: (estado: EstadoForm, datos: FormData) => Promise<EstadoForm>;
}) {
  const [estado, enviar, pendiente] = useActionState(action, {});
  const registro = modo === "registro";

  return (
    <form action={enviar} noValidate className="mt-8 flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.correo}
        <input name="correo" type="email" autoComplete="email" required className={campo} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        {t.contrasena}
        <input
          name="contrasena"
          type="password"
          autoComplete={registro ? "new-password" : "current-password"}
          required
          className={campo}
        />
        {registro && <span className="text-xs font-normal text-acero">{t.ayudaContrasena}</span>}
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

      {registro && (
        <p className="text-xs text-acero">
          {t.privacidadAntes}{" "}
          <Link href="/privacidad" className="text-azul underline">
            {t.privacidadEnlace}
          </Link>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza disabled:opacity-60"
      >
        {registro ? t.crearCuenta : t.entrar}
      </button>

      <p className="text-sm">
        {registro ? t.yaTienes : t.noTienes}{" "}
        <Link href={registro ? "/entrar" : "/registro"} className="font-bold text-azul underline">
          {registro ? t.entrar : t.crearCuenta}
        </Link>
      </p>
    </form>
  );
}
