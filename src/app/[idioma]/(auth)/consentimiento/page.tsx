import type { Metadata } from "next";
import { Suspense } from "react";
import ConsentForm from "@/components/auth/ConsentForm";
import { getT } from "@/lib/i18n/servidor";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.auth.consentimientoTitulo} — ${es.marca}`, robots: { index: false } };
}

// Solo llega aquí quien entra por primera vez con Google (lo manda el proxy).
export default async function ConsentimientoPage() {
  const es = await getT();
  return (
    <main className="mx-auto w-full max-w-[1520px] lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{es.auth.consentimientoTitulo}</h1>
      <p className="mt-4 max-w-[62ch] text-acero">{es.auth.consentimientoTexto}</p>
      {/* El formulario lee ?volver= de la URL */}
      <Suspense>
        <ConsentForm />
      </Suspense>
    </main>
  );
}
