import { formatNutriente } from "@/lib/foods/format";
import type { Nutrientes } from "@/lib/foods/queries";
import { es } from "@/lib/i18n/es";

const t = es.alimentos;

const FILAS: { clave: keyof Nutrientes; unidad: string; sangria?: boolean }[] = [
  { clave: "kcal", unidad: "kcal" },
  { clave: "protein_g", unidad: "g" },
  { clave: "carbs_g", unidad: "g" },
  { clave: "sugar_g", unidad: "g", sangria: true },
  { clave: "fat_g", unidad: "g" },
  { clave: "fiber_g", unidad: "g" },
  { clave: "sodium_mg", unidad: "mg" },
];

// Tabla por 100 g. Un dato que falta se muestra como "— sin dato", nunca como 0.
export default function NutritionTable({ nutrientes, titulo = t.tablaTitulo }: { nutrientes: Nutrientes; titulo?: string }) {
  return (
    <table className="mt-8 w-full border-collapse overflow-hidden rounded-xl bg-papel text-left">
      <caption className="mb-3 text-left font-display text-[1.7rem] font-bold">{titulo}</caption>
      <thead>
        <tr className="border-b-[1.5px] border-hierro">
          <th scope="col" className="p-3">
            {t.nutriente}
          </th>
          <th scope="col" className="p-3 text-right">
            {t.cantidad}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-linea">
        {FILAS.map((f) => {
          const v = nutrientes[f.clave];
          return (
            <tr key={f.clave}>
              <th scope="row" className={`p-3 font-medium ${f.sangria ? "pl-8 font-normal" : ""}`}>
                {t.nombres[f.clave]}
              </th>
              <td className="p-3 text-right tabular-nums">
                {v === null ? (
                  <span className="text-acero">
                    — <span className="text-sm">{t.sinDato}</span>
                  </span>
                ) : (
                  formatNutriente(v, f.unidad)
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
