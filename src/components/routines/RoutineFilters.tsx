import type { RoutineFilters as Filtros } from "@/lib/routines/queries";
import { es } from "@/lib/i18n/es";

const t = es.rutinas;
const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3 font-normal";

function Selector({
  nombre,
  etiqueta,
  opciones,
  valor,
}: {
  nombre: string;
  etiqueta: string;
  opciones: Record<string, string>;
  valor?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold">
      {etiqueta}
      <select name={nombre} defaultValue={valor ?? ""} className={campo}>
        <option value="">{t.todos}</option>
        {Object.entries(opciones).map(([slug, nombreEs]) => (
          <option key={slug} value={slug}>
            {nombreEs}
          </option>
        ))}
      </select>
    </label>
  );
}

// Formulario GET: funciona sin JavaScript y deja los filtros en la URL.
export default function RoutineFilters({ filtros }: { filtros: Filtros }) {
  return (
    <form method="get" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <Selector nombre="goal" etiqueta={t.objetivo} opciones={t.objetivos} valor={filtros.goal} />
      <Selector nombre="level" etiqueta={t.nivel} opciones={t.niveles} valor={filtros.level} />
      <button type="submit" className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza">
        {t.filtrar}
      </button>
    </form>
  );
}
