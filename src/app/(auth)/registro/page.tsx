import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { es } from "@/lib/i18n/es";
import { registrar } from "../actions";

export const metadata: Metadata = { title: `${es.auth.crearCuenta} — ${es.marca}` };

export default function RegistroPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {es.auth.crearCuenta}
      </h1>
      <AuthForm modo="registro" action={registrar} />
    </main>
  );
}
