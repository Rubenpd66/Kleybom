// English version of the guides (same slugs, figures and sources as content.ts).
import { GUIAS, type Bloque, type Fuente, type Guia } from "./content";

const p = (texto: string): Bloque => ({ tipo: "p", texto });
const lista = (...items: string[]): Bloque => ({ tipo: "lista", items });

// Sources are the same as in Spanish, except the WHO fact sheet, which has its own English page.
const fuentes = (slug: string): Fuente[] =>
  GUIAS.find((g) => g.slug === slug)!.fuentes.map((f) =>
    f.url.includes("who.int/es/")
      ? { texto: "World Health Organization. Healthy diet (fact sheet, updated 26 January 2026).", url: f.url.replace("/es/", "/") }
      : { ...f, texto: f.texto.replace("(actualizada en junio de 2022)", "(updated June 2022)") },
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
  {
    slug: "meditacion",
    titulo: "Meditation and mindfulness",
    resumen: "What research says about meditation, how to start with a few minutes a day and what to watch out for.",
    ...fechas("meditacion"),
    secciones: [
      {
        titulo: "What the research says",
        bloques: [
          p("The US National Center for Complementary and Integrative Health (NCCIH) summarises the studies, many of them still preliminary or not very rigorous, like this:"),
          lista(
            "Anxiety and depression: in a 2018 analysis, mindfulness programmes worked better than no treatment and as well as other evidence-based therapies. Other analyses give mixed results and no clear long-term effect.",
            "Sleep: mindfulness meditation may help reduce insomnia and improve sleep quality, although no more than other proven treatments such as cognitive behavioural therapy or exercise.",
            "Blood pressure: there are few high-quality studies. It may have some benefit, but its specific effect has not been determined.",
            "Pain: mixed results. There are short-term improvements in low-back pain, but not in fibromyalgia or in how often headaches happen.",
          ),
          p("In short: it can be a good complement for wellbeing, but it is not a treatment on its own."),
        ],
      },
      {
        titulo: "How to start",
        bloques: [
          lista(
            "Choose a fixed moment of the day, for example when you get up or after training.",
            "Start with a few minutes. Sit comfortably, close your eyes or lower your gaze and bring your attention to your breathing.",
            "When your mind wanders (it will, many times), come back to your breath without judging yourself. That is meditating too.",
            "If you want a course or a class, ask about the instructor's training and experience.",
          ),
        ],
      },
      {
        titulo: "Precautions",
        bloques: [
          p("It is usually considered low-risk, although its safety has been little studied. In a 2020 review of 83 studies, about 8 % of participants had some negative effect, mostly anxiety or depression, a similar share to psychological therapies."),
          p("Don't use meditation to replace medical care or to put off seeing a professional. If you notice it doesn't suit you, stop and talk to a health professional."),
        ],
      },
    ],
    enForja: [
      { texto: "Finish your workout with the gentle yoga routine", href: "/rutinas/yoga-suave" },
      { texto: "Read the rest and sleep guide", href: "/guias/descanso" },
    ],
    fuentes: fuentes("meditacion"),
  },
  {
    slug: "yoga",
    titulo: "Yoga",
    resumen: "What yoga combines, what there is evidence it helps with and how to practise it safely.",
    ...fechas("yoga"),
    secciones: [
      {
        titulo: "What it is",
        bloques: [p("Yoga as practised in the West usually combines physical postures (asanas), breathing techniques (pranayama) and meditation.")],
      },
      {
        titulo: "What it may help with",
        bloques: [
          p("According to the NCCIH summary, research suggests yoga may:"),
          lista(
            "Improve general wellbeing: relieve stress, support good habits and improve mood, sleep and balance.",
            "Low-back pain: a slight benefit, a little better than no exercise.",
            "Neck pain: in a 2019 review it reduced pain intensity and improved range of motion.",
            "Sleep: it has helped in several studies with older adults, women with sleep problems and cancer patients.",
            "Depression: it can be a helpful addition to treatment. For anxiety disorders there is little evidence.",
            "Balance: recent studies see a beneficial effect in older adults living at home.",
          ),
        ],
      },
      {
        titulo: "Practising safely",
        bloques: [
          p("For healthy people it is a safe activity when done properly, ideally with a qualified instructor: learning on your own without supervision has been linked to more risk. The most common injuries are sprains and strains, mainly in the knee or lower leg; serious injuries are rare."),
          lista(
            "If you are starting out, avoid extreme practices: headstands, shoulder stands, the lotus position and forceful breathing.",
            "Hot yoga has its own risks of overheating and dehydration.",
            "From age 65, injuries that end up in A&E are more common: start gently.",
            "If you are pregnant, check first; avoid hot yoga and poses that keep you still for long periods or lying on your back.",
            "If you have knee or hip injuries, lumbar spine problems, very high blood pressure, balance problems or glaucoma, talk to your doctor and the instructor first to adapt the poses.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "Gentle yoga routine at home", href: "/rutinas/yoga-suave" },
      { texto: "Mobility routine at home", href: "/rutinas/movilidad-en-casa" },
    ],
    fuentes: fuentes("yoga"),
  },
  {
    slug: "flexibilidad-y-equilibrio",
    titulo: "Flexibility and balance",
    resumen: "How much to stretch each week and why to train balance, according to the ACSM and the WHO.",
    ...fechas("flexibilidad-y-equilibrio"),
    secciones: [
      {
        titulo: "Stretching: how much and how often",
        bloques: [
          p("The American College of Sports Medicine (ACSM) recommends, to maintain joint range of movement:"),
          lista(
            "Flexibility exercises for each of the major muscle-tendon groups.",
            "About 60 seconds in total per exercise (for example, 2 or 3 holds of 20-30 seconds).",
            "At least 2 days a week.",
          ),
          p("Stretch without pain: feeling tension is normal, feeling pain is not."),
        ],
      },
      {
        titulo: "Balance and coordination",
        bloques: [
          p("The ACSM adds neuromotor exercise (balance, agility and coordination) 2 or 3 days a week. The WHO recommends that people aged 65 or over do varied activity that works balance and strength on 3 or more days a week."),
          lista(
            "Simple examples: standing on one foot near a wall, walking in a straight line heel to toe, or yoga balance poses.",
            "Do them near a support and on a floor free of obstacles.",
          ),
        ],
      },
    ],
    enForja: [
      { texto: "Mobility routine at home", href: "/rutinas/movilidad-en-casa" },
      { texto: "Full body stretching", href: "/rutinas/estiramientos-cuerpo-completo" },
      { texto: "Find stretches in the catalogue", href: "/ejercicios?q=stretch" },
    ],
    fuentes: fuentes("flexibilidad-y-equilibrio"),
  },
  {
    slug: "cardio",
    titulo: "Cardio: walking, running, cycling",
    resumen: "How many minutes of aerobic exercise the WHO and the ACSM recommend and how to build up without injury.",
    ...fechas("cardio"),
    secciones: [
      {
        titulo: "How much",
        bloques: [
          p("Both recommendations agree:"),
          lista(
            "WHO: between 150 and 300 minutes a week of moderate aerobic activity, or between 75 and 150 of vigorous activity, or a combination.",
            "ACSM: at least 30 minutes a day on 5 or more days a week at moderate intensity (150 minutes), or at least 20 minutes on 3 days a week at vigorous intensity (75 minutes).",
          ),
          p("Moderate is, for example, brisk walking; vigorous is running or cycling at a good pace."),
        ],
      },
      {
        titulo: "How to start and progress",
        bloques: [
          lista(
            "If you can't reach those figures now, start with what you can: according to the ACSM, doing less than recommended still brings benefits.",
            "Build up little by little: increasing intensity and duration gradually may reduce the risk.",
            "Spend less time sitting and take short breaks to stand up and move, even if you already exercise.",
            "Choose something you enjoy: exercise that is pleasant is easier to keep up.",
          ),
        ],
      },
      {
        titulo: "When to stop",
        bloques: [
          p("Stop and see a health professional if you notice chest pain, dizziness or shortness of breath far out of proportion. If you have heart disease or haven't exercised for a long time, check before you start."),
        ],
      },
    ],
    enForja: [
      { texto: "Zone 2 cardio routine", href: "/rutinas/cardio-zona-2" },
      { texto: "HIIT at home", href: "/rutinas/hiit-en-casa" },
      { texto: "Plan your sessions on the calendar", href: "/calendario" },
    ],
    fuentes: fuentes("cardio"),
  },
];
