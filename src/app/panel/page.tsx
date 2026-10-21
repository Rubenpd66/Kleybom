import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { salir } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { es } from "@/lib/i18n/es";

export const metadata: Metadata = { title: `${es.auth.panel} — ${es.marca}`, robots: { index: false } };

async function Contenido() {
  await connection();
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/entrar");
  return (
    <>
      <p className="mt-3 text-acero">
        {es.auth.sesionComo} <strong>{usuario.email}</strong>
      </p>
      <p className="mt-6">
        <Link href="/panel/rutinas" className="font-bold text-azul underline">
          {es.misRutinas.enlace}
        </Link>
      </p>
      <p className="mt-3">
        <Link href="/panel/medidas" className="font-bold text-azul underline">
          {es.medidas.enlace}
        </Link>
      </p>
      <p className="mt-3">
        <Link href="/panel/perfil" className="font-bold text-azul underline">
          {es.perfil.enlace}
        </Link>
      </p>
      <form action={salir} className="mt-6">
        <button type="submit" className="h-11 rounded-md border-[1.5px] border-hierro px-6 font-bold">
          {es.auth.salir}
        </button>
      </form>
    </>
  );
}

export default function PanelPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {es.auth.panel}
      </h1>
      <Suspense fallback={<p className="mt-3 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}
