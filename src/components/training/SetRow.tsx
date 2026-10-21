import { formatNutriente } from "@/lib/foods/format";
import { es } from "@/lib/i18n/es";

const t = es.entreno;

// Una serie ya registrada: número, peso × repeticiones y botón para quitarla.
export default function SetRow({
  numero,
  weight_kg,
  reps,
  onQuitar,
  deshabilitado,
}: {
  numero: number;
  weight_kg: number;
  reps: number;
  onQuitar: () => void;
  deshabilitado?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span>
        <span className="text-sm text-acero">{t.serie(numero)}</span>{" "}
        <strong className="tabular-nums">
          {formatNutriente(weight_kg, "kg")} × {reps}
        </strong>
      </span>
      <button
        type="button"
        onClick={onQuitar}
        disabled={deshabilitado}
        aria-label={t.quitarSerie(numero)}
        className="h-9 rounded-md px-3 text-sm font-bold text-azul underline disabled:opacity-50"
      >
        ✕
      </button>
    </li>
  );
}
