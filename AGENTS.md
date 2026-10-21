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
Pendientes: se rellenan cuando se cree el proyecto (instalar, arrancar, build, test).

## Estructura de carpetas
- `docs/` — brief, plan, diseño, progreso, entrega
- Resto: se define al crear el proyecto Next.js.

## Reglas
- Secretos SIEMPRE en `.env`, nunca en git. Mantener un `.env.example` sin valores reales.
- Un commit por tarea, con mensaje claro. Actualizar `docs/PROGRESO.md` al terminar cada tarea y sesión.
- No instalar paquetes ni añadir conectores sin el OK del usuario.
- No inventar: ante la duda, consultar la documentación oficial (Context7).
- El usuario es principiante: explicar en español sencillo, respuestas cortas, y acabar siempre con el siguiente paso.
- Datos de ejercicios y alimentos: usar solo fuentes con licencia que permita su uso; anotar fuente y licencia de cada una en `docs/`.
- Salud: aviso de que la web no sustituye a un profesional sanitario. Los datos de usuario (peso, medidas…) son datos de salud: tratamiento RGPD estricto.
