"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { buscarRapido } from "@/app/[idioma]/buscar/actions";
import { useT } from "@/lib/i18n/cliente";
import { GRUPOS, type Resultado, type Resultados } from "@/lib/search/tipos";

const ESPERA_MS = 250;

// Buscador de la cabecera (patrón combobox): resultados de toda la web mientras se escribe,
// flechas para moverse, Enter para abrir y Escape para cerrar. Sin JavaScript es un formulario
// que lleva a /buscar.
export default function BuscadorGlobal({ alElegir, autoFocus = false }: { alElegir?: () => void; autoFocus?: boolean }) {
  const t = useT().buscador;
  const router = useRouter();
  const id = useId();
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<Resultados | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const [, empezar] = useTransition();
  const espera = useRef<number | undefined>(undefined);
  const ultima = useRef(0);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(espera.current), []);

  // Un clic fuera cierra la lista.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  function buscar(valor: string) {
    window.clearTimeout(espera.current);
    const n = ++ultima.current;
    setActivo(-1);
    if (valor.trim().length < 2) {
      setResultados(null);
      return;
    }
    espera.current = window.setTimeout(() => {
      empezar(async () => {
        const r = await buscarRapido(valor);
        if (n !== ultima.current) return; // una respuesta lenta no pisa a la nueva
        setResultados(r);
        setAbierto(true);
      });
    }, ESPERA_MS);
  }

  // Lista plana (en el orden en que se ven) para moverse con las flechas.
  const grupos = resultados ? GRUPOS.filter((g) => resultados[g].length > 0) : [];
  const plana: Resultado[] = grupos.flatMap((g) => resultados![g]);
  const idOpcion = (i: number) => `${id}-op-${i}`;

  function ir(href: string) {
    setAbierto(false);
    setTexto("");
    setResultados(null);
    alElegir?.();
    router.push(href);
  }

  function verTodos() {
    const q = texto.trim();
    if (q.length < 2) return;
    ir(`/buscar?q=${encodeURIComponent(q)}`);
  }

  function alPulsar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && plana.length) {
      e.preventDefault();
      setAbierto(true);
      setActivo((a) => (a + 1) % plana.length);
    } else if (e.key === "ArrowUp" && plana.length) {
      e.preventDefault();
      setActivo((a) => (a <= 0 ? plana.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setAbierto(false);
      setActivo(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (abierto && activo >= 0 && plana[activo]) ir(plana[activo].href);
      else verTodos();
    }
  }

  const mostrar = abierto && resultados !== null;
  let indice = -1;

  return (
    <div ref={caja} className="relative w-full">
      <form role="search" aria-label={t.etiqueta} action="/buscar" method="get" onSubmit={(e) => (e.preventDefault(), verTodos())}>
        <label htmlFor={`${id}-q`} className="sr-only">
          {t.etiqueta}
        </label>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-acero"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={`${id}-q`}
          name="q"
          type="search"
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={mostrar && activo >= 0 ? idOpcion(activo) : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={texto}
          placeholder={t.ejemplo}
          onChange={(e) => {
            setTexto(e.target.value);
            buscar(e.target.value);
          }}
          onFocus={() => resultados && setAbierto(true)}
          onKeyDown={alPulsar}
          className="h-10 w-full rounded-full border-[1.5px] border-linea bg-papel/80 pl-9 pr-4 text-sm focus:border-temple"
        />
      </form>

      {mostrar && (
        <div
          id={`${id}-lista`}
          role="listbox"
          aria-label={t.etiqueta}
          className="menu-entra absolute inset-x-0 top-full z-40 mt-2 max-h-[70vh] overflow-auto rounded-2xl border border-linea bg-papel p-2 shadow-lg"
        >
          {plana.length === 0 ? (
            <p className="p-3 text-sm text-acero">{t.sinResultados(texto.trim())}</p>
          ) : (
            grupos.map((g) => (
              <div key={g} role="group" aria-label={t.grupos[g]} className="py-1">
                <p aria-hidden="true" className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-acero">
                  {t.grupos[g]}
                </p>
                {resultados![g].map((r) => {
                  indice++;
                  const i = indice;
                  return (
                    <div
                      key={r.href}
                      id={idOpcion(i)}
                      role="option"
                      aria-selected={i === activo}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => ir(r.href)}
                      onMouseEnter={() => setActivo(i)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 aria-selected:bg-realce"
                    >
                      {r.imagen && <Image src={r.imagen} alt="" width={32} height={24} className="h-6 w-8 shrink-0 rounded object-cover" />}
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{r.titulo}</span>
                        {r.detalle && <span className="block truncate text-xs text-acero">{r.detalle}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={verTodos}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-azul underline hover:bg-realce"
          >
            {t.verTodos}
          </button>
        </div>
      )}
    </div>
  );
}
