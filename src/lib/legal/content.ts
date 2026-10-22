// Textos legales de KleyBom. Redactados como base; conviene que los revise un profesional antes de darlos por definitivos.
// Se adaptan a lo que esté activo: con publicidad (AdSense) o donaciones (Stripe) añaden sus apartados;
// sin ellas dicen que no hay. Así el texto siempre coincide con lo que hace la web.
import type { Bloque, Seccion } from "@/lib/guides/content";
import { TITULAR as T } from "./titular";

export type TextoLegal = { slug: "aviso-legal" | "privacidad" | "cookies"; titulo: string; resumen: string; secciones: Seccion[] };
export type Activos = { anuncios: boolean; donaciones: boolean };

const p = (texto: string): Bloque => ({ tipo: "p", texto });
const lista = (...items: string[]): Bloque => ({ tipo: "lista", items });
const si = <X,>(condicion: boolean, ...x: X[]): X[] => (condicion ? x : []);

// Dónde puede haber anuncios (y dónde nunca), igual en los tres textos.
const FICHAS = "las fichas públicas de guías, recetas, ejercicios, alimentos y rutinas";
const SIN_ANUNCIOS = "la portada, los listados, tu zona personal (panel, diario, calendario, entrenos, estadísticas, medidas), el inicio de sesión y estos textos legales";
const ENLACE_AJUSTES = "«Privacidad y cookies», en el pie de todas las páginas";

export function avisoLegal({ anuncios, donaciones }: Activos): TextoLegal {
  const financiacion =
    anuncios && donaciones
      ? " Se financia con publicidad de Google AdSense y con donaciones voluntarias."
      : anuncios
        ? " Se financia con publicidad de Google AdSense."
        : donaciones
          ? " Se financia con donaciones voluntarias y no muestra publicidad."
          : " No muestra publicidad.";
  return {
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
          p(
            "KleyBom es una web gratuita de fitness y salud: catálogo de ejercicios, rutinas, calendario, base de alimentos, diario de comidas, registro de entrenos y estadísticas. No vende productos ni servicios y no tiene planes de pago." +
              financiacion,
          ),
        ],
      },
      {
        titulo: "Aviso de salud",
        bloques: [
          p("La información de KleyBom es general y no sustituye a un médico, dietista-nutricionista o entrenador. Los cálculos (calorías, macronutrientes, fuerza estimada) son aproximaciones. Si tienes una enfermedad, estás embarazada, tomas medicación o hace tiempo que no haces ejercicio, consulta antes con un profesional sanitario."),
        ],
      },
      ...si(anuncios, {
        titulo: "Publicidad",
        bloques: [
          p(`Los anuncios aparecen solo en ${FICHAS}, siempre señalados como «Publicidad». Nunca en ${SIN_ANUNCIOS}.`),
          p("Los anuncios los selecciona y sirve Google. KleyBom no elige a los anunciantes ni respalda sus productos: que un anuncio aparezca junto a un contenido de salud no significa que KleyBom lo recomiende. Antes de comprar un producto relacionado con la salud, consulta con un profesional."),
          p("KleyBom no comparte con Google ni con los anunciantes los datos de tu cuenta ni tus datos de salud."),
        ],
      }),
      ...si(donaciones, {
        titulo: "Donaciones",
        bloques: [
          lista(
            "Las donaciones son voluntarias y no dan acceso a nada: todo el mundo tiene la misma web, done o no.",
            "El pago se hace en la página de Stripe, que lo gestiona. KleyBom nunca ve ni guarda los datos de tu tarjeta.",
            "KleyBom no es una entidad sin ánimo de lucro: las donaciones no dan derecho a deducciones fiscales y no se emiten certificados de donación.",
            "Si te has equivocado al donar, escribe al correo de contacto lo antes posible indicando la fecha y el importe.",
          ),
        ],
      }),
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
            "Fotos de alimentos y recetas: Wikimedia Commons, con licencias libres; cada ficha indica su autor y licencia.",
            "Guías, rutinas plantilla y recetas: redactadas por KleyBom, con sus fuentes citadas.",
          ),
          p("El diseño, el código y los textos propios de KleyBom pertenecen a su titular, salvo lo indicado arriba."),
        ],
      },
      {
        titulo: "Contacto y ley aplicable",
        bloques: [
          p("Para cualquier duda, reclamación o para avisar de un contenido ilegal o de un fallo de seguridad, escribe al correo de contacto; contestaremos lo antes posible, en español o en inglés. Este aviso se rige por la ley española."),
        ],
      },
    ],
  };
}

export function privacidad({ anuncios, donaciones }: Activos): TextoLegal {
  return {
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
            anuncios
              ? `Sin cuenta: KleyBom no guarda ningún dato personal tuyo. No usa analítica. En ${FICHAS}, Google puede usar cookies e identificadores de tu dispositivo según lo que elijas en el aviso de consentimiento (ver «Publicidad» más abajo).`
              : "Sin cuenta: ningún dato personal. KleyBom no usa analítica, publicidad ni cookies de seguimiento.",
            "Cuenta: correo electrónico y contraseña (guardada cifrada, nunca la vemos), y la fecha en que aceptaste esta política.",
            "Si entras con Google: Google nos envía tu correo, tu nombre y tu foto de perfil. No recibimos tu contraseña de Google ni ningún otro dato de tu cuenta.",
            "Perfil (opcional): nombre, sexo, fecha de nacimiento, altura y zona horaria.",
            "Datos de salud que tú apuntes: peso y medidas corporales, comidas, objetivos de nutrición, entrenos y series. Son una categoría especial de datos (artículo 9 del RGPD).",
            ...si(donaciones, "Si donas: Stripe nos comunica el nombre y el correo que le des, el importe, la fecha y el país del pago. Nunca recibimos los datos de tu tarjeta."),
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
            ...si(
              donaciones,
              "Gestionar tu donación y contestar tus consultas sobre ella: la donación que haces (art. 6.1.b RGPD). Llevar la contabilidad y cumplir las obligaciones fiscales: obligación legal (art. 6.1.c RGPD).",
            ),
            ...si(anuncios, "Publicidad en las fichas públicas: tu consentimiento, que das o niegas en el aviso de cookies (art. 6.1.a RGPD y art. 22.2 LSSI). Puedes cambiarlo cuando quieras."),
          ),
          p("Tus datos no se venden ni se ceden a terceros con fines comerciales. Los datos de tu cuenta y tus datos de salud no se usan para publicidad ni se comparten con anunciantes, y no se toman decisiones automatizadas con efectos sobre ti."),
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
          ...si(
            donaciones,
            p("Donaciones: Stripe Payments Europe, Limited (Irlanda) procesa el pago como responsable de sus propios tratamientos, según su política de privacidad (stripe.com/es/privacy). Puede transferir datos a Stripe, Inc. (Estados Unidos) con las garantías que exige el RGPD."),
          ),
        ],
      },
      ...si(anuncios, {
        titulo: "Publicidad",
        bloques: [
          p(`Los anuncios de ${FICHAS} los sirve Google Ireland Limited (Google AdSense). Google y sus socios publicitarios actúan como responsables de sus propios tratamientos: según lo que elijas en el aviso de consentimiento, pueden usar cookies e identificadores para mostrar anuncios, limitar cuántas veces ves el mismo, medir su rendimiento, evitar el fraude y, si lo aceptas, mostrarte anuncios personalizados. El aviso lista a cada proveedor con su finalidad.`),
          p("Google puede transferir datos a Estados Unidos con las garantías del Marco de Privacidad de Datos UE-EE. UU. Más información: «Cómo usa Google la información de los sitios que usan sus servicios» (policies.google.com/technologies/partner-sites) y la política de privacidad de Google (policies.google.com/privacy)."),
          p(`Puedes cambiar tu elección en cualquier momento desde ${ENLACE_AJUSTES}. Rechazar la publicidad personalizada no limita nada de la web.`),
        ],
      }),
      {
        titulo: "Cuánto tiempo los guardamos",
        bloques: [
          p("Mientras mantengas tu cuenta. Puedes borrar cualquier medida, comida o entreno en todo momento. Si borras la cuenta desde tu perfil, se eliminan de inmediato tu cuenta y todos tus datos. Las copias de seguridad del proveedor se sobrescriben en su ciclo habitual."),
          ...si(donaciones, p("Los datos de las donaciones se conservan el tiempo que exija la normativa fiscal y mercantil (habitualmente entre cuatro y seis años) y después se borran.")),
          ...si(anuncios, p("Las cookies de publicidad duran lo que indica cada proveedor en el aviso de consentimiento; puedes borrarlas desde tu navegador.")),
        ],
      },
      {
        titulo: "Tus derechos",
        bloques: [
          p("Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad:"),
          lista(
            "Desde la web: edita tu perfil, borra datos sueltos, descarga todos tus datos en JSON desde tu panel o borra tu cuenta.",
            ...si(anuncios, `Publicidad: cambia o retira tu consentimiento desde ${ENLACE_AJUSTES}.`),
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
}

export function cookies({ anuncios, donaciones }: Activos): TextoLegal {
  return {
    slug: "cookies",
    titulo: "Política de cookies",
    resumen: anuncios
      ? "Cookies técnicas para la sesión y el idioma, y cookies de publicidad de Google solo si las aceptas."
      : "KleyBom solo usa las cookies técnicas imprescindibles para mantener la sesión abierta y recordar el idioma.",
    secciones: [
      {
        titulo: anuncios ? "Cookies técnicas" : "Qué cookies usamos",
        bloques: [
          p(
            anuncios
              ? "Son necesarias para que puedas entrar en tu cuenta y para recordar el idioma. Están en todas las páginas:"
              : "KleyBom solo usa cookies técnicas, necesarias para que puedas entrar en tu cuenta y para recordar el idioma que eliges. No usa cookies de analítica, de publicidad ni de redes sociales, y no hay contenido de terceros que las instale.",
          ),
          lista(
            "sb-…-auth-token (propia, de Supabase): guarda tu sesión cuando entras. Se borra al cerrar sesión o cuando caduca la sesión.",
            "idioma (propia): recuerda el idioma que eliges (español o inglés). Se crea al cambiar de idioma o al entrar en la versión inglesa (/en) y dura un año.",
          ),
          p("Las tipografías se sirven desde nuestro propio servidor, así que tu navegador no se conecta a Google Fonts."),
          p("Las cookies técnicas necesarias para prestar un servicio que pides, como mantener la sesión o recordar el idioma que has elegido, están exentas de consentimiento (artículo 22.2 de la LSSI). Por eso no te pedimos permiso para ellas; solo te informamos."),
        ],
      },
      ...si(anuncios, {
        titulo: "Cookies de publicidad (Google AdSense)",
        bloques: [
          p(`Solo en ${FICHAS}. Google y sus socios publicitarios pueden instalar cookies o leer identificadores de tu dispositivo para mostrar anuncios, limitar cuántas veces ves el mismo, medir su rendimiento y evitar el fraude y, si lo aceptas, para mostrarte anuncios personalizados según tus intereses. Son cookies de terceros.`),
          p(`No se instalan hasta que eliges en el aviso de consentimiento, que aparece la primera vez que entras en una de esas fichas. En él verás la lista completa de proveedores, sus finalidades y cuánto duran sus cookies, y podrás aceptar, rechazar o elegir por finalidad. Rechazar es igual de fácil que aceptar y la web funciona igual. Nunca hay publicidad en ${SIN_ANUNCIOS}.`),
          p("Más información sobre las cookies de publicidad de Google: business.safety.google/adscookies."),
        ],
      }),
      ...si(anuncios, {
        titulo: "Cómo cambiar tu elección",
        bloques: [p(`Puedes cambiar o retirar tu consentimiento en cualquier momento desde ${ENLACE_AJUSTES}.`)],
      }),
      ...si(donaciones, {
        titulo: "Donaciones",
        bloques: [p("El botón de donar te lleva a la página de Stripe (stripe.com). KleyBom no instala cookies de Stripe; Stripe usa las suyas en su propia página, según su política de cookies.")],
      }),
      ...si(!anuncios, {
        titulo: "Por qué no hay banner de cookies",
        bloques: [p("Como solo usamos cookies técnicas, no hace falta pedirte permiso. Si algún día añadimos cookies que no sean técnicas, te pediremos tu consentimiento antes de instalarlas.")],
      }),
      {
        titulo: "Cómo borrarlas",
        bloques: [p("Puedes borrar o bloquear las cookies desde la configuración de tu navegador. Si bloqueas la de sesión, podrás consultar ejercicios, alimentos, recetas y guías, pero no entrar en tu cuenta.")],
      },
    ],
  };
}
