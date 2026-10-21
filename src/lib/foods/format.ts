const numero = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1, useGrouping: true });

// Un dato desconocido se muestra como "—", nunca como 0.
export function formatNutriente(valor: number | null, unidad: string): string {
  if (valor === null) return "—";
  // es-ES no agrupa los números de 4 cifras por defecto; se fuerza el punto de miles a partir de 1.000.
  const texto = valor >= 1000 && valor < 10000 ? numero.format(valor).replace(/^(\d)(\d{3})/, "$1.$2") : numero.format(valor);
  return `${texto} ${unidad}`;
}

export type Reparto = { proteina: number; hidratos: number; grasa: number };

// % de las calorías que aportan proteína, hidratos y grasa (4, 4 y 9 kcal por gramo).
// Redondeo de mayor resto: los tres porcentajes siempre suman 100.
export function repartoCalorias(m: {
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}): Reparto | null {
  if (m.protein_g === null || m.carbs_g === null || m.fat_g === null) return null;
  const kcal = [m.protein_g * 4, m.carbs_g * 4, m.fat_g * 9];
  const total = kcal.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;

  const exactos = kcal.map((k) => (k / total) * 100);
  const enteros = exactos.map(Math.floor);
  let falta = 100 - enteros.reduce((a, b) => a + b, 0);
  const porResto = exactos.map((e, i) => ({ i, resto: e - Math.floor(e) })).sort((a, b) => b.resto - a.resto);
  for (const { i } of porResto) {
    if (falta <= 0) break;
    enteros[i]++;
    falta--;
  }
  return { proteina: enteros[0], hidratos: enteros[1], grasa: enteros[2] };
}
