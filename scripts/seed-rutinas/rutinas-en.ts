// Versión en inglés de las rutinas plantilla (nombre, descripción y notas de los ejercicios).
const AVISO = "If you have an injury or health condition, check with a health professional first.";

export const RUTINAS_EN: Record<string, { name: string; description: string }> = {
  "cuerpo-completo-principiante-3-dias": {
    name: "Full body for beginners (3 days)",
    description:
      "Three sessions a week that work the whole body with simple exercises. Ideal for getting started or coming back to training after a break.\n\n" +
      "How to follow it: train on alternate days (for example Monday, Wednesday and Friday). Start each session with 5-10 minutes of gentle mobility or walking. Choose a weight with which you could do 2 or 3 more reps than you do. When you complete all sets with good technique, increase the weight a little the following week.\n\n" +
      AVISO,
  },
  "torso-pierna-4-dias": {
    name: "Upper / lower (4 days)",
    description:
      "Four sessions a week: two upper body and two lower body. Each muscle group is trained twice a week, with enough volume to keep progressing.\n\n" +
      "How to follow it: a common split is upper body on Monday and Thursday, lower body on Tuesday and Friday. Leave at least one rest day between sessions of the same type. Write down the weights you use: the key is adding reps or weight little by little. If you have been training for less than 6 months, start with the full body routine first.\n\n" +
      AVISO,
  },
  "empuje-tiron-pierna-6-dias": {
    name: "Push / pull / legs (6 days)",
    description:
      "Six sessions a week: push (chest, shoulders and triceps), pull (back and biceps) and legs, each block twice. A demanding routine for experienced people with good recovery.\n\n" +
      "How to follow it: order the days as push, pull, legs, push, pull, legs, with one day off a week. Sleep enough and look after your diet: with this much volume, rest is part of training. If you notice fatigue that doesn't go away or pain in a joint, reduce the volume for a week.\n\n" +
      AVISO,
  },
  "fuerza-basica-3-dias": {
    name: "Basic strength (3 days)",
    description:
      "Few sets, few exercises and heavy loads for 5 reps. Designed to gain strength in the basic lifts: squat, bench press, row, overhead press and deadlift.\n\n" +
      "How to follow it: train on alternate days. Start with a weight that lets you reach 5 reps comfortably and increase it little by little, session by session. Rest 2 to 3 minutes between heavy sets. It's important to learn the technique well before loading up: if you can, ask someone to check it.\n\n" +
      AVISO,
  },
  "movilidad-en-casa": {
    name: "Mobility at home",
    description:
      "Gentle, short sessions (about 15-20 minutes) to move more freely: spine, hips, shoulders and legs. You don't need any equipment, just a little space and a mat or a towel.\n\n" +
      "How to follow it: do it three days a week or more. Move without pain: feeling tension is normal, feeling pain is not. Don't bounce in the stretches and breathe calmly. It's a good complement to any other routine.\n\n" +
      AVISO,
  },
  "iniciacion-sin-material": {
    name: "Getting started with no equipment (3 days)",
    description:
      "Three sessions a week done at home, with no equipment, using your own body weight. It helps you start moving consistently and build the habit.\n\n" +
      "How to follow it: train on alternate days. If a set feels very easy, do it more slowly or add reps; if you can't finish it, do fewer and rest longer. Consistency matters more than intensity. When you complete all sets comfortably for two weeks, move on to the full body routine.\n\n" +
      AVISO,
  },
};

export const NOTAS_EN: Record<string, string> = {
  "Espalda recta y mancuernas cerca de las piernas.": "Straight back and dumbbells close to your legs.",
  "Hazlo con cada brazo.": "Do it with each arm.",
  "Repeticiones por cada pierna.": "Reps per leg.",
  "Si aún no llegas, usa la dominada asistida.": "If you can't do them yet, use the assisted pull-up.",
  "Técnica por delante del peso: pide a alguien que te vea.": "Technique before weight: ask someone to watch you.",
  "Técnica por delante del peso.": "Technique before weight.",
  "Más ligera que el primer día.": "Lighter than on the first day.",
  "Una sola serie pesada de 5 repeticiones.": "A single heavy set of 5 reps.",
  "Mueve la columna despacio, coordinado con la respiración.": "Move your spine slowly, in time with your breathing.",
  "Repeticiones por cada lado, sin balancear la espalda.": "Reps per side, without rocking your back.",
  "Sube despacio y sin forzar el cuello.": "Lift slowly without straining your neck.",
  "Repeticiones por cada lado.": "Reps per side.",
  "Mantén la posición de 20 a 40 segundos.": "Hold the position for 20 to 40 seconds.",
  "Mantén la posición de 20 a 30 segundos.": "Hold the position for 20 to 30 seconds.",
  "Mantén la posición de 30 a 45 segundos.": "Hold the position for 30 to 45 seconds.",
  "Mantén la posición unos 30 segundos por lado.": "Hold the position for about 30 seconds per side.",
  "Mantén la posición unos 30 segundos.": "Hold the position for about 30 seconds.",
};
