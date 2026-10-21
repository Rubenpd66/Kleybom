import Link from "next/link";
import { es } from "@/lib/i18n/es";

export default function NoEncontrado() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-12">
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none">
        {es.alimentos.noEncontradoTitulo}
      </h1>
      <p className="mt-3 max-w-[62ch] text-acero">{es.alimentos.noEncontrado}</p>
      <Link href="/alimentos" className="mt-6 inline-block font-bold text-azul underline">
        {es.alimentos.verTodos}
      </Link>
    </main>
  );
}
