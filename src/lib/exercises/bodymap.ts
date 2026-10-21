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

// Dirección del listado con el músculo elegido, conservando búsqueda, material y nivel (y volviendo a la página 1).
export function enlaceConMusculo(actuales: URLSearchParams, slug: string | null): string {
  const p = new URLSearchParams(actuales);
  p.delete("page");
  if (slug) p.set("muscle", slug);
  else p.delete("muscle");
  const qs = p.toString();
  return qs ? `/ejercicios?${qs}` : "/ejercicios";
}
