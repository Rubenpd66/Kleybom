# SEO de KleyBom (22/10/2026)

Estado de lo técnico, lo que falta y la estrategia para ganar visitas. Escrito para el dueño del proyecto (principiante): lo que te toca a ti está marcado con **[TÚ]**.

## 1. Lo técnico, ya hecho

- **Una dirección por idioma.** Español: `/ejercicios`. Inglés: `/en/ejercicios`. Antes los dos idiomas compartían dirección y cambiaban con una cookie: Google no lleva cookies, así que solo habría visto el español. Google lo desaconseja de forma expresa ([Google: sitios multilingües](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)).
- **`hreflang`** en el sitemap y en las páginas con canónica (portada, guías, fichas de ejercicio, textos legales): cada versión señala a la otra y hay un `x-default` (español).
- **Sitemap** con las dos versiones de cada página (~14.000 direcciones, el límite de Google es 50.000 por archivo). Las zonas privadas (`/panel`, `/nutricion`, `/calendario`...) quedan fuera, también en `/en/...`.
- **robots.txt** bloquea las zonas privadas en los dos idiomas.
- **Datos estructurados** (JSON-LD): `WebSite`, `Organization` y `Article` en las guías.
- **Cabeceras de seguridad** (ver `docs/PROGRESO.md`): ayudan a la confianza del navegador, no al ranking directamente.
- Si `/en/...` se pide sin sesión en una zona privada, se redirige a `/en/entrar` (probado).

## 2. Lo que te toca **[TÚ]**

1. **Dominio propio.** Ahora la web vive en `forja-five-zeta.vercel.app`, un subdominio de Vercel. Es el mayor freno para el SEO y, como se ve en el punto de anuncios, probablemente impida que te aprueben AdSense. Un dominio `.com` o `.es` cuesta unos 10–15 €/año. Hay que comprarlo y conectarlo en Vercel → Settings → Domains. Después: cambiar `NEXT_PUBLIC_SITE_URL` en Vercel y el valor por defecto de `src/lib/seo/site.ts` (me lo dices y lo hago), y actualizar la dirección en Supabase (Site URL y Redirect URLs) y en Google Cloud (inicio de sesión).
2. **Google Search Console** (gratis): añadir el dominio como propiedad "Dominio" (verificación por DNS), enviar `https://TU-DOMINIO/sitemap.xml` y mirar el informe "Páginas" para ver cuáles se indexan y cuáles no. Es la mejor señal de si Google está contento con tu web.
3. **Bing Webmaster Tools** (gratis): se puede importar directamente desde Search Console. Importa porque Bing alimenta a otros buscadores y asistentes.

## 3. El riesgo principal: demasiadas páginas "de datos"

KleyBom tiene ~6.000 alimentos, ~800 ejercicios y cientos de fichas sacadas de bases de datos. Google tiene una política contra el **contenido a escala sin valor añadido** ("scaled content abuse"): páginas generadas en masa sobre todo para posicionar. El método no es lo que cuenta (una plantilla rellena desde una hoja de cálculo también cuenta); lo que cuenta es si cada página aporta algo útil y distinto. Google no publica un número de páginas a partir del cual sea un problema y el consenso de las fuentes es que las páginas con datos reales y distintos pueden funcionar ([resumen de la política](https://ppc.land/scaled-content-abuse/), [programmatic SEO en 2026](https://alexcloudstar.com/blog/programmatic-seo-2026-indie-hackers/); son blogs del sector, no Google, así que es orientativo).

Qué significa para ti:
- Las **guías, recetas y rutinas** (contenido con texto propio y fuentes) son tu mejor apuesta: invertir ahí.
- Las **fichas de alimentos** tienen datos reales (nutrientes) pero poco texto propio. Riesgo medio. Mejora posible: más contexto por ficha (comparaciones, "para qué sirve", porciones habituales).
- Los **ejercicios con descripción vacía o solo en inglés** son las más flojas. Mejor mejorarlas o ponerles `noindex` hasta que tengan contenido (se puede hacer por regla: sin descripción → `noindex`).
- Vigilar en Search Console el estado "Rastreada: actualmente sin indexar". Si hay muchas, es la señal de que Google las considera poco valiosas.

## 4. Cómo ganar visitas de forma sostenible

1. **Contenido útil en lo que ya tienes**: más guías (con fuentes oficiales: OMS, ministerios, sociedades científicas), recetas con fotos propias, rutinas bien explicadas. Pensar en preguntas reales ("rutina de fuerza en casa para principiantes", "cuántas proteínas necesito").
2. **Confianza (E-E-A-T)**. Salud y nutrición son temas "tu dinero o tu vida" (YMYL), que Google evalúa con más exigencia. Lo recomendado en las fuentes del sector: firmar el contenido con autor y credenciales, citar fuentes primarias, mostrar fecha de revisión y, si es posible, que lo revise un profesional (dietista-nutricionista, entrenador titulado). Tus guías ya llevan fuentes y fecha; **añadir una revisión profesional** sería el salto más grande ([E-E-A-T para webs de salud](https://www.ranktracker.com/blog/e-e-a-t-for-health-and-wellness-websites-a-ymyl-focus/), fuente del sector). **[TÚ]**: decidir si puedes contar con un profesional que revise o firme.
3. **Velocidad**. Los umbrales de "bueno" son LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1, medidos con visitantes reales ([Core Web Vitals 2026](https://eseospace.com/blog/core-web-vitals-in-2026-what-changed-what-still-matters-and-how-to-pass/), fuente del sector; contrastar en web.dev). La web ya carga el 3D bajo demanda. Cuando haya visitantes reales, mirar el informe de "Experiencia de página" en Search Console. Importante: los **anuncios empeoran** estas métricas, por eso se integran con cuidado (siguiente fase).
4. **Enlaces de otras webs** (el factor más difícil): compartir las guías en comunidades de fitness, contactar con blogs de nutrición, aparecer en directorios de apps y herramientas gratuitas. Una calculadora de macros o un buscador de ejercicios gratis y bueno es "enlazable" por sí mismo.
5. **Compartir en redes** ya funciona (imagen 1200 × 630 en todas las páginas).

## 5. Pendiente técnico que puedo hacer cuando quieras

- `noindex` automático para fichas flojas (ejercicios sin descripción).
- `hreflang` también en el resto de páginas con listados (hoy está en el sitemap, que Google acepta como método único).
- Revisar títulos y descripciones de las páginas de listado con las palabras que busca la gente.
- Datos estructurados de receta (`Recipe`) y de ejercicio, para resultados enriquecidos.
- Medir con Lighthouse y Search Console una vez haya dominio propio.
