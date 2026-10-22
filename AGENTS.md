# AGENTS.md — Memoria compartida del proyecto

Leída por Claude Code, Codex y Gemini. Estado actual en `docs/PROGRESO.md`.

## Proyecto
- **Nombre:** KleyBom (elegido por el usuario el 21/10/2026; antes "Forja", nombre de trabajo). Logo y favicon a partir de su imagen, vectorizada en `public/logo.svg` y `src/app/icon.svg`.
- **Idea:** web fitness y salud lo más completa posible: selector de ejercicios, calendario, rutinas, nutrición con una gran base de alimentos y estadísticas. Con información detallada de cada ejercicio, alimento y rutina.
- **Modelo:** gratuita. SIN sistema de pagos (por la carga legal). Ingresos previstos: donaciones voluntarias (Stripe) y anuncios de AdSense por visitas, ambos preparados pero APAGADOS hasta que el usuario cierre la fase de legalidad y decida el alta de autónomo (ver `docs/anuncios.md`, `NEXT_PUBLIC_DONACIONES_URL`, `NEXT_PUBLIC_ADSENSE_ID`).
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
- Tests unitarios (Vitest): `npm test`. Archivos `*.test.ts` junto al código en `src/` o `scripts/`.
- Tests de navegador (Playwright): `npm run test:e2e`. Archivos en `e2e/`; arranca solo el servidor de desarrollo y prueba en escritorio y móvil (Pixel 7).
- La primera vez en un ordenador nuevo: `npx playwright install chromium`.

Versiones instaladas: Next.js 16, React 19, Tailwind CSS 4, TypeScript 5.

## Estructura de carpetas
- `src/app/[idioma]/` — páginas (App Router), una versión por idioma (es/en). Fuera quedan `api/`, `auth/callback`, `robots.ts` y `sitemap.ts`
- `src/lib/i18n/` — diccionarios `es.ts` y `en.ts`; textos nuevos siempre en los dos
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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
