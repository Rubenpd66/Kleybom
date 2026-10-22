# Legalidad de KleyBom — estado y pasos (22/10/2026)

Resumen para el titular. **No es asesoramiento jurídico:** es una base bien documentada que conviene que revise un profesional antes de dar publicidad a la web o empezar a cobrar.

## Qué está hecho

| Obligación | Norma | Dónde está |
|---|---|---|
| Identificar al titular (nombre, NIF, domicilio, correo) | Art. 10 LSSI | `/aviso-legal` (datos en `src/lib/legal/titular.ts`) |
| Aviso de salud | Prudencia; no es consejo médico | Pie de todas las páginas, `/aviso-legal`, cada guía |
| Política de privacidad completa (responsable, datos, bases, encargados, conservación, derechos, AEPD) | Arts. 13 y 14 RGPD | `/privacidad` |
| Consentimiento explícito para datos de salud, con fecha y versión | Arts. 7 y 9.2.a RGPD | Registro y `/consentimiento` (Google) |
| Edad mínima de 14 años | Art. 7 LOPDGDD | Registro y `/privacidad` |
| Derechos desde la web (exportar en JSON, borrar la cuenta) | Arts. 15 a 20 RGPD | Panel y perfil |
| Política de cookies | Art. 22.2 LSSI y guía de la AEPD | `/cookies` |
| Publicidad y donaciones explicadas **solo cuando estén activas** | Transparencia | Los tres textos cambian solos |
| Enlace fijo para cambiar el consentimiento de cookies (solo con anuncios) | Guía AEPD y política de Google | Pie: «Privacidad y cookies» |
| Ningún anuncio ni script de terceros en la zona con datos de salud | Minimización (art. 5 RGPD) | Ver `docs/anuncios.md` |
| Registro de actividades de tratamiento | Art. 30 RGPD (obligatorio por tratar datos de salud) | `docs/legal/registro-actividades.md` (interno) |
| Valoración de la evaluación de impacto (EIPD) | Art. 35 RGPD | En el mismo documento: no parece obligatoria hoy |
| Qué hacer ante una brecha de seguridad (72 h) | Arts. 33 y 34 RGPD | En el mismo documento |
| Seguridad técnica | Art. 32 RGPD | RLS, HTTPS, cabeceras, auditoría (ver `docs/PROGRESO.md`) |

## Lo que te toca **[TÚ]**

1. **Revisión profesional** de `/aviso-legal`, `/privacidad` y `/cookies`, y del registro de actividades, por un abogado o consultor de protección de datos. Sobre todo antes de activar anuncios o donaciones.
2. **Alta fiscal (autónomo o no)** antes de cobrar nada, con un gestor. Si cambian tu NIF, nombre o domicilio, dímelo y actualizo `titular.ts`.
3. **Tu domicilio aparece publicado** en el aviso legal porque la LSSI pide «domicilio o dirección de un establecimiento». Si no quieres que se vea tu casa, pregunta al profesional si puedes usar otra dirección válida (por ejemplo, la de un local o domicilio profesional).
4. **Al activar los anuncios** (además de lo que dice `docs/anuncios.md`):
   - En AdSense → *Privacy & messaging*, crea el mensaje de normativa europea, pon la dirección de tu política de privacidad y comprueba que el botón de rechazar está al mismo nivel que el de aceptar (exigencia de la AEPD).
   - Valora bloquear en AdSense las categorías de anuncios sensibles que no encajen con una web de salud (por ejemplo, apuestas o productos milagro para adelgazar, si aparecen en la lista).
   - Comprueba, en una ficha y en la portada, que el enlace «Privacidad y cookies» del pie abre el aviso de Google.
5. **Google Cloud (inicio de sesión con Google):** la pantalla de consentimiento de OAuth debe tener la dirección de la política de privacidad y la página de inicio. Actualízalas cuando tengas dominio propio.
6. **Revisa el registro de actividades** cada vez que añadas una función con datos personales, y al menos una vez al año.

## Lo que no hace falta (hoy)

- **Delegado de protección de datos (DPO):** no es obligatorio. No eres una autoridad pública y no tratas datos de salud a gran escala.
- **Inscribir ficheros en la AEPD:** ya no existe esa obligación desde el RGPD.
- **Banner propio de cookies:** mientras no haya anuncios, solo hay cookies técnicas (exentas). Con anuncios, el aviso lo pone el gestor certificado de Google.
- **Condiciones de venta o derecho de desistimiento:** KleyBom no vende nada. Las donaciones son voluntarias y no son una compra.

## Fuentes consultadas

- Google: [política de consentimiento de usuarios de la UE en AdSense](https://support.google.com/adsense/answer/7670013), [enlaces de revocación del consentimiento](https://support.google.com/admanager/answer/10114217?hl=es) y [mensajes de normativa europea](https://support.google.com/admanager/answer/10076805).
- AEPD: [cuándo es necesaria una EIPD](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/10-evaluacion-de-impacto/FAQ-0226-en-que-supuestos-es-necesario-realizar-una-evaluacion-de-impacto). La guía de cookies (rechazar tan fácil como aceptar) se ha consultado a través de [Cuatrecasas](https://www.cuatrecasas.com/es/spain/propiedad-intelectual/art/entra-vigor-nuevo-criterio-aepd-uso-de-cookies) y [elderecho.com](https://elderecho.com/la-agencia-espanola-de-proteccion-de-datos-insiste-en-que-las-webs-deben-indicar-claramente-como-rechazar-las-cookies). Conviene leer el original en aepd.es.
- Registro de actividades con datos de salud: [texto del art. 30 RGPD](https://gdpr-text.com/es/read/article-30) y [Legiscope](https://www.legiscope.com/blog/registro-actividades-tratamiento.html).
- Stripe como responsable de los datos de pago: políticas de privacidad de entidades que reciben donaciones con Stripe (no es la de Stripe). Confirmar en stripe.com/es/privacy.
