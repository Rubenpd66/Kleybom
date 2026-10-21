import type { Goal, RoutineDraft, RoutineLevel } from "../../src/lib/routines/validate.ts";

// Cada ejercicio se indica por su slug del catálogo (así no depende de ids concretos).
export type EjercicioPlantilla = {
  slug: string;
  series: number;
  reps: [min: number, max: number];
  descanso: number; // segundos
  nota?: string;
};

export type Plantilla = {
  slug: string;
  name: string;
  description: string;
  goal: Goal;
  level: RoutineLevel;
  dias: EjercicioPlantilla[][];
};

const AVISO =
  "Si tienes alguna lesión o condición de salud, consúltalo antes con un profesional sanitario.";

const e = (
  slug: string,
  series: number,
  min: number,
  max: number,
  descanso: number,
  nota?: string,
): EjercicioPlantilla => ({ slug, series, reps: [min, max], descanso, nota });

// Ejercicios que se miden por tiempo: 1 "repetición" y la nota indica los segundos.
const tiempo = (slug: string, series: number, segundos: string, descanso = 45): EjercicioPlantilla =>
  e(slug, series, 1, 1, descanso, `Mantén la posición ${segundos}.`);

export const PLANTILLAS: Plantilla[] = [
  {
    slug: "cuerpo-completo-principiante-3-dias",
    name: "Cuerpo completo para principiantes (3 días)",
    description:
      "Tres sesiones a la semana que trabajan todo el cuerpo con ejercicios sencillos. Es ideal para empezar o volver a entrenar después de un tiempo parado.\n\n" +
      "Cómo seguirla: entrena en días alternos (por ejemplo lunes, miércoles y viernes). Empieza cada sesión con 5-10 minutos de movilidad suave o caminar. Elige un peso con el que podrías hacer 2 o 3 repeticiones más de las que haces. Cuando completes todas las series con buena técnica, sube el peso un poco la semana siguiente.\n\n" +
      AVISO,
    goal: "hipertrofia",
    level: "principiante",
    dias: [
      [
        e("prensa-de-piernas", 3, 10, 12, 90),
        e("press-de-banca-con-mancuernas", 3, 8, 12, 90),
        e("jalon-al-pecho", 3, 10, 12, 90),
        e("press-militar-mancuerna", 2, 10, 12, 75),
        tiempo("plancha-frontal", 3, "de 20 a 40 segundos"),
      ],
      [
        e("peso-muerto-rumano-con-mancuernas", 3, 10, 12, 90, "Espalda recta y mancuernas cerca de las piernas."),
        e("flexiones-de-rodillas", 3, 6, 12, 75),
        e("remo-con-mancuernas", 3, 10, 12, 75, "Hazlo con cada brazo."),
        e("zancada-con-el-peso-corporal", 2, 10, 12, 60, "Repeticiones por cada pierna."),
        e("abdominales", 3, 10, 15, 45),
      ],
      [
        e("sentadillas-sumo", 3, 12, 15, 75),
        e("press-de-banca-con-mancuernas", 3, 8, 12, 90),
        e("jalon-al-pecho", 3, 10, 12, 90),
        e("puente-de-cadera", 3, 12, 15, 60),
        tiempo("plancha-frontal", 3, "de 20 a 40 segundos"),
      ],
    ],
  },
  {
    slug: "torso-pierna-4-dias",
    name: "Torso / pierna (4 días)",
    description:
      "Cuatro sesiones a la semana: dos de torso y dos de pierna. Cada grupo muscular se trabaja dos veces por semana, con volumen suficiente para seguir progresando.\n\n" +
      "Cómo seguirla: una distribución habitual es lunes y jueves torso, martes y viernes pierna. Deja al menos un día de descanso entre sesiones del mismo tipo. Anota los pesos que usas: la clave es añadir repeticiones o peso poco a poco. Si llevas menos de 6 meses entrenando, empieza antes por la rutina de cuerpo completo.\n\n" +
      AVISO,
    goal: "hipertrofia",
    level: "intermedio",
    dias: [
      [
        e("press-de-banca", 4, 6, 10, 120),
        e("remo-con-barra-agarre-prono", 4, 6, 10, 120),
        e("press-militar-mancuerna", 3, 8, 12, 90),
        e("jalon-al-pecho", 3, 8, 12, 90),
        e("curl-con-mancuerna", 3, 10, 12, 60),
        e("extension-de-triceps", 3, 10, 12, 60),
      ],
      [
        e("sentadillas", 4, 6, 10, 150),
        e("peso-muerto-rumano-con-barra", 3, 8, 10, 120),
        e("prensa-de-piernas", 3, 10, 12, 90),
        e("zancadas-con-mancuernas", 3, 10, 12, 90, "Repeticiones por cada pierna."),
        e("elevacion-de-talones-a-dos-piernas", 4, 12, 15, 60),
      ],
      [
        e("press-de-banca-con-mancuernas", 4, 8, 12, 90),
        e("remo-con-mancuernas", 4, 8, 12, 90, "Hazlo con cada brazo."),
        e("dominadas", 3, 4, 8, 120, "Si aún no llegas, usa la dominada asistida."),
        e("press-militar-mancuerna", 3, 8, 12, 90),
        e("curl-con-barra", 3, 10, 12, 60),
        e("press-de-banca-con-agarre-cerrado", 3, 8, 12, 75),
      ],
      [
        e("peso-muerto-convencional", 3, 5, 6, 180, "Técnica por delante del peso: pide a alguien que te vea."),
        e("prensa-de-piernas", 4, 10, 12, 90),
        e("peso-muerto-rumano-con-mancuernas", 3, 10, 12, 90),
        e("hip-thrust-con-barra", 3, 8, 12, 90),
        e("elevacion-de-talones-a-dos-piernas", 4, 12, 15, 60),
        e("abdominales", 3, 12, 15, 45),
      ],
    ],
  },
  {
    slug: "empuje-tiron-pierna-6-dias",
    name: "Empuje / tirón / pierna (6 días)",
    description:
      "Seis sesiones a la semana: empuje (pecho, hombros y tríceps), tirón (espalda y bíceps) y pierna, cada bloque dos veces. Es una rutina exigente para personas con experiencia y buena recuperación.\n\n" +
      "Cómo seguirla: ordena los días como empuje, tirón, pierna, empuje, tirón, pierna, con un día libre a la semana. Duerme lo suficiente y cuida la alimentación: con tanto volumen, el descanso es parte del entrenamiento. Si notas fatiga que no se va o dolor en alguna articulación, baja el volumen una semana.\n\n" +
      AVISO,
    goal: "hipertrofia",
    level: "avanzado",
    dias: [
      [
        e("press-de-banca", 4, 6, 10, 120),
        e("press-militar-mancuerna", 3, 8, 12, 90),
        e("press-de-banca-con-mancuernas", 3, 8, 12, 90),
        e("fondos-en-paralelas", 3, 6, 12, 90),
        e("extension-de-triceps", 3, 10, 12, 60),
      ],
      [
        e("dominadas", 4, 4, 8, 120, "Si aún no llegas, usa la dominada asistida."),
        e("remo-con-barra-agarre-prono", 4, 6, 10, 120),
        e("jalon-al-pecho", 3, 8, 12, 90),
        e("curl-con-barra", 3, 8, 12, 60),
        e("face-pull-inclinado-con-mancuernas", 3, 12, 15, 60),
      ],
      [
        e("sentadillas", 4, 5, 8, 150),
        e("peso-muerto-rumano-con-barra", 3, 8, 10, 120),
        e("prensa-de-piernas", 3, 10, 12, 90),
        e("curl-femoral", 3, 10, 12, 75),
        e("elevacion-de-talones-a-dos-piernas", 4, 12, 15, 60),
      ],
      [
        e("press-de-banca-con-mancuernas", 4, 8, 12, 90),
        e("press-de-hombros-con-barra", 3, 6, 10, 120),
        e("fondos-en-paralelas", 3, 6, 12, 90),
        e("press-de-triceps-sentado", 3, 10, 12, 60),
        e("flexiones-diamante", 3, 8, 15, 60),
      ],
      [
        e("dominadas-con-agarre-supino", 3, 6, 10, 120),
        e("remo-con-mancuernas", 4, 8, 12, 90, "Hazlo con cada brazo."),
        e("remo-en-polea-baja-agarre-estrecho", 3, 10, 12, 90),
        e("curl-con-mancuernas-sentado", 3, 10, 12, 60),
        e("face-pull-inclinado-con-mancuernas", 3, 12, 15, 60),
      ],
      [
        e("peso-muerto-convencional", 3, 4, 6, 180, "Técnica por delante del peso."),
        e("zancadas-con-mancuernas", 3, 10, 10, 90, "Repeticiones por cada pierna."),
        e("hip-thrust-con-barra", 3, 8, 12, 90),
        e("extension-de-cuadriceps-a-una-pierna", 3, 10, 12, 75),
        e("gemelos-en-prensa", 4, 12, 15, 60),
        e("abdominales", 3, 12, 15, 45),
      ],
    ],
  },
  {
    slug: "fuerza-basica-3-dias",
    name: "Fuerza básica (3 días)",
    description:
      "Pocas series, pocos ejercicios y cargas pesadas con 5 repeticiones. Está pensada para ganar fuerza en los movimientos básicos: sentadilla, press de banca, remo, press de hombros y peso muerto.\n\n" +
      "Cómo seguirla: entrena en días alternos. Empieza con un peso con el que llegues sobrado a las 5 repeticiones y súbelo poco a poco, sesión a sesión. Descansa de 2 a 3 minutos entre series pesadas. Es importante aprender bien la técnica antes de cargar peso: si puedes, pide que alguien te la revise.\n\n" +
      AVISO,
    goal: "fuerza",
    level: "intermedio",
    dias: [
      [
        e("sentadillas", 5, 5, 5, 180),
        e("press-de-banca", 5, 5, 5, 180),
        e("remo-con-barra-agarre-prono", 5, 5, 5, 150),
      ],
      [
        e("sentadillas", 3, 5, 5, 180, "Más ligera que el primer día."),
        e("press-de-hombros-con-barra", 5, 5, 5, 180),
        e("peso-muerto-convencional", 1, 5, 5, 240, "Una sola serie pesada de 5 repeticiones."),
      ],
      [
        e("sentadillas", 5, 5, 5, 180),
        e("press-de-banca", 5, 5, 5, 180),
        e("remo-con-barra-agarre-prono", 5, 5, 5, 150),
      ],
    ],
  },
  {
    slug: "movilidad-en-casa",
    name: "Movilidad en casa",
    description:
      "Sesiones suaves y cortas (unos 15-20 minutos) para moverte con más soltura: columna, caderas, hombros y piernas. No necesitas material, solo un poco de espacio y una esterilla o una toalla.\n\n" +
      "Cómo seguirla: hazla tres días a la semana o más. Muévete sin dolor: notar tensión es normal, notar dolor no. No rebotes en los estiramientos y respira con calma. Es un buen complemento de cualquier otra rutina.\n\n" +
      AVISO,
    goal: "movilidad",
    level: "principiante",
    dias: [
      [
        e("gato-vaca-movilidad-espinal", 2, 8, 10, 30, "Mueve la columna despacio, coordinado con la respiración."),
        tiempo("estiramiento-de-rotacion-del-torso", 2, "unos 30 segundos por lado", 20),
        tiempo("estiramiento-del-flexor-de-cadera-con-pie-trasero-elevado", 2, "unos 30 segundos por lado", 20),
        tiempo("estiramiento-de-rodilla-al-pecho", 2, "unos 30 segundos por lado", 20),
        tiempo("estiramiento-de-gemelos-de-pie", 2, "unos 30 segundos por lado", 20),
      ],
      [
        e("bird-dog", 2, 8, 8, 30, "Repeticiones por cada lado, sin balancear la espalda."),
        tiempo("estiramiento-de-rana", 2, "de 30 a 45 segundos", 20),
        tiempo("estiramiento-cruzado-de-isquiotibiales", 2, "unos 30 segundos por lado", 20),
        tiempo("estiramiento-de-pectoral-en-el-marco-de-la-puerta", 2, "unos 30 segundos", 20),
        tiempo("estiramiento-de-cuatro-sentado", 2, "unos 30 segundos por lado", 20),
      ],
      [
        e("gato-vaca-movilidad-espinal", 2, 8, 10, 30),
        e("superman", 2, 8, 10, 30, "Sube despacio y sin forzar el cuello."),
        e("puente-de-cadera", 2, 10, 10, 30),
        tiempo("estiramiento-de-rotacion-del-torso", 2, "unos 30 segundos por lado", 20),
        tiempo("estiramiento-de-rodilla-al-pecho", 2, "unos 30 segundos por lado", 20),
        tiempo("estiramiento-de-gemelos-de-pie", 2, "unos 30 segundos por lado", 20),
      ],
    ],
  },
  {
    slug: "iniciacion-sin-material",
    name: "Iniciación sin material (3 días)",
    description:
      "Tres sesiones a la semana que se hacen en casa, sin ningún material, con el peso de tu propio cuerpo. Sirve para empezar a moverte con constancia y crear el hábito.\n\n" +
      "Cómo seguirla: entrena en días alternos. Si una serie te resulta muy fácil, hazla más despacio o añade repeticiones; si no llegas, haz menos y descansa más. Lo importante es la regularidad, no la intensidad. Cuando completes todas las series con comodidad durante dos semanas, pasa a la rutina de cuerpo completo.\n\n" +
      AVISO,
    goal: "resistencia",
    level: "principiante",
    dias: [
      [
        e("sentadillas-sumo", 3, 10, 15, 60),
        e("flexiones-de-rodillas", 3, 6, 12, 60),
        e("puente-de-cadera", 3, 12, 15, 45),
        tiempo("plancha-frontal", 3, "de 20 a 30 segundos"),
        e("zancada-con-el-peso-corporal", 2, 8, 10, 60, "Repeticiones por cada pierna."),
      ],
      [
        e("abdominales", 3, 10, 15, 45),
        e("superman", 3, 10, 10, 45),
        e("flexiones-de-rodillas", 3, 6, 12, 60),
        e("sentadillas-sumo", 3, 10, 15, 60),
        e("bird-dog", 3, 8, 8, 45, "Repeticiones por cada lado."),
      ],
      [
        e("zancada-con-el-peso-corporal", 3, 8, 10, 60, "Repeticiones por cada pierna."),
        e("puente-de-cadera", 3, 12, 15, 45),
        e("flexiones-de-rodillas", 3, 6, 12, 60),
        tiempo("plancha-frontal", 3, "de 20 a 30 segundos"),
        e("elevacion-de-talones-a-dos-piernas", 3, 15, 15, 45),
      ],
    ],
  },
];

// Convierte una plantilla en el borrador que valida `validateRoutine`.
// `idDe` traduce el slug del ejercicio a su id real (en los tests basta con un número cualquiera).
export function aBorrador(p: Plantilla, idDe: (slug: string) => number): RoutineDraft {
  return {
    name: p.name,
    goal: p.goal,
    level: p.level,
    days_per_week: p.dias.length,
    exercises: p.dias.flatMap((dia, i) =>
      dia.map((x) => ({
        exercise_id: idDe(x.slug),
        day_index: i + 1,
        sets: x.series,
        reps_min: x.reps[0],
        reps_max: x.reps[1],
        rest_seconds: x.descanso,
      })),
    ),
  };
}
