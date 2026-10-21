# PROGRESO

## Fase actual
Fase 4 (Construcción), versión 0.1. Hechas: Tareas 1 y 2. Siguiente: Tarea 3 (textos y diseño base).

## Tareas del plan completadas
- Tarea 1: proyecto Next.js 16 + Tailwind 4 + TypeScript creado y compilando (`npm run build` OK).
- Tarea 2: Vitest 5 y Playwright instalados; `npm test` y `npm run test:e2e` pasan. Se subió `@types/node` a la 24 porque Vitest exigía ≥22 (solo afecta a tipos de desarrollo).

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
