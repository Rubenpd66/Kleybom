import FiltrosEnVivo from "@/components/search/FiltrosEnVivo";
import type { CatalogItem, ExerciseFilters as Filtros } from "@/lib/exercises/queries";
import { getT } from "@/lib/i18n/servidor";

const campo = "h-11 w-full rounded-xl border-[1.5px] border-linea bg-papel/80 px-3 backdrop-blur-sm focus:border-temple";

function Selector({
  nombre,
  etiqueta,
  opciones,
  valor,
  todos,
}: {
  nombre: string;
  etiqueta: string;
  opciones: CatalogItem[];
  valor?: string;
  todos: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold">
      {etiqueta}
      <select name={nombre} defaultValue={valor ?? ""} className={`${campo} font-normal`}>
        <option value="">{todos}</option>
        {opciones.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name_es}
          </option>
        ))}
      </select>
    </label>
  );
}

// Filtros que actualizan el listado mientras se escribe (FiltrosEnVivo). Sin JS es un formulario GET normal.
export default async function ExerciseFilters({
  filtros,
  musculos,
  material,
}: {
  filtros: Filtros;
  musculos: CatalogItem[];
  material: CatalogItem[];
}) {
  const t = (await getT()).ejercicios;
  const niveles = Object.entries(t.niveles).map(([slug, name_es]) => ({ slug, name_es }));
  return (
    <FiltrosEnVivo etiqueta={t.titulo} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:items-end">
      <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2 lg:col-span-1">
        {t.buscarEtiqueta}
        <input type="search" name="q" defaultValue={filtros.q ?? ""} placeholder={t.buscarEjemplo} autoComplete="off" className={`${campo} font-normal`} />
      </label>
      <Selector nombre="muscle" etiqueta={t.musculo} opciones={musculos} valor={filtros.muscle} todos={t.todos} />
      <Selector nombre="equipment" etiqueta={t.material} opciones={material} valor={filtros.equipment} todos={t.todos} />
      <Selector nombre="level" etiqueta={t.nivel} opciones={niveles} valor={filtros.level} todos={t.todos} />
      <button type="submit" className="solo-sin-js h-11 rounded-xl bg-hierro px-6 font-bold text-tiza sm:col-span-2 lg:col-span-1">
        {t.buscar}
      </button>
    </FiltrosEnVivo>
  );
}
