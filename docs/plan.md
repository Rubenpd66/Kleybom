# Plan de implementación — Forja (nombre provisional)

> **Para quien ejecute el plan (Claude Code, Codex o Gemini):** usar `superpowers:executing-plans` (una sola sesión, más barato) o `superpowers:subagent-driven-development` (más caro). Los pasos usan casillas `- [ ]` para marcar el avance.

**Objetivo:** construir una web fitness y salud gratuita con ejercicios, rutinas, calendario, nutrición, registro de entrenos y estadísticas, entregada en 5 versiones.

**Arquitectura:** web Next.js (App Router, TypeScript) con Tailwind. Supabase aporta base de datos Postgres, login y almacenamiento; las tablas de cada usuario se protegen con RLS (reglas de acceso por fila). La lógica de cálculo vive en módulos puros de `src/lib/` con tests unitarios; las pantallas solo los usan. Los datos de ejercicios y alimentos se importan con scripts desde fuentes abiertas, guardando licencia y autoría.

**Stack:** Next.js, TypeScript, Tailwind CSS, Supabase, Vercel, Vitest (tests unitarios), Playwright (tests de navegador).

**Spec:** [docs/brief.md](brief.md). El diseño visual se define en la Fase 3 (`docs/diseno.md`) antes de las tareas de pantalla.

## Cómo leer este plan
- Cada tarea está pensada para 15–30 minutos y termina con un commit.
- `[Sonnet · low]` = modelo y esfuerzo recomendados (ver tabla de ahorro en `docs/PROGRESO.md`).
- 🔔 = antes de hacerla hay que pedir OK al usuario (instalar paquetes, conectar servicios, claves).
- Nombres, firmas y valores de este plan son decisiones de Claude: pueden cambiarse, pero hay que cambiarlos en todas las tareas que los usen.
- Antes de usar una librería o API externa (Next.js, Supabase, wger, USDA…), comprobar su documentación actual con Context7. Este plan no copia comandos de memoria.
- **Despliegue de cada versión** (al final de v0.1 a v0.5): push a GitHub, despliegue en Vercel, comprobar la URL de vista previa y anotar en `docs/PROGRESO.md`. 🔔

## Restricciones globales
- Gratis y sin pagos. Solo un enlace externo de donaciones.
- Idioma: español (España). Los textos de interfaz van en `src/lib/i18n/es.ts`, nunca escritos dentro de los componentes.
- Secretos solo en `.env.local`; mantener `.env.example` sin valores reales. Nunca en git.
- Peso, medidas y comidas son datos de salud: tablas de usuario con RLS, solo accesibles por su dueño.
- Cada ejercicio importado guarda `license` y `author`; la ficha muestra la atribución. Sin licencia clara, no se importa.
- Valores nutricionales ausentes son `null`, se muestran como "—" y nunca como 0.
- Respetar `prefers-reduced-motion`. El 3D se carga bajo demanda y la página funciona sin él.
- Lighthouse ≥ 90 en rendimiento, accesibilidad, buenas prácticas y SEO (se mide en la Fase 5).
- Un commit por tarea. Actualizar `docs/PROGRESO.md` al terminar cada tarea.

## Puntos de atención (casos que la especificación no menciona)
1. **Búsqueda con tildes y mayúsculas:** "flexion", "Flexión" y "FLEXIÓN" deben dar el mismo resultado. → Tareas 6, 7, 10, 27.
2. **Zonas horarias:** un entreno a las 23:50 debe caer en el día del usuario, no en el de un servidor. → Tareas 22, 23.
3. **Nutrientes ausentes:** un alimento sin fibra no suma 0 ni rompe los totales; el día se marca como "incompleto". → Tareas 25, 27, 28, 31.
4. **Entradas absurdas:** 0 o −5 series, 100000 g de pollo, peso corporal de 3 kg. Deben rechazarse con mensaje claro. → Tareas 15, 28, 29, 36, 37, 40.
5. **Usuario nuevo o que borra su cuenta:** listas vacías con mensaje útil, y al borrar la cuenta desaparecen todos sus datos. → Tareas 10, 13, 23, 32, 42, 43.

---

# Versión 0.1 — Base y ejercicios

### Tarea 1: Crear el proyecto 🔔 `[Sonnet · low]`
**Archivos:** crear el proyecto Next.js en la raíz; modificar `AGENTS.md` (sección Comandos y Estructura).
- [ ] Explicar al usuario qué se va a instalar y esperar su OK.
- [ ] Crear el proyecto con TypeScript, Tailwind, App Router y carpeta `src/`, siguiendo la documentación actual de Next.js (Context7). Sin tocar `.gitignore` ni los archivos de memoria existentes.
- [ ] Ejecutar `npm run build`. Esperado: compila sin errores.
- [ ] Rellenar en `AGENTS.md` los comandos reales (instalar, arrancar, build, test) y la estructura de carpetas.
- [ ] Commit: `feat: proyecto Next.js base`.

### Tarea 2: Tests 🔔 `[Sonnet · low]`
**Archivos:** configuración de Vitest y Playwright; `src/lib/smoke.test.ts`; `e2e/smoke.spec.ts`; scripts `test` y `test:e2e` en `package.json`.
- [ ] Pedir OK para instalar Vitest y Playwright.
- [ ] Un test unitario trivial y un test de navegador que abre `/` y comprueba que responde 200.
- [ ] `npm test` y `npm run test:e2e`. Esperado: ambos pasan.
- [ ] Documentar los comandos en `AGENTS.md`. Commit.

### Tarea 3: Estructura de textos y diseño base `[Sonnet · medium]`
**Archivos:** crear `src/lib/i18n/es.ts`, `src/components/layout/Header.tsx`, `Footer.tsx`, `MobileNav.tsx`; modificar `src/app/layout.tsx`.
**Interfaces:** produce `export const es: { nav: {...}; footer: {...}; ... }` (objeto tipado de textos) que usan todas las tareas.
- [ ] Aplicar `docs/diseno.md` (colores, tipografías, espaciados) a Tailwind.
- [ ] Cabecera con enlaces (Ejercicios, Rutinas, Calendario, Nutrición, Estadísticas), menú móvil y pie con el aviso de salud ("no sustituye a un profesional sanitario").
- [ ] Test de navegador: en ancho móvil (375 px) el menú se abre y no hay scroll horizontal.
- [ ] Commit.

### Tarea 4: Conectar Supabase 🔔 `[Sonnet · low]`
**Archivos:** `.env.example`, `.env.local` (sin commit), `src/lib/supabase/browser.ts`, `src/lib/supabase/server.ts`, `src/app/api/health/route.ts`.
**Interfaces:** produce `createBrowserClient(): SupabaseClient` y `createServerClient(): Promise<SupabaseClient>`.
- [ ] Con OK del usuario, crear el proyecto Supabase (anotar su identificador en `.mcp.json` para limitar el conector a ese proyecto).
- [ ] Guardar URL y clave pública en `.env.local`, y las variables vacías en `.env.example`.
- [ ] Crear los clientes siguiendo la documentación de Supabase para Next.js (paquete `@supabase/ssr`; confirmar con Context7).
- [ ] `GET /api/health` responde `{ ok: true }` si la base contesta. Test de navegador contra esa ruta.
- [ ] Commit (comprobar con `git status` que `.env.local` no aparece).

### Tarea 5: Tablas del catálogo de ejercicios `[Sonnet · medium]`
**Archivos:** crear `supabase/migrations/<fecha>_catalogo_ejercicios.sql`.
**Interfaces:** produce las tablas:
- `muscles(id, slug, name_es)`, `equipment(id, slug, name_es)`
- `exercises(id, slug unique, name_es, description_es, level text check in ('principiante','intermedio','avanzado'), instructions_es text[], tips_es text[], common_mistakes_es text[], image_url, license, author, source, source_id)`
- `exercise_muscles(exercise_id, muscle_id, role check in ('principal','secundario'))`, `exercise_equipment(exercise_id, equipment_id)`
- [ ] Escribir el SQL con RLS activada: lectura pública, sin escritura para usuarios.
- [ ] Aplicarlo (conector Supabase, con OK) y comprobar con una consulta que un usuario anónimo puede leer pero no escribir.
- [ ] Revisar los avisos de seguridad del proyecto (`get_advisors`). Commit.

### Tarea 6: Normalizar texto de búsqueda `[Sonnet · low]`
**Archivos:** crear `src/lib/text/normalize.ts`, `src/lib/text/normalize.test.ts`.
**Interfaces:** produce `normalizeText(s: string): string` (minúsculas, sin tildes, espacios recortados y colapsados).
- [ ] Test: `normalizeText("  FLEXIÓN  de   Brazos ")` → `"flexion de brazos"`; `normalizeText("Piña")` → `"pina"`; `normalizeText("")` → `""`.
- [ ] Ejecutar: falla. Implementar. Ejecutar: pasa. Commit.

### Tarea 7: Consultas de ejercicios `[Sonnet · medium]`
**Archivos:** crear `src/lib/exercises/queries.ts`, `src/lib/exercises/queries.test.ts`; añadir columna `search_text` (normalizada) a `exercises` en una nueva migración.
**Interfaces:**
- `type ExerciseFilters = { q?: string; muscle?: string; equipment?: string; level?: 'principiante'|'intermedio'|'avanzado'; page?: number }`
- `listExercises(f: ExerciseFilters): Promise<{ items: ExerciseSummary[]; total: number }>` (24 por página)
- `getExerciseBySlug(slug: string): Promise<ExerciseDetail | null>`
- [ ] Tests con datos de prueba: filtro por músculo, por texto sin tildes ("flexion" encuentra "Flexión"), página fuera de rango devuelve `items: []` sin error.
- [ ] Implementar usando `normalizeText` para `q` contra `search_text`. Pasar tests. Commit.

### Tarea 8: Importador de wger (convertidor de datos) `[Sonnet · medium]`
**Archivos:** crear `scripts/import-wger/parse.ts`, `scripts/import-wger/parse.test.ts`, `scripts/import-wger/fixtures/`.
**Interfaces:** produce `parseWgerExercise(raw: WgerExerciseInfo): ExerciseRow | null`. Devuelve `null` si falta licencia o autoría.
- [ ] Consultar la documentación actual de la API de wger y guardar 3 respuestas reales como fixtures (una con licencia, una sin licencia, una sin traducción al español).
- [ ] Tests: con licencia → fila con `license` y `author`; sin licencia → `null`; sin español → usa inglés y marca `needs_translation: true`.
- [ ] Implementar. Commit.

### Tarea 9: Ejecutar la importación 🔔 `[Sonnet · low]`
**Archivos:** crear `scripts/import-wger/run.ts`, `docs/datos-fuentes.md`.
- [ ] Pedir OK, y ejecutar el script contra Supabase (clave de servicio solo en `.env.local`, nunca en el código).
- [ ] Contar cuántos se importaron y cuántos se descartaron por licencia; revisar 10 al azar con el usuario.
- [ ] Documentar en `docs/datos-fuentes.md`: fuente, licencia, fecha y cifras. Commit.

### Tarea 10: Listado de ejercicios `[Sonnet · medium]`
**Archivos:** crear `src/app/ejercicios/page.tsx`, `src/components/exercises/ExerciseFilters.tsx`, `ExerciseCard.tsx`; `e2e/ejercicios.spec.ts`.
- [ ] Test de navegador: buscar "flexion" muestra resultados; filtrar por músculo cambia la URL (`?muscle=pecho`); una búsqueda sin resultados muestra un mensaje útil; en móvil se ve bien.
- [ ] Implementar leyendo los filtros desde la URL y llamando a `listExercises`. Paginación. Commit.

### Tarea 11: Ficha de ejercicio `[Sonnet · medium]`
**Archivos:** crear `src/app/ejercicios/[slug]/page.tsx`, `src/components/exercises/ExerciseDetail.tsx`; `e2e/ejercicio-ficha.spec.ts`.
- [ ] Test: ficha muestra nombre, músculos (principales y secundarios), instrucciones, errores comunes y la atribución de licencia y autoría; un slug inexistente da 404.
- [ ] Implementar con metadatos de página (título y descripción). Commit.

### Tarea 12: Cuentas de usuario `[Sonnet · medium]`
**Archivos:** crear `src/app/(auth)/registro/page.tsx`, `entrar/page.tsx`, `src/middleware.ts`, `src/lib/auth/session.ts`; `e2e/auth.spec.ts`.
**Interfaces:** produce `getCurrentUser(): Promise<User | null>`.
- [ ] Decisión de Claude: registro con correo y contraseña. Login con Google queda para más adelante.
- [ ] Test: registrarse, cerrar sesión, entrar; una ruta privada (`/panel`) redirige a `/entrar` si no hay sesión.
- [ ] Implementar siguiendo la documentación de Supabase Auth. Mensajes de error claros en español. Commit.

### Tarea 13: Perfil y borrado de cuenta `[Sonnet · high]`
**Archivos:** migración `profiles(id uuid references auth.users, display_name, sex, birth_date, height_cm, timezone default 'Europe/Madrid', created_at)` con RLS (solo el dueño); `src/app/panel/perfil/page.tsx`; `src/app/api/cuenta/borrar/route.ts`.
- [ ] Todas las tablas de usuario de este plan deben usar `on delete cascade` sobre `auth.users`.
- [ ] Test de navegador: borrar la cuenta pide confirmación escrita y después la sesión se cierra. Test SQL: tras borrar, no queda ninguna fila del usuario en `profiles`.
- [ ] La ruta de borrado usa la clave de servicio solo en el servidor y comprueba la sesión antes. Revisar seguridad. Commit.

**Cierre v0.1:** despliegue de la versión (ver "Despliegue de cada versión") y actualizar `docs/PROGRESO.md`.

---

# Versión 0.2 — Rutinas y calendario

### Tarea 14: Tablas de rutinas `[Sonnet · medium]`
**Archivos:** migración `routines` y `routine_exercises`.
**Interfaces:**
- `routines(id, slug unique nullable, owner_id nullable → null = plantilla pública, name, description, goal check in ('fuerza','hipertrofia','perdida_grasa','resistencia','movilidad'), level, days_per_week, created_at)`
- `routine_exercises(id, routine_id, exercise_id, day_index, position, sets, reps_min, reps_max, rest_seconds, notes)`
- [ ] RLS: plantillas (owner nulo) legibles por todos; las propias, solo por su dueño (lectura y escritura).
- [ ] Verificar con consultas como usuario A y B que B no ve ni edita las de A. Commit.

### Tarea 15: Validación de rutinas `[Sonnet · low]`
**Archivos:** crear `src/lib/routines/validate.ts`, `validate.test.ts`.
**Interfaces:** `validateRoutine(r: RoutineDraft): { ok: true } | { ok: false; errors: string[] }`
- [ ] Tests: series 0 o 21 → error; reps_min > reps_max → error; descanso negativo → error; rutina sin ejercicios → error; nombre vacío → error; caso válido → ok.
- [ ] Implementar (series 1–20, repeticiones 1–100, descanso 0–600 s). Commit.

### Tarea 16: Plantillas de rutinas `[Sonnet · medium]`
**Archivos:** crear `supabase/seed/rutinas.sql` (o script equivalente), `docs/contenido-rutinas.md`.
- [ ] Redactar 6 plantillas propias: cuerpo completo principiante 3 días, torso/pierna 4 días, empuje/tirón/pierna 6 días, fuerza básica 3 días, movilidad en casa, iniciación sin material. Descripciones y consejos en español.
- [ ] Cada rutina usa solo ejercicios que existen en la base. Test: validar todas con `validateRoutine`.
- [ ] El usuario revisa el contenido antes de cargarlo. Commit.

### Tarea 17: Páginas de rutinas `[Sonnet · medium]`
**Archivos:** crear `src/app/rutinas/page.tsx`, `src/app/rutinas/[slug]/page.tsx`, `src/lib/routines/queries.ts`; `e2e/rutinas.spec.ts`.
- [ ] Test: listado filtrable por objetivo y nivel; detalle muestra días, ejercicios, series y repeticiones con enlace a cada ficha.
- [ ] Implementar `listRoutines(filters)` y `getRoutineBySlug(slug)`. Commit.

### Tarea 18: Lógica del constructor de rutinas `[Sonnet · medium]`
**Archivos:** crear `src/lib/routines/builder.ts`, `builder.test.ts`.
**Interfaces:** `builderReducer(state: RoutineDraft, action: BuilderAction): RoutineDraft` con acciones `addExercise | removeExercise | moveExercise | setSets | setReps | addDay | removeDay`.
- [ ] Tests: añadir, quitar y reordenar mantienen `position` consecutivo; quitar el último ejercicio de un día no rompe; mover fuera de rango no cambia nada.
- [ ] Implementar. Commit.

### Tarea 19: Pantalla del constructor `[Sonnet · medium]`
**Archivos:** crear `src/app/rutinas/nueva/page.tsx`, `src/components/routines/RoutineBuilder.tsx`, `ExercisePicker.tsx`; `e2e/constructor.spec.ts`.
- [ ] Test: crear una rutina buscando ejercicios, ajustar series, guardar, y verla en "Mis rutinas"; guardar con errores muestra los mensajes de `validateRoutine`.
- [ ] Implementar con el reducer, el buscador de ejercicios de la Tarea 10 y una acción de servidor que valida otra vez en el servidor. Commit.

### Tarea 20: Imprimir y exportar rutina `[Sonnet · low]`
**Archivos:** estilos de impresión en `src/app/rutinas/[slug]/print.css`; botón "Imprimir / guardar PDF".
- [ ] Test de navegador con emulación de impresión: no aparecen cabecera ni pie, y sí la tabla de la rutina.
- [ ] Implementar con `window.print()`. Commit.

### Tarea 21: Tablas del calendario `[Sonnet · medium]`
**Archivos:** migración `planned_sessions(id, user_id, date (tipo date), routine_id nullable, routine_day_index nullable, note, status check in ('planificada','hecha','saltada'))`, con RLS de dueño y `on delete cascade`.
- [ ] Verificar RLS como en la Tarea 14. Commit.

### Tarea 22: Lógica del calendario `[Sonnet · medium]`
**Archivos:** crear `src/lib/calendar/dates.ts`, `dates.test.ts`.
**Interfaces:**
- `toLocalDateKey(d: Date, tz: string): string` (formato `YYYY-MM-DD`)
- `monthGrid(year: number, month: number): string[][]` (semanas que empiezan en lunes, con días de relleno del mes anterior y siguiente)
- [ ] Tests: `2026-03-01T23:30:00Z` en `Europe/Madrid` → `2026-03-02`; febrero de 2028 (año bisiesto) tiene 29 días; cada fila de `monthGrid` tiene 7 elementos.
- [ ] Implementar con `Intl.DateTimeFormat` (sin librerías). Commit.

### Tarea 23: Pantalla del calendario `[Sonnet · medium]`
**Archivos:** crear `src/app/calendario/page.tsx`, `src/components/calendar/MonthView.tsx`, `PlanSessionDialog.tsx`; `e2e/calendario.spec.ts`.
- [ ] Test: planificar una rutina en un día, marcarla como hecha, cambiar de mes; usuario nuevo ve el calendario vacío con un mensaje que explica cómo empezar.
- [ ] Implementar leyendo la zona horaria del perfil. Commit.

**Cierre v0.2:** despliegue y `docs/PROGRESO.md`.

---

# Versión 0.3 — Nutrición

### Tarea 24: Tablas de nutrición `[Sonnet · medium]`
**Archivos:** migración con:
- `foods(id, slug unique, name_es, name_en, category, source check in ('usda','openfoodfacts','manual'), source_id, search_text, kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg)` (todos los nutrientes pueden ser nulos, datos por 100 g)
- `meal_entries(id, user_id, date, meal check in ('desayuno','comida','cena','snack'), food_id, grams)`
- `nutrition_goals(user_id primary key, kcal, protein_g, carbs_g, fat_g, updated_at)`
- [ ] RLS: `foods` lectura pública; las otras dos, solo del dueño, con `on delete cascade`. Verificar. Commit.

### Tarea 25: Importar USDA FoodData Central 🔔 `[Sonnet · medium]`
**Archivos:** crear `scripts/import-usda/parse.ts`, `parse.test.ts`, `run.ts`, `fixtures/`.
**Interfaces:** `parseUsdaFood(raw: UsdaFood): FoodRow | null`.
- [ ] Pedir al usuario que cree la clave gratuita de la API y la guarde en `.env.local`.
- [ ] Comprobar en la documentación de la API qué tipos de alimento importar. Decisión de Claude: solo alimentos genéricos (no marcas), para mantener la base de calidad.
- [ ] Tests con fixtures: nutriente ausente → `null` (no 0); unidades convertidas a gramos y miligramos.
- [ ] Importar, anotar cifras y citar "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central" en `docs/datos-fuentes.md`. Commit.

### Tarea 26: Nombres de alimentos en español `[Sonnet · medium]`
**Archivos:** crear `scripts/translate-foods/`, `docs/glosario-alimentos.md`.
- [ ] Traducir `name_en` → `name_es` por lotes (herramienta a elegir con el usuario por su coste; si usa una API de pago, pedir OK antes) y rellenar `search_text`.
- [ ] El usuario revisa una muestra de 100 nombres; corregir el glosario si hay errores sistemáticos. Commit.

### Tarea 27: Buscador y ficha de alimentos `[Sonnet · medium]`
**Archivos:** crear `src/lib/foods/queries.ts`, `src/app/alimentos/page.tsx`, `src/app/alimentos/[slug]/page.tsx`; `e2e/alimentos.spec.ts`.
**Interfaces:** `searchFoods(q: string, page?: number): Promise<{ items: FoodSummary[]; total: number }>`.
- [ ] Test: "platano" encuentra "Plátano"; la ficha muestra "—" para un nutriente ausente, nunca 0; atribución de la fuente visible.
- [ ] Implementar. Commit.

### Tarea 28: Cálculo por ración `[Sonnet · low]`
**Archivos:** crear `src/lib/nutrition/portion.ts`, `portion.test.ts`.
**Interfaces:**
- `type Nutrients = { kcal: number|null; protein_g: number|null; carbs_g: number|null; fat_g: number|null; fiber_g: number|null; sugar_g: number|null; sodium_mg: number|null }`
- `scaleNutrients(per100g: Nutrients, grams: number): Nutrients` (`RangeError` si `grams` ≤ 0 o > 5000; los `null` siguen siendo `null`)
- `sumNutrients(list: Nutrients[]): { totals: Nutrients; incomplete: boolean }` (los nulos no suman; `incomplete` es `true` si había alguno)
- [ ] Tests: 150 g de un alimento con 200 kcal/100 g → 300 kcal; 0 g → error; 100000 g → error; fibra nula se mantiene nula; suma con un nulo → `incomplete: true`.
- [ ] Implementar. Commit.

### Tarea 29: Objetivos de calorías y macros `[Sonnet · medium]`
**Archivos:** crear `src/lib/nutrition/targets.ts`, `targets.test.ts`, `docs/formulas.md`.
**Interfaces:**
- `type TargetsInput = { sex: 'hombre'|'mujer'; age: number; height_cm: number; weight_kg: number; activity: 'sedentario'|'ligero'|'moderado'|'alto'; goal: 'perder'|'mantener'|'ganar' }`
- `computeTargets(p: TargetsInput): { kcal: number; protein_g: number; carbs_g: number; fat_g: number }`
- [ ] Antes de implementar, confirmar con una fuente fiable (por ejemplo una guía oficial de nutrición) las fórmulas y valores, y anotarlos con su fuente en `docs/formulas.md`. Propuesta de partida, sin verificar: metabolismo basal de Mifflin-St Jeor (10·peso + 6,25·altura − 5·edad, +5 hombre / −161 mujer), factores de actividad 1,2 / 1,375 / 1,55 / 1,725, ajuste del objetivo −15 % / 0 / +10 %, 4 kcal por gramo de proteína y carbohidrato, 9 por gramo de grasa.
- [ ] Tests: persona de ejemplo con resultado calculado a mano; edad < 14 o > 100, peso o altura fuera de rango → error; el resultado nunca baja del suelo de seguridad configurable (valor a validar con la fuente; propuesta 1200 mujer / 1500 hombre).
- [ ] Implementar. Commit.

### Tarea 30: Pantalla de objetivos `[Sonnet · low]`
**Archivos:** crear `src/app/nutricion/objetivos/page.tsx`; `e2e/objetivos.spec.ts`.
- [ ] Test: rellenar datos, ver calorías y macros calculados, guardar y recuperarlos; datos absurdos muestran error; el aviso de salud es visible.
- [ ] Implementar guardando en `nutrition_goals`. Commit.

### Tarea 31: Lógica del diario de comidas `[Sonnet · medium]`
**Archivos:** crear `src/lib/nutrition/diary.ts`, `diary.test.ts`.
**Interfaces:** `summarizeDay(entries: MealEntryWithFood[]): { byMeal: Record<Meal, Nutrients>; total: Nutrients; incomplete: boolean }`.
- [ ] Tests: día vacío → ceros y `incomplete: false`; comida con alimento de fibra nula → `incomplete: true`; totales coinciden con la suma manual.
- [ ] Implementar con `scaleNutrients` y `sumNutrients`. Commit.

### Tarea 32: Pantalla del diario `[Sonnet · medium]`
**Archivos:** crear `src/app/nutricion/page.tsx`, `src/components/nutrition/MealSection.tsx`, `FoodPicker.tsx`; `e2e/diario.spec.ts`.
- [ ] Test: añadir un alimento con gramos a una comida, ver el total del día contra el objetivo, editar y borrar la entrada; usuario nuevo ve un diario vacío con una guía breve.
- [ ] Implementar con acciones de servidor que validan los gramos. Commit.

### Tarea 33: Productos envasados por código de barras (condicionada) `[Sonnet · medium]`
**Archivos:** crear `src/app/api/openfoodfacts/[barcode]/route.ts`, `src/lib/foods/openfoodfacts.ts`.
- [ ] Solo si el usuario confirma la estrategia de licencia: consultar Open Food Facts por su API como capa aparte, sin copiar sus datos a nuestra tabla `foods` (por la condición de compartir igual de ODbL). Mostrar atribución.
- [ ] Test con una respuesta de ejemplo guardada: producto sin datos nutricionales → mensaje claro. Commit.

### Tarea 34: Recetas básicas `[Sonnet · medium]`
**Archivos:** migración `recipes(id, slug, name_es, description_es, steps_es text[], servings)` y `recipe_ingredients(recipe_id, food_id, grams)`; `src/lib/nutrition/recipe.ts` con `recipeNutrientsPerServing(...)`; `src/app/recetas/`.
- [ ] Test: nutrientes por ración = suma de ingredientes / raciones; receta sin ingredientes → error.
- [ ] 10 recetas iniciales redactadas por nosotros y revisadas por el usuario. Commit.

**Cierre v0.3:** despliegue y `docs/PROGRESO.md`.

---

# Versión 0.4 — Registro y estadísticas

### Tarea 35: Tablas de registro `[Sonnet · medium]`
**Archivos:** migración con:
- `workout_logs(id, user_id, date, routine_id nullable, started_at, finished_at nullable, note)`
- `set_logs(id, workout_log_id, exercise_id, set_index, weight_kg, reps, rpe nullable)`
- `body_measurements(id, user_id, date, weight_kg nullable, waist_cm nullable, hip_cm nullable, chest_cm nullable)`
- [ ] RLS de dueño y `on delete cascade` (en `set_logs`, a través de `workout_logs`). Verificar con dos usuarios. Commit.

### Tarea 36: Progresión y comparación `[Sonnet · medium]`
**Archivos:** crear `src/lib/training/progression.ts`, `progression.test.ts`.
**Interfaces:**
- `estimate1RM(weightKg: number, reps: number): number` (Epley: peso × (1 + reps/30); con 1 repetición devuelve el peso; `RangeError` si peso < 0, reps < 1 o reps > 30)
- `compareSessions(prev: SetLog[], curr: SetLog[]): { volumeDelta: number; best1RMDelta: number }`
- [ ] Tests: `estimate1RM(100, 1)` = 100; `estimate1RM(100, 10)` ≈ 133,3; peso 0 permitido (peso corporal); reps 0 → error; sesión anterior vacía → deltas iguales a la sesión actual.
- [ ] Implementar. Commit.

### Tarea 37: Entreno en vivo, lógica `[Sonnet · medium]`
**Archivos:** crear `src/lib/training/session.ts`, `session.test.ts`.
**Interfaces:** `sessionReducer(state: ActiveSession, action: SessionAction): ActiveSession` con acciones `logSet | editSet | deleteSet | finish`.
- [ ] Tests: registrar series en orden; peso negativo o más de 1000 kg → rechazado; `finish` sin series → no crea registro.
- [ ] Implementar. Commit.

### Tarea 38: Entreno en vivo, pantalla `[Sonnet · medium]`
**Archivos:** crear `src/app/entreno/page.tsx`, `src/components/training/LiveSession.tsx`, `SetRow.tsx`; `e2e/entreno.spec.ts`.
- [ ] Test: empezar desde una rutina o una sesión planificada, registrar 3 series viendo los valores de la sesión anterior, terminar y ver el resumen; la planificada pasa a "hecha".
- [ ] Guardar de forma progresiva para que no se pierda nada si se cierra la pestaña. Commit.

### Tarea 39: Temporizador de descanso `[Sonnet · low]`
**Archivos:** crear `src/lib/training/useRestTimer.ts`, `useRestTimer.test.ts`.
**Interfaces:** `useRestTimer(): { remaining: number; running: boolean; start(seconds: number): void; stop(): void }`.
- [ ] Tests con reloj simulado: cuenta atrás, se detiene en 0, `start(0)` o negativo → no arranca.
- [ ] Implementar y conectarlo a `LiveSession` usando `rest_seconds` de la rutina. Commit.

### Tarea 40: Peso y medidas `[Sonnet · low]`
**Archivos:** crear `src/lib/body/validate.ts`, `validate.test.ts`, `src/app/panel/medidas/page.tsx`.
**Interfaces:** `validateMeasurement(m: MeasurementDraft): { ok: true } | { ok: false; errors: string[] }`.
- [ ] Tests: peso 3 kg o 700 kg → error; cintura 0 → error; todos los campos vacíos → error; valores razonables → ok.
- [ ] Implementar y la pantalla (formulario + historial editable). Commit.

### Tarea 41: Lógica de estadísticas `[Sonnet · medium]`
**Archivos:** crear `src/lib/stats/aggregate.ts`, `aggregate.test.ts`.
**Interfaces:**
- `weeklyVolume(sets: SetLog[], weekStart: string): number`
- `currentStreak(trainedDates: string[], today: string): number` (días consecutivos hasta hoy; si hoy no hay entreno pero ayer sí, cuenta desde ayer)
- `movingAverage(points: { date: string; value: number }[], window: number): { date: string; value: number }[]`
- [ ] Tests: sin datos → 0 o lista vacía; racha que cruza fin de mes; ventana mayor que los datos → devuelve lo que hay sin fallar.
- [ ] Implementar. Commit.

### Tarea 42: Página de estadísticas 🔔 `[Sonnet · medium]`
**Archivos:** crear `src/app/estadisticas/page.tsx`, `src/components/stats/` (gráficos); `e2e/estadisticas.spec.ts`.
- [ ] Proponer una librería de gráficos ligera y esperar OK antes de instalarla.
- [ ] Test: con datos de ejemplo se ven los gráficos (volumen semanal, 1RM estimado por ejercicio, peso corporal con media móvil, constancia); usuario nuevo ve un estado vacío que explica qué registrar.
- [ ] Los gráficos tienen alternativa accesible (tabla de datos). Commit.

### Tarea 43: Panel de inicio `[Sonnet · low]`
**Archivos:** crear `src/app/panel/page.tsx`.
- [ ] Mostrar: sesión de hoy, calorías del día frente al objetivo, racha y resumen de la semana. Test: usuario nuevo ve tres pasos para empezar. Commit.

### Tarea 44: Exportar mis datos `[Sonnet · medium]`
**Archivos:** crear `src/app/api/cuenta/exportar/route.ts`.
- [ ] Descarga en JSON de todos los datos del usuario (perfil, rutinas, calendario, comidas, entrenos, medidas). Es un derecho del RGPD (portabilidad).
- [ ] Test: el archivo de un usuario no contiene datos de otro. Commit.

**Cierre v0.4:** despliegue y `docs/PROGRESO.md`.

---

# Versión 0.5 — Contenido, movimiento y puesta a punto

### Tarea 45: Guías `[Sonnet · medium]`
**Archivos:** crear `src/content/guias/*.mdx` o `.md`, `src/app/guias/`.
- [x] 5 guías iniciales (empezar a entrenar, comer mejor, descanso, hábitos, progresión), redactadas por nosotros, con aviso de salud y revisión del usuario. Citar fuentes fiables en cada una.
- [x] Test: cada guía se renderiza con título y metadatos. Commit.

### Tarea 46: Imágenes con Nano Banana `[Gemini · —]`
**Archivos:** `docs/estilo-imagenes.md`, imágenes en `public/img/`.
- [x] Definir un estilo visual único y los prompts. Generar en Gemini/Antigravity (ahorra cuota de Claude).
- [x] Optimizar el tamaño, usar `next/image` y escribir texto alternativo en cada una. Guardar los prompts usados. Commit.

### Tarea 47: Animaciones 2D `[Sonnet · medium]`
**Archivos:** `src/components/motion/`, ajustes puntuales en componentes existentes.
- [x] Decisión pendiente: CSS puro o librería. Preferir CSS; si hace falta librería, pedir OK.
- [x] Test de navegador con `prefers-reduced-motion: reduce`: no hay animaciones. Cada animación se puede quitar sin romper la pantalla. Commit.

### Tarea 48: Visor 3D de ejercicio/músculos 🔔 `[Sonnet · high]`
**Archivos:** crear `src/components/exercises/Viewer3D.tsx` (carga dinámica), `src/lib/feature-flags.ts`.
- [ ] Pedir OK para instalar Three.js / React Three Fiber; confirmar con Context7 su integración con Next.js.
- [ ] Cargarlo solo cuando el usuario lo pide (botón "Ver en 3D"); si WebGL no está disponible o falla, mostrar la imagen normal.
- [ ] Test: la ficha funciona igual con el visor desactivado; el peso de la página inicial no aumenta. Medir con Lighthouse. Commit.

### Tarea 49: Donaciones `[Sonnet · low]`
**Archivos:** crear `src/app/apoya/page.tsx`, componente `DonateButton`.
- [ ] Pedir al usuario la plataforma elegida y su enlace; guardar el enlace en variable de entorno. Sin recoger dinero ni datos de pago en la web.
- [ ] Texto honesto: gratis, sin obligación. Test: el enlace abre en nueva pestaña con `rel="noopener noreferrer"`. Commit.

### Tarea 50: SEO `[Sonnet · low]`
**Archivos:** `src/app/sitemap.ts`, `src/app/robots.ts`, metadatos por página, datos estructurados.
- [x] Sitemap con ejercicios, rutinas, alimentos, recetas y guías. Metadatos únicos por página.
- [x] Desviación del prompt inicial: el esquema `LocalBusiness` no aplica a una web sin local físico. Usar `WebSite`, `Organization` y `Article` en las guías. Commit.

### Tarea 51: Legal y cookies `[Sonnet · medium]`
**Archivos:** crear `src/app/legal/aviso-legal/`, `privacidad/`, `cookies/`, `src/components/CookieBanner.tsx`.
- [x] Redactar los textos con los datos reales del titular (pedirlos al usuario) y mencionar datos de salud, conservación, derechos y borrado. Recomendar revisión por un profesional antes de publicar.
- [x] Banner solo si hay analítica o cookies no técnicas; sin analítica, solo informar. Test: sin consentimiento no se carga ningún script de analítica. Commit.

**Cierre v0.5:** Fase 5 (calidad) y Fase 6 (despliegue) del proceso general.
