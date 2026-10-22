// Los ejercicios por tiempo (planchas, estiramientos) se guardan como 1 repetición y la
// duración va en la nota; por eso "3 × 1" se muestra como "3 series".
// `series`: el texto "N series" en el idioma de la página (por defecto, español).
export function formatearSeries(
  sets: number,
  repsMin: number,
  repsMax: number,
  series: (n: number) => string = (n) => (n === 1 ? "1 serie" : `${n} series`),
): string {
  if (repsMin === 1 && repsMax === 1) return series(sets);
  const reps = repsMin === repsMax ? `${repsMin}` : `${repsMin}-${repsMax}`;
  return `${sets} × ${reps}`;
}
