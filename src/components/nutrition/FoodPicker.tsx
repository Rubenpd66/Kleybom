"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { anadirEntrada, buscarAlimentos, type AlimentoEncontrado } from "@/app/nutricion/actions";
import { formatNutriente } from "@/lib/foods/format";
import { es } from "@/lib/i18n/es";
import { MEALS, type Meal } from "@/lib/nutrition/diary";

const t = es.diario;
const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

export default function FoodPicker({ fecha }: { fecha: string }) {
  const id = useId();
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<AlimentoEncontrado[] | null>(null);
  const [meal, setMeal] = useState<Meal>("comida");
  const [gramos, setGramos] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  // Búsqueda en vivo: 300 ms después de la última tecla, desde 2 letras. Solo vale la respuesta
  // de la última búsqueda (una respuesta lenta de antes no pisa a la nueva).
  const espera = useRef<number | undefined>(undefined);
  const ultima = useRef(0);
  useEffect(() => () => window.clearTimeout(espera.current), []);
  function buscar(valor: string) {
    window.clearTimeout(espera.current);
    const n = ++ultima.current;
    if (valor.trim().length < 2) {
      setResultados(null);
      return;
    }
    espera.current = window.setTimeout(() => {
      empezar(async () => {
        const r = await buscarAlimentos(valor);
        if (n === ultima.current) setResultados(r);
      });
    }, 300);
  }

  function anadir(a: AlimentoEncontrado) {
    empezar(async () => {
      const r = await anadirEntrada({ date: fecha, meal, food_id: a.id, grams: gramos });
      setError(r.error ?? null);
      if (!r.error) setResultados(null);
    });
  }

  return (
    <section aria-labelledby={`${id}-titulo`} className="rounded-xl border-[1.5px] border-hierro bg-papel p-4">
      <h2 id={`${id}-titulo`} className="font-display text-[1.7rem] font-bold">
        {t.anadirTitulo}
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t.buscarEtiqueta}
          <input
            type="search"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              buscar(e.target.value);
            }}
            placeholder={es.alimentos.buscarEjemplo}
            autoComplete="off"
            aria-busy={pendiente}
            className={campo}
          />
        </label>
        <div className="flex flex-col gap-1 text-sm font-bold">
          <label htmlFor={`${id}-comida`}>{t.comidaDelDia}</label>
          <select id={`${id}-comida`} value={meal} onChange={(e) => setMeal(e.target.value as Meal)} className={campo}>
            {MEALS.map((m) => (
              <option key={m} value={m}>
                {t.comidas[m]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t.gramos}
          <input inputMode="decimal" value={gramos} onChange={(e) => setGramos(e.target.value)} className={campo} />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md border-[1.5px] border-hierro p-3 text-sm">
          {error}
        </p>
      )}
      {resultados && (
        <ul className="mt-3 flex flex-col gap-2" aria-live="polite">
          {resultados.length === 0 && <li className="text-sm text-acero">{t.sinResultados}</li>}
          {resultados.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                aria-label={t.anadir(a.name_es)}
                onClick={() => anadir(a)}
                disabled={pendiente}
                className="flex w-full flex-wrap justify-between gap-2 rounded-md border border-linea bg-tiza px-3 py-2 text-left hover:bg-realce"
              >
                <span>+ {a.name_es}</span>
                <span className="text-sm text-acero">{t.porCien(formatNutriente(a.kcal, "kcal"))}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm">
        <Link href="/alimentos" className="text-azul underline">
          {t.explorar}
        </Link>
        {" · "}
        <Link href="/recetas" className="text-azul underline">
          {es.recetas.enlace}
        </Link>
      </p>
    </section>
  );
}
