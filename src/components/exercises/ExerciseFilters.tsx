import type { CatalogItem, ExerciseFilters as Filtros } from "@/lib/exercises/queries";
import { es } from "@/lib/i18n/es";

const t = es.ejercicios;
const campo = "h-11 w-full rounded-md border-[1.5px] border-hierro bg-papel px-3";

function Selector({
  nombre,
  etiqueta,
  opciones,
  valor,
}: {
  nombre: string;
  etiqueta: string;
  opciones: CatalogItem[];
  valor?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold">
      {etiqueta}
      <select name={nombre} defaultValue={valor ?? ""} className={`${campo} font-normal`}>
        <option value="">{t.todos}</option>
        {opciones.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name_es}
          </option>
        ))}
      </select>
    </label>
  );
}

// Formulario GET: funciona sin JavaScript y deja los filtros en la URL.
export default function ExerciseFilters({
  filtros,
  musculos,
  material,
}: {
  filtros: Filtros;
  musculos: CatalogItem[];
  material: CatalogItem[];
}) {
  const niveles = Object.entries(t.niveles).map(([slug, name_es]) => ({ slug, name_es }));
  return (
    <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
      <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2 lg:col-span-1">
        {t.buscarEtiqueta}
        <input
          type="search"
          name="q"
          defaultValue={filtros.q ?? ""}
          className={`${campo} font-normal`}
        />
      </label>
      <Selector nombre="muscle" etiqueta={t.musculo} opciones={musculos} valor={filtros.muscle} />
      <Selector nombre="equipment" etiqueta={t.material} opciones={material} valor={filtros.equipment} />
      <Selector nombre="level" etiqueta={t.nivel} opciones={niveles} valor={filtros.level} />
      <button
        type="submit"
        className="h-11 rounded-md bg-hierro px-6 font-bold text-tiza sm:col-span-2 lg:col-span-1"
      >
        {t.buscar}
      </button>
    </form>
  );
}
