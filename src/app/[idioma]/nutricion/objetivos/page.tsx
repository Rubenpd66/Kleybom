import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { connection } from "next/server";
import { Suspense } from "react";
import AvisoInvitado from "@/components/auth/AvisoInvitado";
import TargetsForm, { type ValoresIniciales } from "@/components/nutrition/TargetsForm";
import { getCurrentUser } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/servidor";
import { createServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.objetivos.titulo} — ${es.marca}`, robots: { index: false } };
}

function edadDesde(nacimiento: string | null): string {
  if (!nacimiento) return "";
  const n = new Date(`${nacimiento}T00:00:00Z`);
  const hoy = new Date();
  let edad = hoy.getUTCFullYear() - n.getUTCFullYear();
  const antes = hoy.getUTCMonth() < n.getUTCMonth() || (hoy.getUTCMonth() === n.getUTCMonth() && hoy.getUTCDate() < n.getUTCDate());
  if (antes) edad--;
  return String(edad);
}

async function Contenido() {
  await connection();
  // Sin cuenta la calculadora funciona igual; solo guardar pide entrar.
  const [usuario, es] = await Promise.all([getCurrentUser(), getT()]);
  const t = es.objetivos;
  if (!usuario) {
    const vacios: ValoresIniciales = { sex: "", age: "", height_cm: "", weight_kg: "" };
    return (
      <>
        <AvisoInvitado ruta="/nutricion/objetivos" />
        <TargetsForm iniciales={vacios} />
      </>
    );
  }

  const supabase = await createServerClient();
  const [{ data: perfil }, { data: guardados }] = await Promise.all([
    supabase.from("profiles").select("sex, birth_date, height_cm").eq("id", usuario.id).maybeSingle(),
    supabase.from("nutrition_goals").select("kcal, protein_g, carbs_g, fat_g").eq("user_id", usuario.id).maybeSingle(),
  ]);

  const iniciales: ValoresIniciales = {
    sex: perfil?.sex === "hombre" || perfil?.sex === "mujer" ? perfil.sex : "",
    age: edadDesde(perfil?.birth_date ?? null),
    height_cm: perfil?.height_cm ? String(Number(perfil.height_cm)) : "",
    weight_kg: "",
  };

  return (
    <>
      {guardados && (
        <section aria-labelledby="guardados" className="mt-8 rounded-xl border border-linea bg-papel p-5">
          <h2 id="guardados" className="font-display text-[1.7rem] font-bold">
            {t.guardados}
          </h2>
          <p className="mt-2">
            <strong>{guardados.kcal} kcal</strong> · {t.proteinas} {guardados.protein_g} g · {t.hidratos}{" "}
            {guardados.carbs_g} g · {t.grasas} {guardados.fat_g} g
          </p>
        </section>
      )}
      <TargetsForm iniciales={iniciales} />
    </>
  );
}

export default async function ObjetivosPage() {
  const es = await getT();
  const t = es.objetivos;
  return (
    <main className="mx-auto w-full max-w-[1520px] lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <Link href="/nutricion" className="text-sm font-bold text-azul underline">
        {es.nav.enlaces.find((e) => e.href === "/nutricion")?.label}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">{t.titulo}</h1>
      <p className="mt-4 max-w-[62ch] rounded-md border border-linea bg-papel p-3 text-sm">{t.aviso}</p>
      <Suspense fallback={<p className="mt-8 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido />
      </Suspense>
      <section className="mt-12 max-w-[62ch] text-sm text-acero">
        <h2 className="font-bold text-hierro">{t.comoSeCalcula}</h2>
        <p className="mt-1">{t.explicacion}</p>
      </section>
    </main>
  );
}
