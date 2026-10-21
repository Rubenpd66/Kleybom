import Link from "next/link";
import type { ExerciseSummary } from "@/lib/exercises/queries";
import { es } from "@/lib/i18n/es";

export default function ExerciseCard({ ejercicio }: { ejercicio: ExerciseSummary }) {
  return (
    <li className="rounded-xl border border-linea bg-papel">
      <Link
        href={`/ejercicios/${ejercicio.slug}`}
        className="flex h-full flex-col gap-3 p-4 tarjeta-hover hover:bg-realce"
      >
        <span className="font-display text-2xl font-bold leading-tight">{ejercicio.name_es}</span>
        <span className="mt-auto w-fit rounded-full border border-hierro px-3 py-0.5 text-sm">
          {es.ejercicios.niveles[ejercicio.level]}
        </span>
      </Link>
    </li>
  );
}
