// Zonas del mapa corporal (react-body-highlighter) ↔ músculos del catálogo (slugs de `muscles`).
// Las zonas sin músculo en el catálogo (antebrazo, lumbar, aductores…) no hacen nada al pulsarlas.
export const ZONA_A_MUSCULO: Record<string, string> = {
  chest: "pectoral",
  "front-deltoids": "deltoides-anterior",
  biceps: "biceps",
  triceps: "triceps",
  abs: "abdominales",
  obliques: "oblicuos",
  trapezius: "trapecio",
  "upper-back": "dorsal-ancho",
  quadriceps: "cuadriceps",
  hamstring: "isquiotibiales",
  gluteal: "gluteos",
  calves: "gemelos",
  "left-soleus": "soleo",
  "right-soleus": "soleo",
};

export function musculoDeZona(zona: string): string | null {
  return ZONA_A_MUSCULO[zona] ?? null;
}

// Zonas que se resaltan para un músculo del catálogo (p. ej. sóleo = las dos piernas).
export function zonasDeMusculo(slug: string): string[] {
  return Object.entries(ZONA_A_MUSCULO)
    .filter(([, m]) => m === slug)
    .map(([z]) => z);
}

// Zonas para dibujar un músculo en la imagen de un ejercicio. Los que no tienen zona propia en el
// dibujo se pintan en la más cercana (braquial → bíceps, serrato → oblicuos).
const ZONA_APROXIMADA: Record<string, string> = { braquial: "biceps", "serrato-anterior": "obliques" };

export function zonasDeDibujo(slug: string): string[] {
  const zonas = zonasDeMusculo(slug);
  return zonas.length ? zonas : ZONA_APROXIMADA[slug] ? [ZONA_APROXIMADA[slug]] : [];
}

// Dirección del listado con el músculo elegido, conservando búsqueda, material y nivel (y volviendo a la página 1).
export function enlaceConMusculo(actuales: URLSearchParams, slug: string | null): string {
  const p = new URLSearchParams(actuales);
  p.delete("page");
  if (slug) p.set("muscle", slug);
  else p.delete("muscle");
  const qs = p.toString();
  return qs ? `/ejercicios?${qs}` : "/ejercicios";
}
