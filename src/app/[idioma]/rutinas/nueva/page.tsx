import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import AvisoInvitado from "@/components/auth/AvisoInvitado";
import RoutineBuilder from "@/components/routines/RoutineBuilder";
import { getCurrentUser } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/servidor";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.constructor.titulo} — ${es.marca}`, robots: { index: false } };
}

// Sin cuenta se puede montar la rutina; al guardarla se pide entrar.
async function Aviso() {
  await connection();
  return (await getCurrentUser()) ? null : <AvisoInvitado ruta="/rutinas/nueva" />;
}

export default async function NuevaRutinaPage() {
  const es = await getT();
  const t = es.constructor;
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <Link href="/rutinas" className="text-sm font-bold text-azul underline">
        {es.rutinas.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {t.titulo}
      </h1>
      <Suspense>
        <Aviso />
      </Suspense>
      <RoutineBuilder />
    </main>
  );
}
