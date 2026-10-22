import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { getT } from "@/lib/i18n/servidor";
import { entrar } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.auth.entrar} — ${es.marca}` };
}

export default async function EntrarPage() {
  const es = await getT();
  return (
    <main className="mx-auto w-full max-w-[1520px] lg:px-10 2xl:px-16 flex-1 px-6 py-12">
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
