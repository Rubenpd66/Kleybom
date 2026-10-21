# PROGRESO

## Fase actual
Fase 1 (Descubrimiento) terminada: `docs/brief.md` escrito. A la espera del OK del usuario para pasar a la Fase 2 (Plan).

## Hecho
- Comprobado: node v24.22.0, npm 11.19.1, git 2.51.0.
- Comprobados los plugins necesarios (superpowers, frontend-design, feature-dev, code-review, context7, playwright, chrome-devtools-mcp): todos instalados y activos.
- Git inicializado (rama `main`) con `.gitignore` (incluye `.env`).
- Creada la memoria compartida: AGENTS.md, CLAUDE.md, GEMINI.md, docs/PROGRESO.md.

- Stack aprobado por el usuario: Next.js + Tailwind + Supabase + Vercel.
- Conectores aprobados y añadidos en `.mcp.json`: GitHub, Vercel, Supabase (verificados con la documentación oficial).

- Fase 1: el usuario prefirió saltarse las preguntas del brainstorming; brief escrito con decisiones marcadas como "[mi decisión]" para que pueda cambiarlas. Investigación web de licencias de datos y de qué piden los usuarios (evidencia débil en lo segundo).

## Siguiente tarea
Fase 2 (Plan): dividir el trabajo en tareas de 15-30 min con la skill writing-plans, resultado en `docs/plan.md`. Antes, el usuario debe revisar `docs/brief.md`. El usuario debe autenticar los conectores con `/mcp` (Vercel, Supabase) y crear el token de GitHub.

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
