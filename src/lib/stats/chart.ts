// Escalas para los gráficos SVG propios (sin librerías).

export function niceMax(v: number): number {
  if (!Number.isFinite(v) || v <= 0) return 1;
  const potencia = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * potencia >= v) return m * potencia;
  return 10 * potencia;
}

const limpio = (n: number) => Math.round(n * 1000) / 1000;

export function escalaY(valores: number[], o: { desdeCero?: boolean } = {}): { min: number; max: number; marcas: number[] } {
  const finitos = valores.filter(Number.isFinite);
  if (o.desdeCero || finitos.length === 0) {
    const max = niceMax(Math.max(0, ...finitos));
    return { min: 0, max, marcas: [0, 1, 2, 3, 4].map((i) => limpio((max * i) / 4)) };
  }
  const bajo = Math.min(...finitos);
  const alto = Math.max(...finitos);
  const paso = niceMax(Math.max(alto - bajo, Math.abs(alto) * 0.02, 1) / 4);
  const min = Math.floor(bajo / paso) * paso;
  const max = Math.max(Math.ceil(alto / paso) * paso, min + paso * 4);
  const n = Math.round((max - min) / paso);
  return { min: limpio(min), max: limpio(max), marcas: Array.from({ length: n + 1 }, (_, i) => limpio(min + i * paso)) };
}
