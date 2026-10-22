import { repartoCalorias } from "@/lib/foods/format";
import { getT } from "@/lib/i18n/servidor";

// Barra del reparto de calorías. El color nunca es la única pista: la leyenda lleva texto y %.
export default async function CalorieBar({
  protein_g,
  carbs_g,
  fat_g,
}: {
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}) {
  const t = (await getT()).alimentos;
  const r = repartoCalorias({ protein_g, carbs_g, fat_g });
  if (!r) return <p className="text-sm text-acero">{t.repartoNoDisponible}</p>;

  const partes = [
    { clave: "proteina", pct: r.proteina, color: "bg-azul" },
    { clave: "hidratos", pct: r.hidratos, color: "bg-temple" },
    { clave: "grasa", pct: r.grasa, color: "bg-hierro" },
  ] as const;

  return (
    <figure>
      <div
        role="img"
        aria-label={t.reparto(r.proteina, r.hidratos, r.grasa)}
        className="flex h-4 w-full overflow-hidden rounded-full border border-hierro"
      >
        {partes.map((p) => (
          <span key={p.clave} className={p.color} style={{ width: `${p.pct}%` }} />
        ))}
      </div>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {partes.map((p) => (
          <span key={p.clave} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`inline-block h-3 w-3 rounded-sm border border-hierro ${p.color}`} />
            {t.leyenda[p.clave]} {p.pct} %
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
