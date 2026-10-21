import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import AvisoInvitado from "@/components/auth/AvisoInvitado";
import MeasurementForm, { type ValoresMedida } from "@/components/body/MeasurementForm";
import { getCurrentUser } from "@/lib/auth/session";
import { toLocalDateKey } from "@/lib/calendar/dates";
import { getUserTimezone, ZONA_POR_DEFECTO } from "@/lib/calendar/queries";
import { esClaveDeDia } from "@/lib/calendar/validate";
import { formatNutriente } from "@/lib/foods/format";
import { es } from "@/lib/i18n/es";
import { createServerClient } from "@/lib/supabase/server";
import { borrarMedida } from "./actions";

const t = es.medidas;

export const metadata: Metadata = { title: `${t.titulo} — ${es.marca}`, robots: { index: false } };

type Params = Promise<Record<string, string | string[] | undefined>>;
type Fila = { id: number; date: string; weight_kg: string | null; waist_cm: string | null; hip_cm: string | null; chest_cm: string | null };

const fechaCorta = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const fmt = (v: string | null, unidad: string) => (v === null ? "—" : formatNutriente(Number(v), unidad));
const aTexto = (v: string | null) => (v === null ? "" : String(Number(v)).replace(".", ","));

async function Contenido({ searchParams }: { searchParams: Params }) {
  await connection();
  // Sin cuenta: formulario visible e historial vacío; al guardar se pide entrar.
  const usuario = await getCurrentUser();

  const sp = await searchParams;
  const pedida = String(Array.isArray(sp.fecha) ? sp.fecha[0] : (sp.fecha ?? ""));
  const hoy = toLocalDateKey(new Date(), usuario ? await getUserTimezone(usuario.id) : ZONA_POR_DEFECTO);

  let filas: Fila[] = [];
  if (usuario) {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("body_measurements")
      .select("id, date, weight_kg, waist_cm, hip_cm, chest_cm")
      .eq("user_id", usuario.id)
      .order("date", { ascending: false })
      .limit(90);
    filas = (data ?? []) as Fila[];
  }

  const editando = esClaveDeDia(pedida) ? filas.find((f) => f.date === pedida) : undefined;
  const valores: ValoresMedida = editando
    ? {
        fecha: editando.date,
        peso: aTexto(editando.weight_kg),
        cintura: aTexto(editando.waist_cm),
        cadera: aTexto(editando.hip_cm),
        pecho: aTexto(editando.chest_cm),
      }
    : { fecha: hoy, peso: "", cintura: "", cadera: "", pecho: "" };
  const titulo = editando ? t.editarTitulo(fechaCorta.format(new Date(`${editando.date}T00:00:00Z`))) : t.formTitulo;

  return (
    <>
    {!usuario && <AvisoInvitado ruta="/panel/medidas" que="el registro de medidas" />}
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <MeasurementForm valores={valores} titulo={titulo} />
      <section>
        <h2 className="font-display text-[1.7rem] font-bold">{t.historial}</h2>
        {filas.length === 0 ? (
          <p className="mt-3 text-acero">{t.vacio}</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-linea bg-papel">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-linea">
                  <th scope="col" className="p-3">{t.fecha}</th>
                  <th scope="col" className="p-3">{t.peso}</th>
                  <th scope="col" className="hidden p-3 sm:table-cell">{t.cintura}</th>
                  <th scope="col" className="hidden p-3 sm:table-cell">{t.cadera}</th>
                  <th scope="col" className="hidden p-3 sm:table-cell">{t.pecho}</th>
                  <th scope="col" className="p-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linea">
                {filas.map((f) => {
                  const fecha = fechaCorta.format(new Date(`${f.date}T00:00:00Z`));
                  return (
                    <tr key={f.id}>
                      <th scope="row" className="p-3 font-medium whitespace-nowrap">{fecha}</th>
                      <td className="p-3 whitespace-nowrap">{fmt(f.weight_kg, "kg")}</td>
                      <td className="hidden p-3 sm:table-cell">{fmt(f.waist_cm, "cm")}</td>
                      <td className="hidden p-3 sm:table-cell">{fmt(f.hip_cm, "cm")}</td>
                      <td className="hidden p-3 sm:table-cell">{fmt(f.chest_cm, "cm")}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/panel/medidas?fecha=${f.date}`} aria-label={t.editar(fecha)} className="font-bold text-azul underline">
                            ✎
                          </Link>
                          <form action={borrarMedida.bind(null, f.id)}>
                            <button type="submit" aria-label={t.borrar(fecha)} className="font-bold text-azul underline">
                              ✕
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
    </>
  );
}

export default function MedidasPage(props: PageProps<"/panel/medidas">) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-12 sm:px-6">
      <Link href="/panel" className="text-sm font-bold text-azul underline">
        {es.perfil.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <p className="mt-3 max-w-[62ch] text-acero">{t.descripcion}</p>
      <p className="mt-2 max-w-[62ch] text-sm">{t.aviso}</p>
      <Suspense fallback={<p className="mt-8 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
