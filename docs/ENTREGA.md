# Entrega de KleyBom (versión 0.5)

Fecha: 21 de octubre de 2026.

## Dónde está todo

| Qué | Dónde |
|---|---|
| Web publicada | https://forja-five-zeta.vercel.app |
| Código | https://github.com/Rubenpd66/forja (privado) |
| Base de datos y cuentas | Supabase, proyecto `forja` (servidores en Fráncfort) |
| Publicación | Vercel, proyecto `forja`: cada vez que se sube código a GitHub se publica solo en 1-2 minutos |
| Claves | Solo en `.env.local` (tu ordenador) y en Vercel. Nunca en GitHub |

## Qué tiene la web

- **Ejercicios:** 810 fichas (wger) con buscador, filtros y mapa del cuerpo para elegir músculo.
- **Rutinas:** 6 plantillas, creador de rutinas propias e impresión en PDF.
- **Calendario:** planificar sesiones y marcarlas como hechas o saltadas.
- **Entreno:** registro de series en directo, temporizador de descanso y comparación con la última vez.
- **Nutrición:** 6.038 alimentos en español, productos por código de barras (Open Food Facts), calculadora de calorías y diario de comidas.
- **Recetas:** 10 recetas con calorías por ración.
- **Estadísticas:** constancia, volumen semanal, fuerza estimada y peso con media móvil.
- **Guías:** 5 guías con fuentes (OMS, ACSM y otras).
- **Cuenta:** perfil, medidas, descarga de tus datos en JSON y borrado de cuenta.
- **Legal:** aviso legal, privacidad y cookies; consentimiento para los datos de salud.

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

1. **Supabase** → Authentication → URL Configuration:
   - En **Site URL** pon `https://forja-five-zeta.vercel.app`.
   - En **Redirect URLs** añade `https://forja-five-zeta.vercel.app/auth/callback**`.
   - Sin esto, el correo de confirmación del registro no funciona bien.
2. **Supabase** → Authentication → activa la **protección contra contraseñas filtradas**.
3. **Vercel** → Settings → Environment Variables:
   - Añade `NEXT_PUBLIC_SITE_URL` con el valor `https://forja-five-zeta.vercel.app`.
   - Después pulsa en volver a desplegar ("Redeploy").
4. **Opcional:** cambiar el nombre del proyecto en Vercel a `kleybom` para tener una dirección con el nombre nuevo. Si lo haces, hay que actualizar las direcciones de los puntos 1 y 3.
5. **Revisión profesional de los textos legales** antes de dar publicidad a la web.

## Pendiente para más adelante

- **Donaciones:** decidiste dejarlas para el final.
- **Visor 3D:** aplazado. El mapa 2D cubre la necesidad.
- **Contenido por revisar cuando quieras:**
  - 223 ejercicios siguen en inglés.
  - Todos los ejercicios tienen el nivel provisional "intermedio".
  - Revisar las traducciones de alimentos y las recetas.
- **Productos de Open Food Facts:** no se pueden apuntar en el diario. Se consultan en directo para cumplir su licencia.

## Para trabajar en el código (resumen)

- **Arrancar en tu ordenador:** `npm run dev` y abrir http://localhost:3000.
- **Pruebas:** `npm test` (lógica) y `npm run test:e2e` (navegador).
- **Medir Lighthouse con sesión:** `node scripts/lighthouse-sesion.mjs http://localhost:3100 /panel`, con la web arrancada con `npm run build` y `npx next start -p 3100`.
- **Más información:**
  - El estado detallado está en `docs/PROGRESO.md`.
  - Las fuentes y licencias de los datos están en `docs/datos-fuentes.md`.
  - El estilo de las imágenes y sus prompts están en `docs/estilo-imagenes.md`.
