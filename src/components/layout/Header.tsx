import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { es } from "@/lib/i18n/es";
import MobileNav from "./MobileNav";

// Botón de cuenta: "Mi panel" si hay cookie de sesión de Supabase, "Entrar" si no.
// Solo mira si existe la cookie (sin llamar a Supabase); si la sesión caducó, /panel redirige a /entrar.
function BotonCuenta({ conSesion }: { conSesion: boolean }) {
  return (
    <>
      <Link
        href={conSesion ? "/panel" : "/entrar"}
        className="hidden rounded-md border-[1.5px] border-hierro px-4 py-2 font-bold md:inline-block"
      >
        {conSesion ? es.nav.miPanel : es.nav.entrar}
      </Link>
      <MobileNav conSesion={conSesion} />
    </>
  );
}

async function Cuenta() {
  const conSesion = (await cookies()).getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  return <BotonCuenta conSesion={conSesion} />;
}

export default function Header() {
  return (
    <header className="relative border-b border-linea bg-tiza">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="font-display text-[2rem] font-extrabold leading-none tracking-[.02em]"
        >
          {es.marca}
          <span className="text-temple-osc">.</span>
        </Link>
        <nav aria-label={es.nav.etiqueta} className="hidden md:block">
          <ul className="flex gap-6">
            {es.nav.enlaces.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="font-medium hover:underline">
                  {e.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Suspense fallback={<BotonCuenta conSesion={false} />}>
          <Cuenta />
        </Suspense>
      </div>
    </header>
  );
}
