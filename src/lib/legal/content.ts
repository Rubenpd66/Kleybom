// Textos legales de KleyBom. Redactados como base; conviene que los revise un profesional antes de darlos por definitivos.
import type { Bloque, Seccion } from "@/lib/guides/content";
import { TITULAR as T } from "./titular";

export type TextoLegal = { slug: "aviso-legal" | "privacidad" | "cookies"; titulo: string; resumen: string; secciones: Seccion[] };

const p = (texto: string): Bloque => ({ tipo: "p", texto });
const lista = (...items: string[]): Bloque => ({ tipo: "lista", items });

export const AVISO_LEGAL: TextoLegal = {
  slug: "aviso-legal",
  titulo: "Aviso legal",
  resumen: "Quién está detrás de KleyBom, condiciones de uso y origen de los datos de ejercicios y alimentos.",
  secciones: [
    {
      titulo: "Titular de la web",
      bloques: [
        p("En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI), estos son los datos del titular:"),
        lista(`Nombre: ${T.nombre}`, `NIF: ${T.nif}`, `Domicilio: ${T.domicilio}`, `Correo de contacto: ${T.correo}`),
      ],
    },
    {
      titulo: "Qué es KleyBom",
      bloques: [
        p("KleyBom es una web gratuita de fitness y salud: catálogo de ejercicios, rutinas, calendario, base de alimentos, diario de comidas, registro de entrenos y estadísticas. No vende productos ni servicios, no tiene planes de pago y no muestra publicidad."),
      ],
    },
    {
      titulo: "Aviso de salud",
      bloques: [
        p("La información de KleyBom es general y no sustituye a un médico, dietista-nutricionista o entrenador. Los cálculos (calorías, macronutrientes, fuerza estimada) son aproximaciones. Si tienes una enfermedad, estás embarazada, tomas medicación o hace tiempo que no haces ejercicio, consulta antes con un profesional sanitario."),
      ],
    },
    {
      titulo: "Condiciones de uso",
      bloques: [
        lista(
          "Puedes usar KleyBom gratis para fines personales.",
          "No está permitido intentar acceder a datos de otras personas, sobrecargar el servicio de forma automatizada ni usarlo para fines ilegales.",
          "El titular puede cambiar, ampliar o dejar de ofrecer funciones, y procurará avisar con antelación de los cambios importantes.",
          "El titular no se hace responsable de los daños derivados de un uso de la información distinto al indicado en el aviso de salud.",
        ),
      ],
    },
    {
      titulo: "Origen de los datos y licencias",
      bloques: [
        lista(
          "Ejercicios: wger (wger.de), con licencias Creative Commons BY-SA y CC0. Cada ficha indica su autor y licencia; los textos derivados se comparten con la misma licencia.",
          "Alimentos: USDA FoodData Central, SR Legacy (dominio público, CC0). Nombres traducidos por KleyBom.",
          "Productos envasados: Open Food Facts (licencia ODbL), consultados en directo y con enlace a su ficha.",
          "Guías, rutinas plantilla y recetas: redactadas por KleyBom, con sus fuentes citadas.",
        ),
        p("El diseño, el código y los textos propios de KleyBom pertenecen a su titular, salvo lo indicado arriba."),
      ],
    },
    {
      titulo: "Ley aplicable",
      bloques: [p("Este aviso se rige por la ley española. Para cualquier duda o reclamación puedes escribir al correo de contacto.")],
    },
  ],
};

export const PRIVACIDAD: TextoLegal = {
  slug: "privacidad",
  titulo: "Política de privacidad",
  resumen: "Qué datos guarda KleyBom, para qué, durante cuánto tiempo y cómo ejercer tus derechos.",
  secciones: [
    {
      titulo: "Responsable del tratamiento",
      bloques: [lista(`${T.nombre} (NIF ${T.nif})`, `Domicilio: ${T.domicilio}`, `Correo: ${T.correo}`)],
    },
    {
      titulo: "Qué datos tratamos",
      bloques: [
        lista(
          "Sin cuenta: ningún dato personal. KleyBom no usa analítica, publicidad ni cookies de seguimiento.",
          "Cuenta: correo electrónico y contraseña (guardada cifrada, nunca la vemos), y la fecha en que aceptaste esta política.",
          "Si entras con Google: Google nos envía tu correo, tu nombre y tu foto de perfil. No recibimos tu contraseña de Google ni ningún otro dato de tu cuenta.",
          "Perfil (opcional): nombre, sexo, fecha de nacimiento, altura y zona horaria.",
          "Datos de salud que tú apuntes: peso y medidas corporales, comidas, objetivos de nutrición, entrenos y series. Son una categoría especial de datos (artículo 9 del RGPD).",
          "Datos técnicos: el proveedor de alojamiento registra la dirección IP y la hora de cada visita para seguridad y funcionamiento.",
        ),
      ],
    },
    {
      titulo: "Para qué y con qué base legal",
      bloques: [
        lista(
          "Crear y mantener tu cuenta y mostrarte tus rutinas, calendario y diario: ejecución del servicio que pides (art. 6.1.b RGPD).",
          "Guardar y mostrarte tus datos de salud y estadísticas: tu consentimiento explícito, que das al registrarte (art. 9.2.a RGPD). Puedes retirarlo cuando quieras borrando esos datos o tu cuenta, sin que afecte a lo hecho antes.",
          "Seguridad y prevención de abusos (registros técnicos): interés legítimo (art. 6.1.f RGPD).",
        ),
        p("Tus datos no se venden, no se ceden a terceros con fines comerciales, no se usan para publicidad ni para decisiones automatizadas con efectos sobre ti."),
      ],
    },
    {
      titulo: "Quién nos ayuda a prestar el servicio",
      bloques: [
        lista(
          "Supabase (base de datos, cuentas y correos de confirmación). Los datos se guardan en servidores de la Unión Europea (Fráncfort, Alemania).",
          "Vercel (alojamiento de la web). Puede tratar datos técnicos fuera del Espacio Económico Europeo con las garantías que exige el RGPD, como las cláusulas contractuales tipo de la Comisión Europea.",
        ),
        p("Ambos actúan como encargados del tratamiento y solo usan los datos para prestar su servicio a KleyBom."),
        p("Si eliges entrar con Google, Google comprueba tu identidad según su propia política de privacidad. Es opcional: siempre puedes usar tu correo y una contraseña."),
      ],
    },
    {
      titulo: "Cuánto tiempo los guardamos",
      bloques: [
        p("Mientras mantengas tu cuenta. Puedes borrar cualquier medida, comida o entreno en todo momento. Si borras la cuenta desde tu perfil, se eliminan de inmediato tu cuenta y todos tus datos. Las copias de seguridad del proveedor se sobrescriben en su ciclo habitual."),
      ],
    },
    {
      titulo: "Tus derechos",
      bloques: [
        p("Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad:"),
        lista(
          "Desde la web: edita tu perfil, borra datos sueltos, descarga todos tus datos en JSON desde tu panel o borra tu cuenta.",
          `Por correo: escribe a ${T.correo} desde el correo de tu cuenta. Responderemos en un plazo máximo de un mes.`,
          "Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).",
        ),
      ],
    },
    {
      titulo: "Edad mínima",
      bloques: [
        p("Para crear una cuenta debes tener 14 años o más (artículo 7 de la Ley Orgánica 3/2018). Los cálculos de nutrición están pensados para personas adultas."),
      ],
    },
    {
      titulo: "Seguridad",
      bloques: [
        p("La conexión va cifrada (HTTPS) y la base de datos solo deja a cada persona leer y modificar sus propios datos. Si detectamos una brecha de seguridad que afecte a tus datos, te avisaremos y lo comunicaremos a la autoridad de control cuando la ley lo exija."),
      ],
    },
  ],
};

export const COOKIES: TextoLegal = {
  slug: "cookies",
  titulo: "Política de cookies",
  resumen: "KleyBom solo usa las cookies técnicas imprescindibles para mantener la sesión abierta.",
  secciones: [
    {
      titulo: "Qué cookies usamos",
      bloques: [
        p("KleyBom solo usa cookies técnicas, necesarias para que puedas entrar en tu cuenta. No usa cookies de analítica, de publicidad ni de redes sociales, y no hay contenido de terceros que las instale."),
        lista(
          "sb-…-auth-token (propia, de Supabase): guarda tu sesión cuando entras. Se borra al cerrar sesión o cuando caduca la sesión.",
        ),
        p("Las tipografías se sirven desde nuestro propio servidor, así que tu navegador no se conecta a Google Fonts."),
      ],
    },
    {
      titulo: "Por qué no hay banner de cookies",
      bloques: [
        p("Las cookies técnicas necesarias para prestar un servicio que pides están exentas de consentimiento (artículo 22.2 de la LSSI). Por eso no te pedimos permiso; solo te informamos. Si algún día añadimos cookies que no sean técnicas, te pediremos tu consentimiento antes de instalarlas."),
      ],
    },
    {
      titulo: "Cómo borrarlas",
      bloques: [p("Puedes borrar o bloquear las cookies desde la configuración de tu navegador. Si bloqueas la de sesión, podrás consultar ejercicios, alimentos, recetas y guías, pero no entrar en tu cuenta.")],
    },
  ],
};
