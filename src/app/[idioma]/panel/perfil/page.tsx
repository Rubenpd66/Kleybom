import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import DeleteAccount from "@/components/profile/DeleteAccount";
import ProfileForm from "@/components/profile/ProfileForm";
import { getCurrentUser } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/servidor";
import { createServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const es = await getT();
  return { title: `${es.perfil.titulo} — ${es.marca}`, robots: { index: false } };
}

async function Contenido() {
  await connection();
  const [usuario, es] = await Promise.all([getCurrentUser(), getT()]);
  const t = es.perfil;
  if (!usuario) redirect("/entrar");

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, sex, birth_date, height_cm")
    .eq("id", usuario.id)
    .maybeSingle();

  return (
    <>
      <p className="mt-3 max-w-[62ch] text-acero">{t.explicacion}</p>
      <ProfileForm
        valores={data ?? { display_name: null, sex: null, birth_date: null, height_cm: null }}
      />
      <section className="mt-12">
        <h2 className="font-display text-[1.7rem] font-bold">{t.borrarTitulo}</h2>
        <DeleteAccount />
      </section>
    </>
  );
}

export default async function PerfilPage() {
  const es = await getT();
  const t = es.perfil;
  return (
    <main className="mx-auto w-full max-w-[1520px] lg:px-10 2xl:px-16 flex-1 px-6 py-12">
      <Link href="/panel" className="text-sm font-bold text-azul underline">
        {t.volver}
      </Link>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {t.titulo}
      </h1>
      <Suspense fallback={<p className="mt-3 text-acero">{es.ejercicios.cargando}</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}
