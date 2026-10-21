import Link from "next/link";
import { es } from "@/lib/i18n/es";
import MobileNav from "./MobileNav";

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
        <Link
          href="/entrar"
          className="hidden rounded-md border-[1.5px] border-hierro px-4 py-2 font-bold md:inline-block"
        >
          {es.nav.entrar}
        </Link>
        <MobileNav />
      </div>
    </header>
  );
}
