import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { es } from "@/lib/i18n/es";
import { entrar } from "../actions";

export const metadata: Metadata = { title: `${es.auth.entrar} — ${es.marca}` };

export default function EntrarPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {es.auth.entrar}
      </h1>
      {/* El formulario lee ?volver= de la URL */}
      <Suspense>
        <AuthForm modo="entrar" action={entrar} />
      </Suspense>
    </main>
  );
}
