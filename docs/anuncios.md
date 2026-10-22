# Anuncios de terceros (AdSense) — KleyBom (22/10/2026)

Todo está **preparado pero apagado**: sin las variables de abajo, la web no carga ningún script de terceros ni muestra anuncios. Lo que te toca a ti está marcado con **[TÚ]**.

> **Orden importante.** No actives nada de esto en la web pública hasta tener hecha la **fase de legalidad** (política de cookies y privacidad al día) y decidida la **alta como autónomo** (ver `docs/PROGRESO.md`). Los anuncios usan cookies de terceros y generan ingresos habituales.

## Qué hay construido

- `src/lib/anuncios.ts`: lee `NEXT_PUBLIC_ADSENSE_ID` (`ca-pub-...`) y `NEXT_PUBLIC_ADSENSE_SLOT` (solo cifras); cualquier otro valor se ignora.
- **Meta-etiqueta** `google-adsense-account` en todas las páginas (con el ID): sirve para que Google verifique que la web es tuya sin cargar ningún script.
- **`/ads.txt`** generado a partir del ID (404 si no hay ID). Google lo usa para saber quién puede vender tu publicidad.
- **Componente `Anuncio`** (`src/components/ui/Anuncio.tsx`), al final de las **fichas de contenido**: guías, recetas, ejercicios, alimentos y rutinas. Lleva la etiqueta "Publicidad" (los anuncios deben poder distinguirse del contenido), reserva 280 px de altura para que la página no salte (CLS), solo descarga el script de Google cuando hay un anuncio que mostrar y se oculta entero si Google no tiene anuncio para ese hueco.
- **Dónde NO hay anuncios**, a propósito: portada, listados, zona privada (`/panel`, diario, calendario, estadísticas...: son datos de salud), inicio de sesión y textos legales. Las páginas de datos personales no deben cargar scripts de terceros.
- **Consentimiento**: lo muestra Google con su herramienta gratuita "Privacy & messaging" (ver paso 3). No hay un banner propio.
- La seguridad (CSP) no necesita cambios: hoy no restringe scripts.
- La portada ya no dice "sin anuncios" (ahora: "Gratis y sin letra pequeña").

## Por qué Google y su gestor de consentimiento

Para servir anuncios en el Espacio Económico Europeo, Reino Unido y Suiza, Google exige un **gestor de consentimiento (CMP) certificado e integrado con el IAB TCF** desde el 16 de enero de 2024. Se puede usar el de Google ("Privacy & messaging", gratis), uno de terceros certificado o uno propio certificado ([Google: mensajes de la normativa europea](https://support.google.com/admanager/answer/10076805), vía una búsqueda; los detalles de proveedores vienen de blogs comerciales). El de Google es lo más simple y no cuesta nada. Además, la AEPD exige que **rechazar sea tan fácil como aceptar** (botones al mismo nivel y con el mismo peso visual): el mensaje de Google permite configurarlo así; hay que revisar que lo cumple al crearlo.

## Pasos **[TÚ]**, en este orden

0. **Antes de nada:** fase de legalidad hecha y decisión sobre el alta de autónomo (ver el resumen fiscal en la conversación de la fase de donaciones).
1. **Dominio propio.** Con la dirección `*.vercel.app` es muy probable que AdSense no apruebe la web (no eres el dueño del dominio principal). Ver `docs/seo.md`.
2. **Crear la cuenta de AdSense** con tu cuenta de Google: <https://adsense.google.com>. Te pedirá la dirección de la web, tus datos fiscales y un método de cobro (banco). Todo a tu nombre real.
3. **Configurar el consentimiento** (en AdSense → *Privacy & messaging*): crear el mensaje de "regulaciones europeas" (TCF) y publicarlo. Comprobar que "Rechazar todo" está al mismo nivel que "Aceptar".
4. **Activar la verificación:** en Vercel → Settings → Environment Variables, crear `NEXT_PUBLIC_ADSENSE_ID` con tu ID (`ca-pub-XXXXXXXXXXXXXXXX`, lo ves en AdSense → Cuenta) y redeplegar. Después, en AdSense, añadir la web y verificar con la meta-etiqueta (ya está puesta) y comprobar que `https://TU-DOMINIO/ads.txt` se ve.
5. **Esperar la revisión de Google** (de días a semanas). Requisitos habituales para que aprueben: contenido propio, útil y suficiente, textos legales visibles, navegación clara y dominio propio. Tu contenido de salud se evalúa con más cuidado: guías con fuentes y revisión profesional ayudan.
6. **Con la web aprobada**, en AdSense (los nombres de los menús pueden cambiar) crear un bloque **"Display" adaptable** y copiar su número de bloque (solo cifras). En Vercel crear `NEXT_PUBLIC_ADSENSE_SLOT` con ese número y redeplegar. Ya se verán anuncios en las fichas.
7. **Actualizar** la política de cookies y la de privacidad con Google AdSense (se hace en la fase de legalidad) **antes** del paso 4.

## Reglas para no perder la cuenta

- **Nunca hagas clic en tus propios anuncios** ni pidas a otros que lo hagan: es el motivo más habitual de cierre de cuentas.
- No pongas más anuncios de los permitidos ni los disfraces de contenido (por eso va la etiqueta "Publicidad").
- Mira las políticas vigentes del programa: <https://support.google.com/publisherpolicies/answer/48182>. Los contenidos de salud tienen restricciones concretas en cuanto a los anuncios que pueden aparecer; nada de esto sustituye leer esa página.

## Lo que conviene saber

- **Rendimiento:** los anuncios son lo que más empeora la velocidad de una web (LCP/CLS). Por eso solo van en fichas, con espacio reservado y carga diferida. Vigila Search Console → Experiencia tras activarlos.
- **Ingresos:** dependen del tráfico, del país de los visitantes y del tema; no puedo prometer cifras. Con poco tráfico serán pocos euros; solo a título orientativo, necesitarás muchas visitas mensuales para que se note.
- **Alternativas** cuando haya mucho tráfico (redes que exigen mínimos altos de visitas): Mediavine, Raptive, Ezoic. No son para empezar.
