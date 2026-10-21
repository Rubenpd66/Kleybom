// 10 recetas iniciales redactadas por Forja. Los ingredientes se indican por el slug del alimento
// (tabla foods). Las cantidades son de la receta completa; los nutrientes por ración se calculan solos.
export type IngredienteReceta = { slug: string; gramos: number; nota?: string };
export type Receta = {
  slug: string;
  name_es: string;
  description_es: string;
  servings: number;
  prep_minutes: number;
  ingredientes: IngredienteReceta[];
  pasos: string[];
};

const HUEVO = "huevo-entero-crudo-fresco-171287";
const PATATA = "patatas-pulpa-y-piel-crudas-170026";
const CEBOLLA = "cebolla-cruda-170000";
const ACEITE = "aceite-oliva-para-ensalada-o-cocina-171413";
const SAL = "sal-de-mesa-173468";
const AJO = "ajo-crudo-169230";
const TOMATE = "tomates-rojos-maduros-crudos-promedio-anual-170457";
const TOMATE_TRITURADO = "tomates-triturados-en-conserva-170501";
const PIMIENTO_ROJO = "pimientos-dulces-rojos-crudos-170108";
const LIMON = "limones-crudos-sin-piel-167746";
const PEREJIL = "perejil-fresco-170416";
const MIEL = "miel-169640";

export const RECETAS: Receta[] = [
  {
    slug: "tortilla-de-patatas",
    name_es: "Tortilla de patatas",
    description_es:
      "La clásica, con cebolla y menos aceite del habitual: las patatas se pochan a fuego lento y se escurren bien antes de mezclarlas con el huevo.",
    servings: 4,
    prep_minutes: 45,
    ingredientes: [
      { slug: PATATA, gramos: 600, nota: "4 patatas medianas" },
      { slug: HUEVO, gramos: 300, nota: "6 huevos" },
      { slug: CEBOLLA, gramos: 150, nota: "1 cebolla" },
      { slug: ACEITE, gramos: 40, nota: "unas 4 cucharadas (lo que queda tras escurrir)" },
      { slug: SAL, gramos: 3 },
    ],
    pasos: [
      "Pela las patatas y la cebolla y córtalas en láminas finas.",
      "Ponlas en una sartén con el aceite a fuego medio-bajo, tapadas, unos 20 minutos, removiendo de vez en cuando hasta que estén tiernas.",
      "Escúrrelas bien en un colador para quitar el exceso de aceite.",
      "Bate los huevos con la sal y mezcla con las patatas. Deja reposar 5 minutos.",
      "Cuaja la mezcla en una sartén antiadherente a fuego medio, dale la vuelta con un plato y termina 2 o 3 minutos más.",
    ],
  },
  {
    slug: "lentejas-estofadas-con-verduras",
    name_es: "Lentejas estofadas con verduras",
    description_es:
      "Un plato de cuchara completo y barato, con mucha fibra y proteína vegetal. Se puede congelar en raciones.",
    servings: 4,
    prep_minutes: 50,
    ingredientes: [
      { slug: "lentejas-crudas-172420", gramos: 300 },
      { slug: "zanahorias-crudas-170393", gramos: 150, nota: "2 zanahorias" },
      { slug: CEBOLLA, gramos: 100, nota: "1 cebolla pequeña" },
      { slug: PIMIENTO_ROJO, gramos: 100, nota: "medio pimiento" },
      { slug: AJO, gramos: 10, nota: "2 dientes" },
      { slug: TOMATE_TRITURADO, gramos: 200 },
      { slug: ACEITE, gramos: 20, nota: "2 cucharadas" },
      { slug: SAL, gramos: 4 },
    ],
    pasos: [
      "Lava las lentejas. Pica la cebolla, el pimiento y el ajo, y corta la zanahoria en rodajas.",
      "Sofríe la cebolla, el pimiento y el ajo en el aceite durante 5 minutos. Añade el tomate y cocina 5 minutos más.",
      "Añade las lentejas, la zanahoria y agua hasta cubrir de sobra (aproximadamente 1 litro).",
      "Cuece a fuego suave unos 30-40 minutos, hasta que las lentejas estén tiernas. Sala al final.",
    ],
  },
  {
    slug: "ensalada-de-garbanzos",
    name_es: "Ensalada de garbanzos",
    description_es: "Fresca y rápida, sin cocinar: perfecta para llevar en un táper. Con garbanzos de bote ya cocidos.",
    servings: 2,
    prep_minutes: 15,
    ingredientes: [
      { slug: "garbanzos-semillas-maduras-en-conserva-escurridos-173800", gramos: 400, nota: "1 bote grande escurrido" },
      { slug: TOMATE, gramos: 200, nota: "2 tomates" },
      { slug: "pepino-con-piel-crudo-168409", gramos: 150, nota: "medio pepino" },
      { slug: PIMIENTO_ROJO, gramos: 80 },
      { slug: CEBOLLA, gramos: 50 },
      { slug: ACEITE, gramos: 20, nota: "2 cucharadas" },
      { slug: LIMON, gramos: 20, nota: "el zumo de medio limón" },
      { slug: PEREJIL, gramos: 5 },
    ],
    pasos: [
      "Enjuaga y escurre los garbanzos.",
      "Corta en dados el tomate, el pepino, el pimiento y la cebolla. Pica el perejil.",
      "Mezcla todo y aliña con el aceite, el zumo de limón y una pizca de sal si quieres.",
    ],
  },
  {
    slug: "pollo-con-arroz-y-brocoli",
    name_es: "Pollo a la plancha con arroz y brócoli",
    description_es: "Un plato equilibrado de toda la vida: proteína, hidratos y verdura en la misma bandeja.",
    servings: 2,
    prep_minutes: 30,
    ingredientes: [
      { slug: "pollo-para-asar-o-freir-pechuga-sin-piel-sin-hueso-solo-carne-crudo-171077", gramos: 300, nota: "2 filetes de pechuga" },
      { slug: "arroz-blanco-de-grano-largo-normal-crudo-enriquecido-168877", gramos: 150, nota: "en crudo" },
      { slug: "brocoli-crudo-170379", gramos: 300, nota: "1 brócoli pequeño" },
      { slug: ACEITE, gramos: 15 },
      { slug: AJO, gramos: 5, nota: "1 diente" },
      { slug: SAL, gramos: 2 },
    ],
    pasos: [
      "Cuece el arroz en agua con sal según el paquete (unos 15-18 minutos) y escúrrelo.",
      "Cuece el brócoli en ramitos al vapor o en agua 5-6 minutos, para que quede firme.",
      "Haz las pechugas a la plancha con un poco de aceite y el ajo laminado, 4-5 minutos por cada lado.",
      "Sirve el pollo con el arroz y el brócoli, y riega la verdura con el resto del aceite.",
    ],
  },
  {
    slug: "gachas-de-avena-con-platano",
    name_es: "Gachas de avena con plátano",
    description_es: "Un desayuno caliente y saciante que se prepara en 5 minutos.",
    servings: 1,
    prep_minutes: 10,
    ingredientes: [
      { slug: "cereales-avena-normal-y-rapidos-sin-enriquecer-secos-173904", gramos: 50, nota: "5 cucharadas" },
      { slug: "leche-baja-en-grasa-liquida-2-de-grasa-lactea-con-vitaminas-a-y-d-anadidas-171267", gramos: 250, nota: "1 vaso (semidesnatada)" },
      { slug: "platanos-crudos-173944", gramos: 100, nota: "1 plátano" },
      { slug: "especia-de-canela-molida-171320", gramos: 1, nota: "una pizca" },
      { slug: MIEL, gramos: 10, nota: "1 cucharadita, opcional" },
    ],
    pasos: [
      "Pon la avena y la leche en un cazo a fuego medio.",
      "Remueve durante 3-5 minutos hasta que espese.",
      "Sirve con el plátano en rodajas, la canela y la miel por encima.",
    ],
  },
  {
    slug: "salmon-al-horno-con-patatas",
    name_es: "Salmón al horno con patatas",
    description_es: "Pescado azul con patatas asadas en la misma bandeja: poco trabajo y poca vajilla.",
    servings: 2,
    prep_minutes: 40,
    ingredientes: [
      { slug: "pescado-salmon-del-atlantico-de-piscifactoria-crudo-175167", gramos: 300, nota: "2 lomos" },
      { slug: PATATA, gramos: 400, nota: "3 patatas medianas" },
      { slug: LIMON, gramos: 30, nota: "medio limón" },
      { slug: ACEITE, gramos: 15 },
      { slug: AJO, gramos: 5 },
      { slug: PEREJIL, gramos: 5 },
      { slug: SAL, gramos: 2 },
    ],
    pasos: [
      "Precalienta el horno a 200 °C.",
      "Corta las patatas en rodajas finas, colócalas en la bandeja con la mitad del aceite y sal, y hornea 20 minutos.",
      "Pon encima los lomos de salmón con el ajo y el perejil picados, el resto del aceite y unas rodajas de limón.",
      "Hornea 12-15 minutos más, hasta que el salmón se separe en láminas.",
    ],
  },
  {
    slug: "crema-de-calabacin",
    name_es: "Crema de calabacín",
    description_es: "Suave y ligera, con un poco de patata para darle cuerpo sin añadir nata.",
    servings: 4,
    prep_minutes: 35,
    ingredientes: [
      { slug: "calabaza-de-verano-calabacin-con-piel-cruda-169291", gramos: 800, nota: "3 calabacines" },
      { slug: PATATA, gramos: 200, nota: "1 patata grande" },
      { slug: CEBOLLA, gramos: 150, nota: "1 cebolla" },
      { slug: "leche-baja-en-grasa-liquida-2-de-grasa-lactea-con-vitaminas-a-y-d-anadidas-171267", gramos: 100 },
      { slug: ACEITE, gramos: 20, nota: "2 cucharadas" },
      { slug: SAL, gramos: 4 },
    ],
    pasos: [
      "Pocha la cebolla picada en el aceite durante 5 minutos.",
      "Añade el calabacín y la patata en trozos y cubre justo con agua.",
      "Cuece 20 minutos, añade la leche y la sal y tritura hasta que quede fina.",
    ],
  },
  {
    slug: "tostada-de-aguacate-y-huevo",
    name_es: "Tostada de aguacate y huevo",
    description_es: "Desayuno o cena rápida con grasas saludables y proteína.",
    servings: 1,
    prep_minutes: 10,
    ingredientes: [
      { slug: "pan-integral-comercial-172688", gramos: 60, nota: "2 rebanadas" },
      { slug: "aguacates-crudos-de-california-171706", gramos: 70, nota: "medio aguacate" },
      { slug: HUEVO, gramos: 50, nota: "1 huevo" },
      { slug: TOMATE, gramos: 50, nota: "unas rodajas" },
      { slug: ACEITE, gramos: 5, nota: "un chorrito" },
      { slug: SAL, gramos: 1 },
    ],
    pasos: [
      "Tuesta el pan.",
      "Machaca el aguacate con un tenedor y una pizca de sal y extiéndelo sobre el pan.",
      "Cuece el huevo 7 minutos (o hazlo a la plancha) y ponlo encima con el tomate y el aceite.",
    ],
  },
  {
    slug: "yogur-griego-con-frutos-rojos-y-nueces",
    name_es: "Yogur griego con frutos rojos y nueces",
    description_es: "Un tentempié o postre con proteína, sin cocinar.",
    servings: 1,
    prep_minutes: 5,
    ingredientes: [
      { slug: "yogur-griego-natural-bajo-en-grasa-170903", gramos: 170, nota: "1 envase" },
      { slug: "frambuesas-crudas-167755", gramos: 60, nota: "un puñado" },
      { slug: "arandanos-crudos-171711", gramos: 60, nota: "un puñado" },
      { slug: "frutos-secos-nueces-comunes-170187", gramos: 15, nota: "3 nueces" },
      { slug: MIEL, gramos: 10, nota: "1 cucharadita, opcional" },
    ],
    pasos: ["Pon el yogur en un cuenco.", "Añade la fruta, las nueces troceadas y la miel por encima."],
  },
  {
    slug: "pasta-integral-con-atun-y-tomate",
    name_es: "Pasta integral con atún y tomate",
    description_es: "Un plato rápido de despensa, con espinacas para sumar verdura.",
    servings: 2,
    prep_minutes: 25,
    ingredientes: [
      { slug: "pasta-integral-51-integral-resto-semola-sin-enriquecer-seca-168915", gramos: 160, nota: "en seco" },
      { slug: "pescado-atun-claro-en-conserva-al-natural-sin-sal-escurrido-171986", gramos: 120, nota: "2 latas escurridas" },
      { slug: TOMATE_TRITURADO, gramos: 300 },
      { slug: CEBOLLA, gramos: 80 },
      { slug: AJO, gramos: 6 },
      { slug: "espinacas-crudas-168462", gramos: 60, nota: "2 puñados" },
      { slug: ACEITE, gramos: 15 },
      { slug: SAL, gramos: 2 },
    ],
    pasos: [
      "Cuece la pasta en agua con sal según el paquete.",
      "Mientras, sofríe la cebolla y el ajo picados en el aceite 5 minutos.",
      "Añade el tomate y cocina 10 minutos. Incorpora las espinacas hasta que se ablanden y luego el atún.",
      "Mezcla la salsa con la pasta escurrida.",
    ],
  },
];
