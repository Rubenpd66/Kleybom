"use client";

import Link from "@/components/ui/Link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { aceptarConsentimientos } from "@/app/[idioma]/(auth)/actions";
import { useT } from "@/lib/i18n/cliente";


export default function ConsentForm() {
  const es = useT();
  const t = es.auth;
  const [estado, enviar, pendiente] = useActionState(aceptarConsentimientos, {});
  const volver = useSearchParams().get("volver") ?? "";

  return (
    <div className="mt-8 flex max-w-sm flex-col gap-6">
      <form action={enviar} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="volver" value={volver} />
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
        {estado.error && (
          <p role="alert" className="rounded-md border-[1.5px] border-hierro bg-papel p-3 text-sm">
            {estado.error}
          </p>
        )}
        <button type="submit" disabled={pendiente} className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza disabled:opacity-60">
          {t.aceptar}
        </button>
      </form>
      {/* Sin consentimiento no se puede usar la cuenta: se ofrece borrarla al momento. */}
      <form action="/api/cuenta/borrar" method="post">
        <input type="hidden" name="confirmacion" value={es.perfil.palabraBorrar} />
        <button type="submit" className="text-sm font-bold text-azul underline">
          {t.noAcepto}
        </button>
      </form>
    </div>
  );
}
