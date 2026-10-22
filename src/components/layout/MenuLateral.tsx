"use client";

import Link from "@/components/ui/Link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/lib/i18n/cliente";
import { sinIdioma } from "@/lib/i18n/ruta";
import BuscadorGlobal from "./BuscadorGlobal";

// Retrasos para que el menú no se abra ni se cierre por un roce del ratón.
const ABRIR_MS = 150;
const CERRAR_MS = 350;
// Anchura mínima (px) de la zona del borde derecho que abre el menú al acercar el ratón.
const ZONA_PX = 40;
// Encima de estos elementos no se abre: así se puede pulsar lo que haya dentro de la zona.
const CONTROLES = "a, button, input, select, textarea, label, [role='button']";

// Menú lateral derecho con "Mi panel" (o "Entrar") y todas las secciones, en vertical.
// Se abre con el botón o, con ratón, al acercarlo al borde derecho de la pantalla; Escape lo cierra.
export default function MenuLateral({ conSesion = false }: { conSesion?: boolean }) {
  const es = useT();
  const t = es.nav;
  const ruta = sinIdioma(usePathname());
  const [abierto, setAbierto] = useState(false);
  const [porRaton, setPorRaton] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const primero = useRef<HTMLAnchorElement>(null);
  const reloj = useRef<number | undefined>(undefined);
  // El panel se pinta en <body> (portal): dentro de la cabecera, su desenfoque (backdrop-filter)
  // haría que "fixed" se midiera respecto a la cabecera y no a la pantalla.
  const enNavegador = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const abrir = (raton: boolean) => {
    window.clearTimeout(reloj.current);
    setPorRaton(raton);
    setAbierto(true);
  };
  const cerrar = (devolverFoco = false) => {
    window.clearTimeout(reloj.current);
    setAbierto(false);
    if (devolverFoco) boton.current?.focus();
  };

  // Abierto con el botón (teclado o toque): el foco entra en el menú.
  useEffect(() => {
    if (abierto && !porRaton) primero.current?.focus();
  }, [abierto, porRaton]);

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar(true);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  // Con ratón (pantallas medianas o más), llevarlo a la franja derecha abre el menú: desde el borde
  // izquierdo del botón «Menú» hasta el final de la pantalla (40 px como mínimo), salvo encima de un
  // enlace o un botón. Se escucha en todo el documento, sin franja invisible: así no tapa nada.
  useEffect(() => {
    if (abierto || !window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches) return;
    let esperando = false;
    const alMover = (e: MouseEvent) => {
      const borde = Math.min(boton.current?.getBoundingClientRect().left ?? Infinity, document.documentElement.clientWidth - ZONA_PX);
      const control = e.target instanceof Element ? e.target.closest(CONTROLES) : null;
      const sobreControl = control !== null && !boton.current?.contains(control);
      const cerca = e.clientX >= borde && !sobreControl;
      if (cerca && !esperando) {
        esperando = true;
        reloj.current = window.setTimeout(() => abrir(true), ABRIR_MS);
      } else if (!cerca && esperando) {
        esperando = false;
        window.clearTimeout(reloj.current);
      }
    };
    document.addEventListener("mousemove", alMover);
    return () => document.removeEventListener("mousemove", alMover);
  }, [abierto]);

  useEffect(() => () => window.clearTimeout(reloj.current), []);

  const enlaces = [{ href: conSesion ? "/panel" : "/entrar", label: conSesion ? t.miPanel : t.entrar }, ...t.secciones];

  return (
    <>
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls="menu-lateral"
        aria-label={t.abrirMenu}
        onClick={() => (abierto ? cerrar() : abrir(false))}
        // Con ratón, basta con pasar por encima del botón para que el menú se deslice.
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse" || abierto) return;
          window.clearTimeout(reloj.current);
          reloj.current = window.setTimeout(() => abrir(true), ABRIR_MS);
        }}
        onPointerLeave={(e) => e.pointerType === "mouse" && !abierto && window.clearTimeout(reloj.current)}
        className="flex h-10 items-center gap-2 rounded-full border-[1.5px] border-hierro px-3 font-bold hover:border-temple"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="hidden sm:inline">{t.menu}</span>
      </button>

      {enNavegador &&
        createPortal(
          <>
            {/* Pista en el borde derecho: con ratón, acercarse ahí abre el menú. */}
            <span
              aria-hidden="true"
              className="pointer-events-none fixed right-1 top-1/2 z-30 hidden h-16 w-1 -translate-y-1/2 rounded-full bg-acero/40 [@media(hover:hover)_and_(pointer:fine)]:md:block"
            />

            {/* Fondo: un clic fuera cierra; si se abrió con el ratón, basta con alejarlo. */}
            <div
              aria-hidden="true"
              onClick={() => cerrar()}
              onMouseMove={() => {
                if (!porRaton || !abierto) return;
                window.clearTimeout(reloj.current);
                reloj.current = window.setTimeout(() => cerrar(), CERRAR_MS);
              }}
              className={`fixed inset-0 z-30 bg-tinta/30 transition-opacity duration-200 ${abierto ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />

            <nav
              id="menu-lateral"
              aria-label={t.menu}
              inert={!abierto}
              onMouseEnter={() => window.clearTimeout(reloj.current)}
              onMouseLeave={() => {
                if (!porRaton) return;
                reloj.current = window.setTimeout(() => cerrar(), CERRAR_MS);
              }}
              className={`fixed inset-y-0 right-0 z-40 flex w-[min(20rem,85vw)] flex-col gap-4 overflow-y-auto border-l border-linea bg-papel p-5 shadow-2xl transition-transform duration-300 ease-[var(--ease-out)] ${
                abierto ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-bold">{t.menu}</span>
                <button
                  type="button"
                  onClick={() => cerrar(true)}
                  aria-label={t.cerrarMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-linea hover:border-hierro"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              {/* En pantallas pequeñas el buscador vive aquí (en la cabecera no cabe). */}
              <div className="md:hidden">
                <BuscadorGlobal alElegir={() => cerrar()} />
              </div>

              <ul className="flex flex-col">
                {enlaces.map((e, i) => {
                  const actual = ruta === e.href;
                  return (
                    <li key={e.href}>
                      <Link
                        ref={i === 0 ? primero : undefined}
                        href={e.href}
                        aria-current={actual ? "page" : undefined}
                        onClick={() => cerrar()}
                        className={`block rounded-lg px-3 py-2.5 font-medium hover:bg-realce aria-[current=page]:text-temple-osc ${
                          i === 0 ? "mb-2 border-[1.5px] border-hierro text-center font-bold" : ""
                        }`}
                      >
                        {e.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </>,
          document.body,
        )}
    </>
  );
}
