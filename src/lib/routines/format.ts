// Los ejercicios por tiempo (planchas, estiramientos) se guardan como 1 repetición y la
// duración va en la nota; por eso "3 × 1" se muestra como "3 series".
export function formatearSeries(sets: number, repsMin: number, repsMax: number): string {
  if (repsMin === 1 && repsMax === 1) return sets === 1 ? "1 serie" : `${sets} series`;
  const reps = repsMin === repsMax ? `${repsMin}` : `${repsMin}-${repsMax}`;
  return `${sets} × ${reps}`;
}
