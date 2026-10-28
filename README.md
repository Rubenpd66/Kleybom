# KleyBom

Web gratuita de fitness y salud: ejercicios, rutinas, calendario, registro de entrenos, nutrición y estadísticas en un solo sitio, sin muros de pago. Se puede ver y probar todo sin cuenta; solo hace falta entrar para guardar.

**Demo:** https://forja-five-zeta.vercel.app

## Qué incluye

- **Ejercicios:** 810 fichas (datos de wger) con buscador, filtros y un mapa del cuerpo para elegir músculo.
- **Rutinas:** 12 plantillas (fuerza, hipertrofia, movilidad, yoga suave, HIIT, cardio en zona 2…), creador de rutinas propias e impresión en PDF.
- **Calendario y entreno:** planificar sesiones, registrar series en directo con temporizador de descanso y comparar con la última vez.
- **Nutrición:** 6.038 alimentos en español, productos por código de barras (Open Food Facts), calculadora de calorías y diario de comidas con objetivos.
- **Recetas:** 30 recetas con foto y calorías por ración.
- **Estadísticas:** constancia, volumen semanal, fuerza estimada y peso con media móvil.
- **Guías:** 9 guías con fuentes (OMS, ACSM, NCCIH…).
- **Cuenta:** correo o Google; perfil, medidas, exportación de datos en JSON y borrado de cuenta.
- **Idiomas y tema:** español e inglés, modo claro u oscuro y un fondo 3D distinto en cada sección.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL y autenticación); las pruebas comprueban que nadie puede ver ni tocar los datos de otra persona
- Three.js para los fondos 3D
- Vitest (241 pruebas de lógica) y Playwright (151 pruebas en navegador, escritorio y móvil)

Lighthouse en la web publicada: rendimiento 94–99; accesibilidad, buenas prácticas y SEO 100.

## Puesta en marcha

Requisitos: Node.js y un proyecto de Supabase.

```bash
npm ci
cp .env.example .env.local   # rellena la URL y la clave publicable de Supabase
npm run dev                  # http://localhost:3000
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Pruebas de lógica (Vitest) |
| `npm run test:e2e` | Pruebas en navegador (Playwright) |
| `npm run lint` | ESLint |

## Documentación

- Estado y entrega: `docs/ENTREGA.md` y `docs/PROGRESO.md`
- Fuentes y licencias de datos e imágenes: `docs/datos-fuentes.md`
- Fórmulas de cálculo: `docs/formulas.md`
- Textos legales y registro de actividades: `docs/legal/`

## Pendiente

- Revisión profesional de los textos legales antes de dar publicidad a la web.
- 223 ejercicios siguen en inglés en la versión española, y todos tienen el nivel provisional «intermedio».
- Donaciones y visor 3D del cuerpo, aplazados.
