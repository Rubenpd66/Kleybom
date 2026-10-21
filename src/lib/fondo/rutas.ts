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

// Cómo dibujar el fondo 3D en este aparato:
// - "completo": ordenador o tableta; se carga cuando el navegador queda libre tras abrir la página.
// - "ligero": móvil o poca memoria; menos objetos y fotogramas, y se carga tras el primer toque o
//   desplazamiento (cargarlo al abrir subía el bloqueo hasta 870 ms en un móvil medio).
// - "ninguno": con "ahorro de datos" o muy poca memoria no se descarga three.js.
export type ModoFondo = "completo" | "ligero" | "ninguno";
export const ANCHO_MINIMO_FONDO = 768;
export function modoFondo({ ancho, ahorroDatos, memoriaGb }: { ancho: number; ahorroDatos?: boolean; memoriaGb?: number }): ModoFondo {
  if (ahorroDatos) return "ninguno";
  if (memoriaGb !== undefined && memoriaGb < 2) return "ninguno";
  if (ancho < ANCHO_MINIMO_FONDO || (memoriaGb !== undefined && memoriaGb < 4)) return "ligero";
  return "completo";
}
