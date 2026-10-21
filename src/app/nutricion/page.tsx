import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import AvisoInvitado from "@/components/auth/AvisoInvitado";
import ProgressBar from "@/components/motion/ProgressBar";
import FoodPicker from "@/components/nutrition/FoodPicker";
import MealSection from "@/components/nutrition/MealSection";
import { getCurrentUser } from "@/lib/auth/session";
import { toLocalDateKey } from "@/lib/calendar/dates";
import { getUserTimezone, ZONA_POR_DEFECTO } from "@/lib/calendar/queries";
import { esClaveDeDia } from "@/lib/calendar/validate";
import { formatNutriente } from "@/lib/foods/format";
import { es } from "@/lib/i18n/es";
import { MEALS, summarizeDay } from "@/lib/nutrition/diary";
import { getGoals, listEntries } from "@/lib/nutrition/queries";

const t = es.diario;

export const metadata: Metadata = { title: `${t.titulo} — ${es.marca}`, robots: { index: false } };

type Params = Promise<Record<string, string | string[] | undefined>>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const nombreDia = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function moverDia(dia: string, delta: number) {
  const d = new Date(`${dia}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

async function Contenido({ searchParams }: { searchParams: Params }) {
  await connection();
  // Sin cuenta: día vacío, se puede buscar alimentos; al apuntar se pide entrar.
  const usuario = await getCurrentUser();

  const sp = await searchParams;
  const hoy = toLocalDateKey(new Date(), usuario ? await getUserTimezone(usuario.id) : ZONA_POR_DEFECTO);
  const pedido = uno(sp.dia);
  const dia = esClaveDeDia(pedido) ? pedido : hoy;

  const [entradas, objetivos] = usuario ? await Promise.all([listEntries(usuario.id, dia), getGoals(usuario.id)]) : [[], null];
  const resumen = summarizeDay(entradas);

  return (
    <>
      {!usuario && <AvisoInvitado ruta="/nutricion" />}
      <nav aria-label="Días" className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/nutricion?dia=${moverDia(dia, -1)}`} className="text-sm font-bold text-azul underline">
          {t.diaAnterior}
        </Link>
        <p className="font-bold first-letter:uppercase">
          {nombreDia.format(new Date(`${dia}T00:00:00Z`))}
          {dia === hoy && <span className="ml-2 rounded-full bg-temple px-2 py-0.5 text-xs text-tinta">{t.hoy}</span>}
        </p>
        <Link href={`/nutricion?dia=${moverDia(dia, 1)}`} className="text-sm font-bold text-azul underline">
          {t.diaSiguiente}
        </Link>
      </nav>

      <section aria-labelledby="resumen" className="mt-6 rounded-xl border-[1.5px] border-hierro bg-papel p-5">
        <h2 id="resumen" className="font-display text-[1.7rem] font-bold">
          {t.resumen}
        </h2>
        <p className="mt-2 font-display text-4xl font-extrabold">
          {formatNutriente(resumen.total.kcal, "kcal")}
          {objetivos && <span className="ml-2 text-base font-normal text-acero">{t.deObjetivo(objetivos.kcal)}</span>}
        </p>
        {objetivos && (
          <div className="mt-3">
            <ProgressBar
              porcentaje={((resumen.total.kcal ?? 0) / objetivos.kcal) * 100}
              etiqueta={`${Math.round(((resumen.total.kcal ?? 0) / objetivos.kcal) * 100)} % del objetivo de calorías`}
            />
          </div>
        )}
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          {(["protein_g", "carbs_g", "fat_g"] as const).map((k) => (
            <div key={k}>
              <dt className="text-acero">{t.macros[k]}</dt>
              <dd className="font-bold">
                {formatNutriente(resumen.total[k], "g")}
                {objetivos && <span className="font-normal text-acero"> / {objetivos[k]} g</span>}
              </dd>
            </div>
          ))}
        </dl>
        {resumen.incomplete && <p className="mt-3 text-sm text-acero">{t.incompleto}</p>}
        <p className="mt-4 text-sm">
          {!objetivos && <span>{t.sinObjetivos} </span>}
          <Link href="/nutricion/objetivos" className="font-bold text-azul underline">
            {objetivos ? t.verObjetivos : t.calcularObjetivos}
          </Link>
        </p>
      </section>

      {usuario && entradas.length === 0 && <p className="mt-6 max-w-[62ch] rounded-xl border border-linea bg-papel p-4">{t.vacio}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-4">
          {MEALS.map((m) => (
            <MealSection
              key={m}
              titulo={t.comidas[m]}
              entradas={entradas.filter((e) => e.meal === m)}
              total={resumen.byMeal[m]}
            />
          ))}
        </div>
        <div>
          <FoodPicker fecha={dia} />
        </div>
      </div>
    </>
  );
}

export default function DiarioPage(props: PageProps<"/nutricion">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <Suspense fallback={<p className="mt-8 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
