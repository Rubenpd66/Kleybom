// Fondo 3D de cada sección. Cada sección tiene una escena distinta; las páginas legales, ninguna.
export const ESCENAS = [
  "chispas",
  "discos",
  "series",
  "semana",
  "nutrientes",
  "plato",
  "diario",
  "pulso",
  "barras",
  "camino",
  "constelacion",
  "malla",
] as const;
export type Escena = (typeof ESCENAS)[number];

// Por prefijo de ruta; gana el primero que encaja (por eso las rutas más concretas van antes).
const POR_SECCION: [string, Escena][] = [
  ["/ejercicios", "discos"],
  ["/rutinas", "series"],
  ["/calendario", "semana"],
  ["/alimentos", "nutrientes"],
  ["/recetas", "plato"],
  ["/nutricion", "diario"],
  ["/entreno", "pulso"],
  ["/estadisticas", "barras"],
  ["/guias", "camino"],
  ["/panel", "constelacion"],
  ["/entrar", "malla"],
  ["/registro", "malla"],
];

export function escenaDeRuta(ruta: string): Escena | null {
  if (ruta === "/") return "chispas";
  const encontrada = POR_SECCION.find(([prefijo]) => ruta === prefijo || ruta.startsWith(`${prefijo}/`));
  return encontrada ? encontrada[1] : null;
}

export const SECCIONES = POR_SECCION;

// ¿Merece la pena dibujar el fondo 3D en este aparato? En móvil el texto ocupa todo el ancho
// (el fondo apenas se vería) y three.js gasta batería y datos; tampoco con "ahorro de datos"
// ni en aparatos con poca memoria. Medido: en móvil subía el tiempo de bloqueo hasta 870 ms.
export const ANCHO_MINIMO_FONDO = 768;
export function debeMostrarFondo({ ancho, ahorroDatos, memoriaGb }: { ancho: number; ahorroDatos?: boolean; memoriaGb?: number }): boolean {
  if (ancho < ANCHO_MINIMO_FONDO) return false;
  if (ahorroDatos) return false;
  if (memoriaGb !== undefined && memoriaGb < 4) return false;
  return true;
}
