"use client";

import Link from "next/link";
import { useState } from "react";
import { es } from "@/lib/i18n/es";

export default function MobileNav({ conSesion = false }: { conSesion?: boolean }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls="menu-movil"
        onClick={() => setAbierto((v) => !v)}
        className="h-10 rounded-md border-[1.5px] border-hierro px-3 text-sm font-bold"
      >
        {abierto ? es.nav.cerrarMenu : es.nav.abrirMenu}
      </button>
      {abierto && (
        <nav
          id="menu-movil"
          aria-label={es.nav.etiqueta}
          className="absolute inset-x-0 top-full border-b border-linea bg-tiza"
        >
          <ul className="mx-auto flex max-w-[1180px] flex-col px-6 py-2">
            {es.nav.enlaces.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  onClick={() => setAbierto(false)}
                  className="block py-3 text-lg font-medium"
                >
                  {e.label}
                </Link>
              </li>
            ))}
            <li className="py-3">
              <Link
                href={conSesion ? "/panel" : "/entrar"}
                onClick={() => setAbierto(false)}
                className="inline-block rounded-md border-[1.5px] border-hierro px-4 py-2 font-bold"
              >
                {conSesion ? es.nav.miPanel : es.nav.entrar}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
