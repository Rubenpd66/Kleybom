import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { es } from "@/lib/i18n/es";
import MobileNav from "./MobileNav";
import TemaToggle from "./TemaToggle";

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
    <header className="sticky top-0 z-20 border-b border-linea bg-tiza/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-6">
        {/* Solo el icono KB. Se dibuja con una máscara del logo y el color del texto: se ve en claro y en oscuro. */}
        <Link href="/" aria-label={es.nav.inicio} className="flex h-10 items-center">
          <span
            aria-hidden="true"
            className="block h-8 w-[43px] bg-hierro [mask:url(/logo.svg)_center/contain_no-repeat] hover:bg-temple-osc"
          />
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
        <div className="flex items-center gap-3">
          <TemaToggle />
          <Suspense fallback={<BotonCuenta conSesion={false} />}>
            <Cuenta />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
