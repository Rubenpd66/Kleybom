// English version of the guides (same slugs, figures and sources as content.ts).
import { GUIAS, type Bloque, type Fuente, type Guia } from "./content";

const p = (texto: string): Bloque => ({ tipo: "p", texto });
const lista = (...items: string[]): Bloque => ({ tipo: "lista", items });

// Sources are the same as in Spanish, except the WHO fact sheet, which has its own English page.
const fuentes = (slug: string): Fuente[] =>
  GUIAS.find((g) => g.slug === slug)!.fuentes.map((f) =>
    f.url.includes("who.int/es/")
      ? { texto: "World Health Organization. Healthy diet (fact sheet, updated 26 January 2026).", url: f.url.replace("/es/", "/") }
      : f,
  );
const fechas = (slug: string) => {
  const g = GUIAS.find((x) => x.slug === slug)!;
  return { publicada: g.publicada, actualizada: g.actualizada };
};

export const GUIAS_EN: Guia[] = [
  {
    slug: "empezar-a-entrenar",
    titulo: "Getting started with training",
    resumen: "How much to move each week according to the WHO and how to organise your first weeks of strength training.",
    ...fechas("empezar-a-entrenar"),
    secciones: [
      {
        titulo: "What the WHO recommends",
        bloques: [
          p("The World Health Organization's 2020 guidelines for adults say, in short:"),
          lista(
            "Between 150 and 300 minutes a week of moderate aerobic activity (for example, brisk walking), or between 75 and 150 minutes of vigorous activity, or a combination of both.",
            "Muscle-strengthening exercise of moderate or greater intensity that works all major muscle groups, on 2 or more days a week.",
            "Spend less time sitting. Replacing that time with activity of any intensity, even light, already brings benefits.",
            "From age 65, add 3 or more days a week of varied activity that works balance and strength.",
          ),
          p("Some activity is better than none. If you can't reach those figures today, start with what you can and build up."),
        ],
      },
      {
        titulo: "Your first weeks of strength training",
        bloques: [
          p("The American College of Sports Medicine (ACSM) recommends for beginners:"),
          lista(
            "Train strength 2 or 3 days a week.",
            "Use loads that let you do between 8 and 12 reps per set.",
            "Do multi-joint exercises for large muscles first (squat, row, press) and smaller ones afterwards (biceps curl, lateral raises).",
          ),
          p("Learn the technique well with light weight before adding more. One well-done set is worth more than three sloppy ones."),
        ],
      },
      {
        titulo: "When to stop",
        bloques: [
          p(
            "Stop and see a health professional if you notice chest pain, dizziness, shortness of breath far out of proportion, or sharp pain in a joint. If you have an illness, are pregnant or haven't exercised for a long time, check before you start.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "Routines for beginners", href: "/rutinas" },
      { texto: "Plan your days on the calendar", href: "/calendario" },
      { texto: "Look up the technique for each exercise", href: "/ejercicios" },
    ],
    fuentes: fuentes("empezar-a-entrenar"),
  },
  {
    slug: "comer-mejor",
    titulo: "Eating better",
    resumen: "The WHO's basic figures on fruit, vegetables, sugar, salt and fat, explained for everyday life.",
    ...fechas("comer-mejor"),
    secciones: [
      {
        titulo: "The basics according to the WHO",
        bloques: [
          p("The WHO fact sheet on healthy diets recommends that adults:"),
          lista(
            "Aim to eat at least 400 g of fruit and vegetables a day (the recommendation is for people over 10).",
            "Keep free sugars below 10 % of daily calories. Going down to 5 % or less may bring extra benefits.",
            "Eat less than 5 g of salt a day, which is less than 2 g of sodium.",
            "Keep fat at no more than 30 % of calories; saturated fat no more than 10 %, and trans fat no more than 1 %.",
          ),
        ],
      },
      {
        titulo: "What free sugars are",
        bloques: [
          p(
            "They are the sugars added to food and drinks, plus those naturally present in honey, syrups and fruit juices. They don't include the sugar in whole fruit or in milk.",
          ),
          p(
            "An example with numbers: on a 2000 kcal diet, 10 % is 200 kcal. As each gram of sugar provides about 4 kcal, the limit is about 50 g of free sugars a day.",
          ),
        ],
      },
      {
        titulo: "Ideas to put it into practice",
        bloques: [
          lista(
            "Add a portion of vegetables to lunch and dinner, and whole fruit at breakfast or as a snack.",
            "Drink water as a habit and keep soft drinks and juices for special occasions.",
            "Cook with olive oil and taste dishes before adding salt.",
            "Read the label: sugar and salt are given per 100 g, so you can compare similar products.",
          ),
        ],
      },
      {
        titulo: "When to ask for help",
        bloques: [
          p(
            "If you have diabetes, kidney or heart disease, are pregnant, or your relationship with food makes you feel unwell, ask a doctor or a dietitian for advice before changing your diet.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "Work out your calorie goals", href: "/nutricion/objetivos" },
      { texto: "Log what you eat in the diary", href: "/nutricion" },
      { texto: "Check the nutrients of each food", href: "/alimentos" },
      { texto: "Simple recipes", href: "/recetas" },
    ],
    fuentes: fuentes("comer-mejor"),
  },
  {
    slug: "descanso",
    titulo: "Rest and sleep",
    resumen: "How many hours to sleep, how long to rest between sets and why rest days count too.",
    ...fechas("descanso"),
    secciones: [
      {
        titulo: "How many hours to sleep",
        bloques: [
          p(
            "In 2015 the American Academy of Sleep Medicine and the Sleep Research Society agreed that adults (aged 18 to 60) should regularly sleep 7 hours or more per night.",
          ),
          p(
            "Regularly sleeping less than 7 hours is associated with weight gain, diabetes, high blood pressure, heart disease, stroke, depression and a higher risk of accidents. Sleeping more than 9 hours may be normal in young people, when catching up on lost sleep or when you are ill.",
          ),
        ],
      },
      {
        titulo: "How long to rest between sets",
        bloques: [
          p("The ACSM suggests rest periods according to your goal:"),
          lista(
            "Strength with heavy loads (1 to 6 reps): 3 to 5 minutes.",
            "Building muscle (mainly 6 to 12 reps): 1 to 2 minutes.",
            "Muscular endurance (more than 15 reps with light loads): less than 90 seconds.",
          ),
        ],
      },
      {
        titulo: "Rest days",
        bloques: [
          p(
            "If you start with 2 or 3 days of strength training a week, as the ACSM recommends, you have free days between sessions. You can use them to walk or move gently, which also counts towards the WHO recommendation.",
          ),
          p("If you snore a lot, often wake up tired or feel sleepy during the day even though you sleep enough, tell your doctor."),
        ],
      },
    ],
    enForja: [
      { texto: "The rest timer in the workout", href: "/entreno" },
      { texto: "Leave rest days on the calendar", href: "/calendario" },
    ],
    fuentes: fuentes("descanso"),
  },
  {
    slug: "habitos",
    titulo: "Building the habit",
    resumen: "What a study says about how habits form and how to use it so you don't give up training.",
    ...fechas("habitos"),
    secciones: [
      {
        titulo: "What the science says",
        bloques: [
          p(
            "In a University College London study (Lally and colleagues, 2010), 96 volunteers chose something to do every day at the same moment (for example, “after breakfast”) for 12 weeks, and recorded each day how automatic it felt.",
          ),
          lista(
            "At first the habit grew quickly, and then more and more slowly.",
            "The time until it took almost no effort varied enormously: from 18 to 254 days depending on the person.",
            "Missing a day did not significantly change the process.",
          ),
          p("It is a small study (the calculations only fitted well for 39 people), so take it as a guide, not an exact rule."),
        ],
      },
      {
        titulo: "How to apply it",
        bloques: [
          lista(
            "Link your workout to something you already do: “after leaving work”, “after dropping the kids at school”.",
            "Always do it in the same context: same place, roughly the same time.",
            "Start with something you can manage even on a bad day. Ten minutes count too: for the WHO, some activity is better than none.",
            "If you miss a day, that's fine. What matters is coming back the next one.",
            "Don't compare yourself: for some people it takes weeks and for others months.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "Plan your sessions on the calendar", href: "/calendario" },
      { texto: "Check your streak on your dashboard", href: "/panel" },
    ],
    fuentes: fuentes("habitos"),
  },
  {
    slug: "progresion",
    titulo: "Getting stronger",
    resumen: "When and how much to increase the weight, with the American College of Sports Medicine rule of thumb.",
    ...fechas("progresion"),
    secciones: [
      {
        titulo: "Why you need to progress",
        bloques: [
          p(
            "Your body adapts to what you ask of it. If you always lift the same, at some point it stops improving. That is why the ACSM considers it necessary to increase the demand little by little: more weight, more reps or more sets.",
          ),
        ],
      },
      {
        titulo: "The rule of thumb: 2 to 10 % more",
        bloques: [
          p("According to the ACSM, when you can do 1 or 2 more reps than your target with a weight, it's time to increase the load by 2 to 10 %."),
          p(
            "Example: your routine asks for 8 to 12 reps and with 40 kg you already do 13 or 14. 2-10 % more is between 0.8 and 4 kg. The usual approach is to add the smallest jump your plates allow (for example, 2.5 kg) and work back up from the bottom of the range.",
          ),
          lista(
            "In small exercises (curls, raises) the jumps are proportionally bigger: add less or add reps before adding weight.",
            "If your technique gets worse on the day you increase, stay at the previous weight for one more session.",
          ),
        ],
      },
      {
        titulo: "By level",
        bloques: [
          lista(
            "Beginner (no experience or after years off): loads for 8 to 12 reps, 2 or 3 days a week.",
            "Intermediate (about 6 months of consistent training): 3 to 4 days a week, combining ranges of 1 to 12 reps over the weeks.",
            "Advanced (years of experience): 4 to 5 days a week.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "In the workout you see what you did last time", href: "/entreno" },
      { texto: "Track your estimated strength in statistics", href: "/estadisticas" },
    ],
    fuentes: fuentes("progresion"),
  },
];
