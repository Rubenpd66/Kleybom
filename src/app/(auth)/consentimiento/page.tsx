import type { Metadata } from "next";
import { Suspense } from "react";
import ConsentForm from "@/components/auth/ConsentForm";
import { es } from "@/lib/i18n/es";

export const metadata: Metadata = { title: `${es.auth.consentimientoTitulo} — ${es.marca}`, robots: { index: false } };

// Solo llega aquí quien entra por primera vez con Google (lo manda el proxy).
export default function ConsentimientoPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{es.auth.consentimientoTitulo}</h1>
      <p className="mt-4 max-w-[62ch] text-acero">{es.auth.consentimientoTexto}</p>
      {/* El formulario lee ?volver= de la URL */}
      <Suspense>
        <ConsentForm />
      </Suspense>
    </main>
  );
}
