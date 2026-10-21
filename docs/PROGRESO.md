# PROGRESO

## Fase actual
Fase 4 (Construcción), versión 0.1. Hechas: Tareas 1 a 8. Tareas 1 a 11 hechas. Siguiente: Tarea 12 (cuentas de usuario).

## Tareas del plan completadas
- Tarea 1: proyecto Next.js 16 + Tailwind 4 + TypeScript creado y compilando (`npm run build` OK).
- Tarea 2: Vitest 5 y Playwright instalados; `npm test` y `npm run test:e2e` pasan. Se subió `@types/node` a la 24 porque Vitest exigía ≥22 (solo afecta a tipos de desarrollo).
- Tarea 3: textos en `src/lib/i18n/es.ts`, cabecera, pie con aviso de salud y menú móvil; colores y tipografías del diseño aplicados. Tests del menú en 375 px pasan. La fuente se llama `Big_Shoulders` en next/font (Google la renombró); el aviso de "fallback font" en el build es inofensivo. Los enlaces del menú dan 404 hasta que existan las páginas.
- Tarea 4: proyecto Supabase `forja` (id `gftajanocydijwtzvjhe`, región eu-central-1) creado. Para liberar hueco en el plan gratuito (límite 2) se pausaron `sello` y `sello-dev` (reactivables desde Supabase). Clientes en `src/lib/supabase/`, `GET /api/health` con test. Claves en `.env.local` (no está en git). `.mcp.json` limitado a este proyecto. Instalados `@supabase/supabase-js` y `@supabase/ssr`.
- Tarea 5: migración `supabase/migrations/20261021120000_catalogo_ejercicios.sql` aplicada en `forja`: tablas muscles, equipment, exercises, exercise_muscles, exercise_equipment con RLS (solo lectura pública). Comprobado: anónimo lee y no puede escribir; avisos de seguridad: ninguno.
- Tarea 6: `normalizeText` en `src/lib/text/normalize.ts` con 3 tests (minúsculas, sin tildes, espacios colapsados).
- Tarea 7: `listExercises` y `getExerciseBySlug` en `src/lib/exercises/queries.ts` (24 por página) con 8 tests sobre un cliente falso en memoria. Migración `20261021130000_exercises_search_text.sql` aplicada: columna `search_text` + índice trigram. **El importador (Tarea 8) debe rellenar `search_text` con `normalizeText(name_es)`.** Límite conocido: el filtro por músculo/material pasa una lista de ids en la URL; vale para cientos de ejercicios, revisar si el catálogo crece mucho.
- Tarea 8: `parseWgerExercise` en `scripts/import-wger/parse.ts` + 5 tests y 3 fixtures. Fixtures con-licencia y sin-espanol son respuestas reales de la API de wger (ids 41 y 9); **sin-licencia es la de con-licencia con licencia y autor borrados a mano** (en 200 ejercicios de muestra todos traían licencia). Decisiones: (1) wger no da nivel, así que `level` se pone a "intermedio" con `needs_level_review: true`; hay que revisarlo. (2) La imagen solo se guarda si tiene licencia y autor propios (en la muestra la imagen no los traía, quedará `null`). (3) `needs_translation`, `needs_level_review`, `muscles` y `equipment` no son columnas de `exercises`: la Tarea 9 decide qué hacer con ellos (probablemente añadir `needs_translation` en una migración y enlazar músculos/material por nombre). (4) Licencias vistas: CC-BY-SA 3, CC-BY-SA 4 y CC0; las CC-BY-SA exigen atribución y compartir igual (anotar en `docs/datos-fuentes.md`).
- Tarea 9 (preparación): migración `20261021140000` aplicada (columnas `needs_translation`, `needs_level_review` y clave única fuente+id). `scripts/import-wger/run.ts` con modo `--dry-run` (se ejecuta con `node`, sin instalar nada; se activó `allowImportingTsExtensions`). Simulación: 932 descargados, 810 a importar (223 sin español), 122 descartados. Catálogo de músculos/material en español en `catalogo-es.ts` (verificado contra la API de wger). `docs/datos-fuentes.md` creado.
- Tarea 9 (resultado, 21/10/2026): importados 810 ejercicios de wger (122 descartados por licencia/autor). En la base: 223 en inglés (`needs_translation`), 185 con imagen, 18 sin pasos, 102 sin músculo asignado, 15 músculos y 12 materiales. Revisión de 10 al azar: licencia y autor correctos; textos en español bien; **fallos de la fuente a vigilar**: algunos ejercicios tienen músculos incoherentes (p. ej. "Rowing Machine" con 13 músculos principales) y todos tienen nivel provisional "intermedio". Pendiente de decidir con el usuario: traducir los 223, asignar niveles y limpiar los músculos.
- Tarea 10: `/ejercicios` con buscador, filtros (músculo, material, nivel) en formulario GET (los filtros quedan en la URL y funciona sin JavaScript), tarjetas, mensaje de "sin resultados" y paginación. 5 tests de navegador contra la base real (escritorio y móvil). Nota técnica: el proyecto tiene `cacheComponents: true` en `next.config.ts`; con eso, todo acceso a datos o a `searchParams` debe ir dentro de `<Suspense>` (si no, error "uncached data during prerendering"). Aplicarlo en las páginas siguientes. El slug del músculo del pecho es `pectoral` (no `pecho`). Las tarjetas aún no tienen imagen.
- Tarea 11: ficha `/ejercicios/[slug]` con músculos (principales en ámbar, secundarios con borde), material, pasos, atribución (autor, licencia con enlace, fuente), aviso si está en inglés, título y descripción de página. 3 tests de navegador. **Desviación del plan:** un slug inexistente devuelve estado HTTP 200 con la página "Ejercicio no encontrado" y la etiqueta `noindex` (con `cacheComponents` el 404 real no es posible una vez empieza el streaming; `noindex` evita que Google lo indexe). "Errores comunes" y "Consejos" no se muestran porque los datos de wger no los traen (se ocultan cuando están vacíos).

## Hecho
- Comprobado: node v24.22.0, npm 11.19.1, git 2.51.0.
- Comprobados los plugins necesarios (superpowers, frontend-design, feature-dev, code-review, context7, playwright, chrome-devtools-mcp): todos instalados y activos.
- Git inicializado (rama `main`) con `.gitignore` (incluye `.env`).
- Creada la memoria compartida: AGENTS.md, CLAUDE.md, GEMINI.md, docs/PROGRESO.md.

- Stack aprobado por el usuario: Next.js + Tailwind + Supabase + Vercel.
- Conectores aprobados y añadidos en `.mcp.json`: GitHub, Vercel, Supabase (verificados con la documentación oficial).

- Fase 1: el usuario prefirió saltarse las preguntas del brainstorming; brief escrito con decisiones marcadas como "[mi decisión]" para que pueda cambiarlas. Investigación web de licencias de datos y de qué piden los usuarios (evidencia débil en lo segundo).

- Fase 2: plan en `docs/plan.md` con modelo/esfuerzo recomendado por tarea (para cuidar la cuota del plan Pro). Esquema `LocalBusiness` sustituido por `WebSite`/`Organization`/`Article` (la web no tiene local físico). Fórmulas de nutrición (Tarea 29) marcadas como "a verificar con fuente fiable antes de implementar".
- Modelo/esfuerzo por fase acordado: Fase 2 `opusplan` + medium; Fases 3-6 Sonnet, low/medium; no usar xhigh/max; `/clear` entre tareas; imágenes Nano Banana en Gemini.

- Fase 3: identidad "temple del acero" (gris acero → ámbar → azul templado) sobre fondo claro; Big Shoulders Display + Schibsted Grotesk; portada con selector de músculos en vivo; un solo movimiento automático. Descartado el diseño oscuro con naranja por ser el típico del sector.

## Siguiente tarea
Que el usuario apruebe (o pida cambios en) la maqueta de la página de inicio. Luego Fase 4 (Construcción) siguiendo `docs/plan.md` desde la Tarea 1. Pendiente del usuario: revisar `docs/plan.md`, autenticar los conectores con `/mcp` (Vercel, Supabase) y crear el token de GitHub.

## Decisiones tomadas
- Sin pagos; solo donaciones voluntarias. Porqué: evitar las obligaciones legales de cobrar.
- Stack aprobado Next.js + Tailwind + Supabase + Vercel. Porqué: hay cuentas de usuario, calendario y estadísticas guardadas, así que hace falta base de datos y login.
- 3D y animaciones solo cuando aporten. Porqué: que no compliquen el desarrollo ni el rendimiento.

- Nombre de trabajo "Forja" (provisional). Porqué: corto, en español, con gancho; falta comprobar dominio y marca.
- Entregas por versiones v0.1 a v0.5. Porqué: el alcance es enorme y así se puede usar pronto.
- Animaciones y 3D se añaden al final, por capas. Porqué: no romper la lógica del desarrollo.

## Pendiente de decidir
Ver sección 14 de `docs/brief.md`: nombre definitivo, donaciones, dominio, fecha límite, licencias de datos (BEDCA, Open Food Facts).

## Siguiente IA
Claude Code.
