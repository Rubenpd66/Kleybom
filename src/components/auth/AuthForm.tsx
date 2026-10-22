"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import type { EstadoForm } from "@/app/[idioma]/(auth)/actions";
import { useT } from "@/lib/i18n/cliente";
import BotonGoogle from "./BotonGoogle";

const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

export default function AuthForm({
  modo,
  action,
}: {
  modo: "entrar" | "registro";
  action: (estado: EstadoForm, datos: FormData) => Promise<EstadoForm>;
}) {
  const t = useT().auth;
  const [estado, enviar, pendiente] = useActionState(action, {});
  const registro = modo === "registro";
  // Página desde la que se vino (p. ej. el calendario): el servidor solo acepta rutas internas.
  const parametros = useSearchParams();
  const volver = parametros.get("volver") ?? "";
  const errorGoogle = parametros.get("error") === "google";
  const conVolver = volver ? `?volver=${encodeURIComponent(volver)}` : "";

  return (
    <div className="mt-8 flex max-w-sm flex-col gap-4">
      {errorGoogle && (
        <p role="alert" className="rounded-md border-[1.5px] border-hierro bg-papel p-3 text-sm">
          {t.errorGoogle}
        </p>
      )}
      <BotonGoogle volver={volver} />
      <form action={enviar} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="volver" value={volver} />
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t.correo}
          <input name="correo" type="email" autoComplete="email" required defaultValue={estado.valores?.correo} className={campo} />
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
          <fieldset className="flex flex-col gap-3 text-sm">
            <legend className="mb-2 font-bold">{t.consentimientos}</legend>
            <label className="flex gap-3">
              <input name="privacidad" type="checkbox" value="si" required defaultChecked={estado.valores?.privacidad} className="mt-0.5 h-5 w-5 shrink-0 accent-hierro" />
              <span>
                {t.privacidadAntes}{" "}
                <Link href="/privacidad" className="text-azul underline" target="_blank">
                  {t.privacidadEnlace}
                </Link>{" "}
                {t.privacidadDespues}
              </span>
            </label>
            <label className="flex gap-3">
              <input name="salud" type="checkbox" value="si" required defaultChecked={estado.valores?.salud} className="mt-0.5 h-5 w-5 shrink-0 accent-hierro" />
              <span>{t.consentimientoSalud}</span>
            </label>
          </fieldset>
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
          <Link href={`${registro ? "/entrar" : "/registro"}${conVolver}`} className="font-bold text-azul underline">
            {registro ? t.entrar : t.crearCuenta}
          </Link>
        </p>
      </form>
    </div>
  );
}
