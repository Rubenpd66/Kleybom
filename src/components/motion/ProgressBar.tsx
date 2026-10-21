// Barra de progreso (0–100 %) que crece al cargar. Sin la clase `barra-crece` se ve igual, solo que quieta.
export default function ProgressBar({ porcentaje, etiqueta }: { porcentaje: number; etiqueta?: string }) {
  const ancho = Math.max(0, Math.min(100, porcentaje));
  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full border border-hierro"
      {...(etiqueta ? { role: "img", "aria-label": etiqueta } : { "aria-hidden": true })}
    >
      <div className="barra-crece h-full bg-temple" style={{ width: `${ancho}%` }} />
    </div>
  );
}
