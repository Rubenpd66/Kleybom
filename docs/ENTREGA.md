# Entrega de KleyBom (versión 0.6)

Fecha: 22 de octubre de 2026.

## Dónde está todo

| Qué | Dónde |
|---|---|
| Web publicada | https://forja-five-zeta.vercel.app |
| Código | https://github.com/Rubenpd66/forja (privado) |
| Base de datos y cuentas | Supabase, proyecto `forja` (servidores en Fráncfort) |
| Publicación | Vercel, proyecto `forja`: cada vez que se sube código a GitHub se publica solo en 1-2 minutos |
| Claves | Solo en `.env.local` (tu ordenador) y en Vercel. Nunca en GitHub |

## Qué tiene la web

- **Ejercicios:** 810 fichas (wger) con buscador, filtros y mapa del cuerpo para elegir músculo. Cada una con imagen: foto de wger (164, revisadas) o dibujo de los músculos que trabaja.
- **Rutinas:** 12 plantillas (fuerza, hipertrofia, movilidad, yoga suave, pilates y core, HIIT, cardio en zona 2, estiramientos y funcional con kettlebell), creador de rutinas propias e impresión en PDF.
- **Calendario:** planificar sesiones y marcarlas como hechas o saltadas.
- **Entreno:** registro de series en directo, temporizador de descanso y comparación con la última vez.
- **Nutrición:** 6.038 alimentos en español, cada uno con foto de su tipo (98 fotos de Wikimedia Commons), productos por código de barras (Open Food Facts), calculadora de calorías y diario de comidas con paneles de objetivos, alimentos y recetas.
- **Recetas:** 30 recetas con foto y calorías por ración.
- **Estadísticas:** constancia, volumen semanal, fuerza estimada y peso con media móvil.
- **Guías:** 9 guías con fuentes (OMS, ACSM, NCCIH y otras), entre ellas meditación, yoga, flexibilidad y equilibrio, y cardio.
- **Buscador y menú:** buscador de toda la web en la cabecera (secciones, ejercicios, rutinas, recetas, alimentos y guías; página completa en `/buscar`) y menú lateral con todas las secciones, que se abre con el botón "Menú" o al acercar el ratón al borde derecho.
- **Cuenta:** con correo o con Google; perfil, medidas, descarga de tus datos en JSON y borrado de cuenta.
- **Idiomas:** español e inglés (botón ES | EN junto al de tema). Cambia toda la web, también ejercicios, alimentos, recetas, rutinas, guías y textos legales.
- **Legal:** aviso legal, privacidad y cookies; consentimiento para los datos de salud.
- **Diseño:** minimalista, en modo claro u oscuro (botón sol/luna), con búsqueda en vivo y un fondo 3D distinto en cada sección (en móvil, versión ligera que aparece al tocar o desplazar).

Sin cuenta se puede ver y probar todo. Solo hace falta entrar para guardar.

## Calidad comprobada

- **Lighthouse en la web publicada:**
  - Rendimiento: entre 94 y 99.
  - Accesibilidad, buenas prácticas y SEO: 100.
  - Las páginas personales tienen SEO 66 a propósito, para que Google no las indexe.
- **Pruebas automáticas:**
  - 241 pruebas de lógica.
  - 151 pruebas en navegador, en escritorio y en móvil.
  - Incluyen seguridad: una persona no puede ver ni tocar los datos de otra.

## Lo que falta por hacer (te toca a ti)

1. **Activar el inicio de sesión con Google** (hasta entonces, el botón "Continuar con Google" da un aviso de error):
   - En Google Cloud Console crea un "ID de cliente de OAuth" de tipo "Aplicación web".
   - En "URI de redirección autorizados" pon `https://gftajanocydijwtzvjhe.supabase.co/auth/v1/callback`.
   - Copia el ID de cliente y el secreto en Supabase → Authentication → Sign In / Providers → Google, y actívalo.
2. **Opcional:** cambiar el nombre del proyecto en Vercel a `kleybom`. Si lo haces, hay que actualizar la dirección en Supabase (Site URL y Redirect URLs) y en `NEXT_PUBLIC_SITE_URL` de Vercel.
3. **Revisión profesional de los textos legales** antes de dar publicidad a la web (se añadieron Google y la cookie de idioma).

## Pendiente para más adelante

- **Donaciones:** decidiste dejarlas para el final.
- **Visor 3D:** aplazado. El mapa 2D cubre la necesidad.
- **Contenido por revisar cuando quieras:**
  - 223 ejercicios siguen en inglés en la versión española.
  - El inglés de los ejercicios y alimentos es el original de wger y USDA (a veces con mayúsculas raras).
  - Todos los ejercicios tienen el nivel provisional "intermedio".
  - Revisar las traducciones de alimentos y las recetas.
- **Productos de Open Food Facts:** no se pueden apuntar en el diario. Se consultan en directo para cumplir su licencia.

## Para trabajar en el código (resumen)

- **Arrancar en tu ordenador:** `npm run dev` y abrir http://localhost:3000.
- **Pruebas:** `npm test` (lógica) y `npm run test:e2e` (navegador).
- **Medir Lighthouse con sesión:** `node scripts/lighthouse-sesion.mjs http://localhost:3100 /panel`, con la web arrancada con `npm run build` y `npx next start -p 3100`.
- **Más información:**
  - El estado detallado está en `docs/PROGRESO.md`.
  - Las fuentes y licencias de los datos y las fotos están en `docs/datos-fuentes.md`.
  - Cómo funcionan los idiomas: `src/lib/i18n/` (diccionarios `es.ts` y `en.ts`) y `src/proxy.ts`.
  - El estilo de las imágenes y sus prompts están en `docs/estilo-imagenes.md`.
