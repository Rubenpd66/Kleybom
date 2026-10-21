# AGENTS.md — Memoria compartida del proyecto

Leída por Claude Code, Codex y Gemini. Estado actual en `docs/PROGRESO.md`.

## Proyecto
- **Nombre:** pendiente (se propone en la Fase 1; debe tener gancho y ser competitivo).
- **Idea:** web fitness y salud lo más completa posible: selector de ejercicios, calendario, rutinas, nutrición con una gran base de alimentos y estadísticas. Con información detallada de cada ejercicio, alimento y rutina.
- **Modelo:** gratuita. SIN sistema de pagos (por la carga legal). Solo donaciones voluntarias.
- **Idioma:** español (España) de entrada. Otros idiomas: por decidir.
- **Frontend:** animaciones y 3D solo donde aporten (p. ej. visor de ejercicios). Nunca deben complicar la lógica ni el rendimiento. Imágenes con Nano Banana (modelo de imágenes de Google).

## Stack (aprobado por el usuario)
- Next.js + Tailwind CSS (la web necesita cuentas de usuario, calendario y estadísticas guardadas)
- Supabase (base de datos, login, almacenamiento)
- Vercel (despliegue)
- Animación 2D: por decidir en Fase 3. 3D: Three.js / React Three Fiber, cargado bajo demanda.

## Comandos
- Instalar: `npm install` (o `npm ci` para una copia exacta)
- Arrancar en local: `npm run dev` (http://localhost:3000)
- Build de producción: `npm run build`
- Revisar el código: `npm run lint`
- Tests: pendientes (Tarea 2 del plan: Vitest y Playwright)

Versiones instaladas: Next.js 16, React 19, Tailwind CSS 4, TypeScript 5.

## Estructura de carpetas
- `src/app/` — páginas y rutas (App Router)
- `src/lib/` — lógica pura y sus tests (cálculos, consultas)
- `src/components/` — componentes de interfaz
- `public/` — archivos estáticos
- `docs/` — brief, plan, diseño (+ maqueta en `docs/diseno/`), progreso, entrega
- `supabase/migrations/` — SQL de la base de datos (se crea en la Tarea 5)

## Notas técnicas
- `npm audit` avisa de 5 vulnerabilidades altas, todas en la herramienta de desarrollo ESLint (`braces`/`fast-glob`), no en el código que se publica. No usar `npm audit fix --force`: bajaría la versión de Next.js. Revisar de nuevo al actualizar dependencias.
- Hay un `package-lock.json` en `C:\Users\RUBEN` (fuera del proyecto) que Next.js ignora; el aviso en el build es inofensivo.

## Reglas
- Secretos SIEMPRE en `.env`, nunca en git. Mantener un `.env.example` sin valores reales.
- Un commit por tarea, con mensaje claro. Actualizar `docs/PROGRESO.md` al terminar cada tarea y sesión.
- No instalar paquetes ni añadir conectores sin el OK del usuario.
- No inventar: ante la duda, consultar la documentación oficial (Context7).
- El usuario es principiante: explicar en español sencillo, respuestas cortas, y acabar siempre con el siguiente paso.
- Datos de ejercicios y alimentos: usar solo fuentes con licencia que permita su uso; anotar fuente y licencia de cada una en `docs/`.
- Salud: aviso de que la web no sustituye a un profesional sanitario. Los datos de usuario (peso, medidas…) son datos de salud: tratamiento RGPD estricto.
