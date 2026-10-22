import Link from "@/components/ui/Link";
import type { RoutineSummary } from "@/lib/routines/queries";
import { getT } from "@/lib/i18n/servidor";

export default async function RoutineCard({ rutina }: { rutina: RoutineSummary }) {
  const t = (await getT()).rutinas;
  return (
    <li className="rounded-xl border border-linea bg-papel">
      <Link href={`/rutinas/${rutina.slug}`} className="flex h-full flex-col gap-3 p-4 tarjeta-hover hover:bg-realce">
        <span className="font-display text-2xl font-bold leading-tight">{rutina.name}</span>
        <span className="text-sm text-acero">{t.dias(rutina.days_per_week)}</span>
        <span className="mt-auto flex flex-wrap gap-2">
          <span className="rounded-full bg-temple px-3 py-0.5 text-sm font-medium text-tinta">
            {t.objetivos[rutina.goal]}
          </span>
          <span className="rounded-full border border-hierro px-3 py-0.5 text-sm">
            {t.niveles[rutina.level]}
          </span>
        </span>
      </Link>
    </li>
  );
}
