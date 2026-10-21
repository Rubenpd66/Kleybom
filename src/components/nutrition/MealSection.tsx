"use client";

import Link from "next/link";
import { useActionState } from "react";
import { borrarEntrada, editarGramos } from "@/app/nutricion/actions";
import { formatNutriente } from "@/lib/foods/format";
import { es } from "@/lib/i18n/es";
import type { MealEntryWithFood } from "@/lib/nutrition/diary";
import { scaleNutrients, type Nutrients } from "@/lib/nutrition/portion";

const t = es.diario;

function Fila({ e }: { e: MealEntryWithFood }) {
  const [estado, enviar, pendiente] = useActionState(editarGramos.bind(null, e.id), {});
  const kcal = scaleNutrients(e.food, e.grams).kcal;
  return (
    <li className="flex flex-col gap-2 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Link href={`/alimentos/${e.food.slug}`} className="font-bold text-azul underline">
          {e.food.name_es}
        </Link>
        <span className="text-sm text-acero">
          {formatNutriente(e.grams, "g")} · {formatNutriente(kcal, "kcal")}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <form action={enviar} className="flex items-center gap-2">
          <input
            name="gramos"
            inputMode="decimal"
            defaultValue={String(e.grams).replace(".", ",")}
            aria-label={t.gramosDe(e.food.name_es)}
            className="h-9 w-24 rounded-md border-[1.5px] border-hierro bg-papel px-2 text-sm"
          />
          <button
            type="submit"
            disabled={pendiente}
            className="h-9 rounded-md border-[1.5px] border-hierro px-3 text-sm font-bold disabled:opacity-50"
          >
            {t.guardar}
          </button>
        </form>
        <form action={borrarEntrada.bind(null, e.id)}>
          <button
            type="submit"
            aria-label={t.quitar(e.food.name_es)}
            className="h-9 rounded-md px-3 text-sm font-bold text-azul underline"
          >
            ✕
          </button>
        </form>
      </div>
      {estado.error && (
        <p role="alert" className="text-sm">
          {estado.error}
        </p>
      )}
    </li>
  );
}

export default function MealSection({
  titulo,
  entradas,
  total,
}: {
  titulo: string;
  entradas: MealEntryWithFood[];
  total: Nutrients;
}) {
  const id = `comida-${titulo}`;
  return (
    <section aria-labelledby={id} className="rounded-xl border border-linea bg-papel">
      <div className="flex items-baseline justify-between gap-2 border-b border-linea p-3">
        <h2 id={id} className="font-display text-2xl font-bold">
          {titulo}
        </h2>
        <span className="text-sm font-bold">{formatNutriente(total.kcal, "kcal")}</span>
      </div>
      {entradas.length === 0 ? (
        <p className="p-3 text-sm text-acero">{t.sinEntradas}</p>
      ) : (
        <ul className="divide-y divide-linea">
          {entradas.map((e) => (
            <Fila key={e.id} e={e} />
          ))}
        </ul>
      )}
    </section>
  );
}
