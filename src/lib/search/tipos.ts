// Tipos del buscador (sin dependencias de servidor: los usa también la cabecera en el navegador).
export const GRUPOS = ["secciones", "ejercicios", "rutinas", "recetas", "guias", "alimentos"] as const;
export type Grupo = (typeof GRUPOS)[number];
export type Resultado = { href: string; titulo: string; detalle?: string; imagen?: string | null };
export type Resultados = Record<Grupo, Resultado[]>;
