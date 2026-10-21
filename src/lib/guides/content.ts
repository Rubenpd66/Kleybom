// Guías redactadas por KleyBom. Cada cifra sale de una fuente de `fuentes` (verificada el 2026-10-21).
// Si se cambia una cifra, revisar antes la fuente original.

export type Bloque = { tipo: "p"; texto: string } | { tipo: "lista"; items: string[] };
export type Seccion = { titulo: string; bloques: Bloque[] };
export type Fuente = { texto: string; url: string };
export type Guia = {
  slug: string;
  titulo: string;
  resumen: string;
  publicada: string;
  actualizada: string;
  secciones: Seccion[];
  enForja: { texto: string; href: string }[];
  fuentes: Fuente[];
};

const OMS_ACTIVIDAD: Fuente = {
  texto:
    "Bull FC, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54(24):1451-1462. doi:10.1136/bjsports-2020-102955",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/",
};
const ACSM_2009: Fuente = {
  texto:
    "American College of Sports Medicine. Position stand: Progression models in resistance training for healthy adults. Med Sci Sports Exerc. 2009;41(3):687-708. doi:10.1249/MSS.0b013e3181915670",
  url: "https://pubmed.ncbi.nlm.nih.gov/19204579/",
};
const OMS_DIETA: Fuente = {
  texto: "Organización Mundial de la Salud. Alimentación sana (nota descriptiva, actualizada el 26 de enero de 2026).",
  url: "https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet",
};
const SUENO_2015: Fuente = {
  texto:
    "Watson NF, et al. Recommended amount of sleep for a healthy adult: a joint consensus statement of the American Academy of Sleep Medicine and Sleep Research Society. Sleep. 2015;38(6):843-844. doi:10.5665/sleep.4716",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/",
};
const LALLY_2010: Fuente = {
  texto:
    "Lally P, van Jaarsveld CHM, Potts HWW, Wardle J. How are habits formed: Modelling habit formation in the real world. Eur J Soc Psychol. 2010;40(6):998-1009. doi:10.1002/ejsp.674",
  url: "https://doi.org/10.1002/ejsp.674",
};

const p = (texto: string): Bloque => ({ tipo: "p", texto });
const lista = (...items: string[]): Bloque => ({ tipo: "lista", items });

export const GUIAS: Guia[] = [
  {
    slug: "empezar-a-entrenar",
    titulo: "Empezar a entrenar",
    resumen: "Cuánto moverte a la semana según la OMS y cómo organizar tus primeras semanas de fuerza.",
    publicada: "2026-10-21",
    actualizada: "2026-10-21",
    secciones: [
      {
        titulo: "Cuánto recomienda la OMS",
        bloques: [
          p("Las directrices de 2020 de la Organización Mundial de la Salud para adultos dicen, en resumen:"),
          lista(
            "Entre 150 y 300 minutos a la semana de actividad aeróbica moderada (por ejemplo, caminar a paso ligero), o entre 75 y 150 minutos de actividad vigorosa, o una combinación de ambas.",
            "Ejercicios de fuerza de intensidad moderada o mayor que trabajen todos los grandes grupos musculares, 2 o más días a la semana.",
            "Pasar menos tiempo sentado. Cambiar ese tiempo por actividad de cualquier intensidad, incluso ligera, ya aporta beneficios.",
            "A partir de los 65 años, añadir 3 o más días a la semana de actividad variada que trabaje el equilibrio y la fuerza.",
          ),
          p("Algo de actividad es mejor que nada. Si hoy no llegas a esas cifras, empieza por lo que puedas y ve sumando."),
        ],
      },
      {
        titulo: "Tus primeras semanas de fuerza",
        bloques: [
          p("El Colegio Americano de Medicina del Deporte (ACSM) recomienda para quien empieza:"),
          lista(
            "Entrenar fuerza 2 o 3 días a la semana.",
            "Usar cargas con las que puedas hacer entre 8 y 12 repeticiones por serie.",
            "Hacer primero los ejercicios que mueven varias articulaciones y músculos grandes (sentadilla, remo, press) y después los más pequeños (curl de bíceps, elevaciones laterales).",
          ),
          p(
            "Aprende bien la técnica con poco peso antes de cargar más. Una serie bien hecha vale más que tres hechas de cualquier manera.",
          ),
        ],
      },
      {
        titulo: "Cuándo parar",
        bloques: [
          p(
            "Para y consulta con un profesional sanitario si notas dolor en el pecho, mareo, falta de aire muy desproporcionada o un dolor agudo en una articulación. Si tienes una enfermedad, estás embarazada o llevas mucho tiempo sin hacer ejercicio, consulta antes de empezar.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "Rutinas para principiantes", href: "/rutinas" },
      { texto: "Planifica tus días en el calendario", href: "/calendario" },
      { texto: "Busca la técnica de cada ejercicio", href: "/ejercicios" },
    ],
    fuentes: [OMS_ACTIVIDAD, ACSM_2009],
  },
  {
    slug: "comer-mejor",
    titulo: "Comer mejor",
    resumen: "Las cifras básicas de la OMS sobre frutas, verduras, azúcar, sal y grasas, explicadas para el día a día.",
    publicada: "2026-10-21",
    actualizada: "2026-10-21",
    secciones: [
      {
        titulo: "Las bases según la OMS",
        bloques: [
          p("La nota de la OMS sobre alimentación sana recomienda a los adultos:"),
          lista(
            "Procurar comer al menos 400 g de frutas y verduras al día (la recomendación es para mayores de 10 años).",
            "Que los azúcares libres no superen el 10 % de las calorías del día. Bajar al 5 % o menos puede aportar beneficios adicionales.",
            "Tomar menos de 5 g de sal al día, que equivalen a menos de 2 g de sodio.",
            "Que las grasas no pasen del 30 % de las calorías; las saturadas, no más del 10 %, y las trans, no más del 1 %.",
          ),
        ],
      },
      {
        titulo: "Qué son los azúcares libres",
        bloques: [
          p(
            "Son los azúcares que se añaden a los alimentos y bebidas, más los que hay de forma natural en la miel, los siropes y los zumos de fruta. No incluyen el azúcar de la fruta entera ni el de la leche.",
          ),
          p(
            "Un ejemplo con números: en una dieta de 2000 kcal, el 10 % son 200 kcal. Como cada gramo de azúcar aporta unas 4 kcal, el límite queda en unos 50 g de azúcares libres al día.",
          ),
        ],
      },
      {
        titulo: "Ideas para llevarlo a la práctica",
        bloques: [
          lista(
            "Añade una ración de verdura a la comida y a la cena, y fruta entera en el desayuno o la merienda.",
            "Bebe agua de forma habitual y deja los refrescos y zumos para ocasiones.",
            "Cocina con aceite de oliva y prueba los platos antes de echar sal.",
            "Mira la etiqueta: el azúcar y la sal aparecen por cada 100 g, así que puedes comparar productos parecidos.",
          ),
        ],
      },
      {
        titulo: "Cuándo pedir ayuda",
        bloques: [
          p(
            "Si tienes diabetes, una enfermedad del riñón o del corazón, estás embarazada o tu relación con la comida te genera malestar, pide consejo a un médico o a un dietista-nutricionista antes de cambiar tu dieta.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "Calcula tus objetivos de calorías", href: "/nutricion/objetivos" },
      { texto: "Apunta lo que comes en el diario", href: "/nutricion" },
      { texto: "Consulta los nutrientes de cada alimento", href: "/alimentos" },
      { texto: "Recetas sencillas", href: "/recetas" },
    ],
    fuentes: [OMS_DIETA],
  },
  {
    slug: "descanso",
    titulo: "Descanso y sueño",
    resumen: "Cuántas horas dormir, cuánto descansar entre series y por qué los días sin entrenar también cuentan.",
    publicada: "2026-10-21",
    actualizada: "2026-10-21",
    secciones: [
      {
        titulo: "Cuántas horas dormir",
        bloques: [
          p(
            "La Academia Americana de Medicina del Sueño y la Sociedad de Investigación del Sueño acordaron en 2015 que los adultos (de 18 a 60 años) deberían dormir 7 horas o más por noche de forma habitual.",
          ),
          p(
            "Dormir menos de 7 horas de forma habitual se asocia con aumento de peso, diabetes, tensión alta, enfermedad del corazón, ictus, depresión y más riesgo de accidentes. Dormir más de 9 horas puede ser normal en personas jóvenes, cuando recuperas sueño atrasado o si estás enfermo.",
          ),
        ],
      },
      {
        titulo: "Cuánto descansar entre series",
        bloques: [
          p("El ACSM orienta el descanso según lo que buscas:"),
          lista(
            "Fuerza con cargas pesadas (de 1 a 6 repeticiones): de 3 a 5 minutos.",
            "Ganar músculo (sobre todo de 6 a 12 repeticiones): de 1 a 2 minutos.",
            "Resistencia muscular (más de 15 repeticiones con cargas ligeras): menos de 90 segundos.",
          ),
        ],
      },
      {
        titulo: "Los días sin entrenar",
        bloques: [
          p(
            "Si empiezas con 2 o 3 días de fuerza a la semana, como recomienda el ACSM, te quedan días libres entre sesiones. Puedes usarlos para caminar o moverte de forma suave, que también suma para la recomendación de la OMS.",
          ),
          p(
            "Si roncas mucho, te despiertas cansado a menudo o tienes sueño durante el día aunque duermas suficiente, coméntaselo a tu médico.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "El temporizador de descanso del entreno", href: "/entreno" },
      { texto: "Deja días libres en el calendario", href: "/calendario" },
    ],
    fuentes: [SUENO_2015, ACSM_2009, OMS_ACTIVIDAD],
  },
  {
    slug: "habitos",
    titulo: "Crear el hábito",
    resumen: "Qué dice un estudio sobre cómo se forman los hábitos y cómo aplicarlo para no dejar de entrenar.",
    publicada: "2026-10-21",
    actualizada: "2026-10-21",
    secciones: [
      {
        titulo: "Qué dice la ciencia",
        bloques: [
          p(
            "En un estudio del University College London (Lally y colaboradores, 2010), 96 voluntarios eligieron algo que hacer cada día en el mismo momento (por ejemplo, «después del desayuno») durante 12 semanas, y apuntaron cada día lo automático que les resultaba.",
          ),
          lista(
            "Al principio la costumbre se afianzaba deprisa y después cada vez más despacio.",
            "El tiempo hasta que casi no costaba esfuerzo varió muchísimo: de 18 a 254 días según la persona.",
            "Saltarse un día no cambió de forma importante el proceso.",
          ),
          p(
            "Es un estudio pequeño (los cálculos solo encajaron bien en 39 personas), así que tómalo como orientación, no como regla exacta.",
          ),
        ],
      },
      {
        titulo: "Cómo aplicarlo",
        bloques: [
          lista(
            "Ata el entreno a algo que ya haces: «al salir del trabajo», «después de dejar a los niños en el cole».",
            "Hazlo siempre en el mismo contexto: mismo sitio, misma hora aproximada.",
            "Empieza con algo que puedas cumplir incluso un día malo. Diez minutos también cuentan: para la OMS, algo de actividad es mejor que nada.",
            "Si fallas un día, no pasa nada. Lo importante es volver al siguiente.",
            "No te compares: a unas personas les cuesta semanas y a otras meses.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "Planifica tus sesiones en el calendario", href: "/calendario" },
      { texto: "Mira tu racha en tu panel", href: "/panel" },
    ],
    fuentes: [LALLY_2010, OMS_ACTIVIDAD],
  },
  {
    slug: "progresion",
    titulo: "Progresar en fuerza",
    resumen: "Cuándo y cuánto subir el peso, con la regla práctica del Colegio Americano de Medicina del Deporte.",
    publicada: "2026-10-21",
    actualizada: "2026-10-21",
    secciones: [
      {
        titulo: "Por qué hay que progresar",
        bloques: [
          p(
            "El cuerpo se adapta a lo que le pides. Si siempre levantas lo mismo, llega un momento en que deja de mejorar. Por eso el ACSM considera necesario ir aumentando la exigencia poco a poco: más peso, más repeticiones o más series.",
          ),
        ],
      },
      {
        titulo: "La regla práctica: de un 2 a un 10 % más",
        bloques: [
          p(
            "Según el ACSM, cuando con un peso consigues hacer 1 o 2 repeticiones más de las que buscabas, toca subir la carga entre un 2 y un 10 %.",
          ),
          p(
            "Ejemplo: tu rutina pide de 8 a 12 repeticiones y con 40 kg ya haces 13 o 14. Un 2-10 % más son entre 0,8 y 4 kg. Lo normal es subir el salto más pequeño que permitan tus discos (por ejemplo, 2,5 kg) y volver a trabajar desde la parte baja del rango.",
          ),
          lista(
            "En ejercicios pequeños (curl, elevaciones) los saltos pesan más en proporción: sube menos o añade repeticiones antes de subir peso.",
            "Si el día de subir la técnica empeora, quédate con el peso anterior una sesión más.",
          ),
        ],
      },
      {
        titulo: "Según tu nivel",
        bloques: [
          lista(
            "Principiante (sin experiencia o tras años parado): cargas de 8 a 12 repeticiones, 2 o 3 días a la semana.",
            "Intermedio (unos 6 meses entrenando con constancia): de 3 a 4 días a la semana, combinando rangos de 1 a 12 repeticiones a lo largo de las semanas.",
            "Avanzado (años de experiencia): de 4 a 5 días a la semana.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "En el entreno ves lo que hiciste la última vez", href: "/entreno" },
      { texto: "Sigue tu fuerza estimada en estadísticas", href: "/estadisticas" },
    ],
    fuentes: [ACSM_2009],
  },
];
