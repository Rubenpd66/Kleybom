import Link from "next/link";
import { getT } from "@/lib/i18n/servidor";

export default async function NoEncontrada() {
  const es = await getT();
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {es.recetas.noEncontradaTitulo}
      </h1>
      <p className="mt-3 max-w-[62ch] text-acero">{es.recetas.noEncontrada}</p>
      <Link href="/recetas" className="mt-6 inline-block font-bold text-azul underline">
        {es.recetas.verTodas}
      </Link>
    </main>
  );
}
