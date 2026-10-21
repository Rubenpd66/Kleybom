// Nombres en español de los músculos y el material de wger, por su id en wger.
// run.ts falla si aparece un id que no está aquí (así no se inventa nada).
export const MUSCULOS_ES: Record<number, { slug: string; name_es: string }> = {
  1: { slug: "biceps", name_es: "Bíceps" },
  2: { slug: "deltoides-anterior", name_es: "Deltoides anterior" },
  3: { slug: "serrato-anterior", name_es: "Serrato anterior" },
  4: { slug: "pectoral", name_es: "Pectoral" },
  5: { slug: "triceps", name_es: "Tríceps" },
  6: { slug: "abdominales", name_es: "Abdominales" },
  7: { slug: "gemelos", name_es: "Gemelos" },
  8: { slug: "gluteos", name_es: "Glúteos" },
  9: { slug: "trapecio", name_es: "Trapecio" },
  10: { slug: "cuadriceps", name_es: "Cuádriceps" },
  11: { slug: "isquiotibiales", name_es: "Isquiotibiales" },
  12: { slug: "dorsal-ancho", name_es: "Dorsal ancho" },
  13: { slug: "braquial", name_es: "Braquial" },
  14: { slug: "oblicuos", name_es: "Oblicuos" },
  15: { slug: "soleo", name_es: "Sóleo" },
};

export const MATERIAL_ES: Record<number, { slug: string; name_es: string }> = {
  1: { slug: "barra", name_es: "Barra" },
  2: { slug: "barra-z", name_es: "Barra Z" },
  3: { slug: "mancuernas", name_es: "Mancuernas" },
  4: { slug: "esterilla", name_es: "Esterilla" },
  5: { slug: "balon-suizo", name_es: "Balón suizo" },
  6: { slug: "barra-dominadas", name_es: "Barra de dominadas" },
  7: { slug: "sin-material", name_es: "Sin material" },
  8: { slug: "banco", name_es: "Banco" },
  9: { slug: "banco-inclinado", name_es: "Banco inclinado" },
  10: { slug: "pesa-rusa", name_es: "Pesa rusa" },
  11: { slug: "banda-elastica", name_es: "Banda elástica" },
  12: { slug: "polea", name_es: "Polea" },
};
