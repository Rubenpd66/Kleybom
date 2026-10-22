import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { getT } from "@/lib/i18n/servidor";
import BuscadorGlobal from "./BuscadorGlobal";
import MenuLateral from "./MenuLateral";
import SelectorIdioma from "./SelectorIdioma";
import TemaToggle from "./TemaToggle";

// El menú lateral empieza por "Mi panel" si hay cookie de sesión de Supabase, o por "Entrar" si no.
// Solo mira si existe la cookie (sin llamar a Supabase); si la sesión caducó, /panel redirige a /entrar.
async function Menu() {
  const conSesion = (await cookies()).getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  return <MenuLateral conSesion={conSesion} />;
}

export default async function Header() {
  const es = await getT();
  return (
    <header className="sticky top-0 z-20 border-b border-linea bg-tiza/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 lg:px-10 2xl:px-16 items-center justify-between gap-6 px-6">
        {/* Solo el icono KB. Se dibuja con una máscara del logo y el color del texto: se ve en claro y en oscuro. */}
        <Link href="/" aria-label={es.nav.inicio} className="flex h-10 items-center">
          <span
            aria-hidden="true"
            className="block h-8 w-[43px] bg-hierro [mask:url(/logo.svg)_center/contain_no-repeat] hover:bg-temple-osc"
          />
        </Link>
        <div className="hidden max-w-md flex-1 md:block">
          <BuscadorGlobal />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <SelectorIdioma />
          <TemaToggle />
          <Suspense fallback={<MenuLateral />}>
            <Menu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
