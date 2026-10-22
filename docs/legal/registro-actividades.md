# Registro de actividades de tratamiento (art. 30 RGPD) — KleyBom

**Documento interno.** No se publica en la web. Hay que tenerlo al día y enseñarlo si lo pide la Agencia Española de Protección de Datos (AEPD).

**Por qué es obligatorio aunque seas una sola persona:** la excepción para quien tiene menos de 250 trabajadores no se aplica si se tratan categorías especiales de datos (art. 9 RGPD, como los de salud) o si el tratamiento no es ocasional (art. 30.5 RGPD). KleyBom guarda datos de salud de forma continua.

- **Responsable:** Ruben Perez Dominguez, NIF 04657271R. Avenida Huerta Abajo, 39B, San Lorenzo de la Parrilla (Cuenca). rubenpd66@gmail.com
- **Delegado de protección de datos:** no designado. No es obligatorio: no es una autoridad pública y no trata datos de salud *a gran escala* (art. 37 RGPD). Revisar si la web crece mucho.
- **Última revisión:** 22/10/2026

---

## 1. Cuentas de usuario

| Campo | Contenido |
|---|---|
| Finalidad | Crear y mantener la cuenta, iniciar sesión (correo y contraseña, o Google) |
| Base jurídica | Ejecución del servicio (art. 6.1.b RGPD) |
| Interesados | Personas registradas (14 años o más) |
| Datos | Correo, contraseña cifrada (la guarda Supabase), nombre y foto si entra con Google, fecha y versión de la política aceptada |
| Destinatarios / encargados | Supabase (UE, Fráncfort), Vercel (alojamiento), Google (solo si elige entrar con Google; responsable de su verificación) |
| Transferencias internacionales | Vercel, posibles, con cláusulas contractuales tipo |
| Conservación | Mientras exista la cuenta; se borra al eliminarla |
| Seguridad | Ver apartado «Medidas de seguridad» |

## 2. Datos de salud y de actividad

| Campo | Contenido |
|---|---|
| Finalidad | Guardar y mostrar a cada persona su peso, medidas, comidas, objetivos, entrenos, series y estadísticas |
| Base jurídica | Consentimiento explícito (art. 9.2.a RGPD), dado al registrarse; con fecha y versión guardadas |
| Interesados | Personas registradas |
| Datos | **Categoría especial (salud):** peso, medidas corporales, comidas, objetivos de nutrición, entrenos y series. Perfil opcional: sexo, fecha de nacimiento, altura, zona horaria |
| Destinatarios / encargados | Supabase (UE). Nunca anunciantes ni Google AdSense |
| Transferencias internacionales | No (datos en la UE) |
| Conservación | Mientras exista la cuenta; borrado inmediato al borrar datos sueltos o la cuenta |
| Seguridad | RLS por usuario en las 17 tablas; ningún script de terceros en la zona personal |

## 3. Seguridad y funcionamiento (registros técnicos)

| Campo | Contenido |
|---|---|
| Finalidad | Seguridad, prevención de abusos y funcionamiento |
| Base jurídica | Interés legítimo (art. 6.1.f RGPD) |
| Interesados | Visitantes |
| Datos | Dirección IP, hora, página pedida, navegador |
| Destinatarios / encargados | Vercel, Supabase |
| Conservación | La de los proveedores (registros temporales) |

## 4. Donaciones *(solo cuando estén activadas)*

| Campo | Contenido |
|---|---|
| Finalidad | Recibir y gestionar donaciones, contestar consultas, contabilidad y obligaciones fiscales |
| Base jurídica | Ejecución de la donación (art. 6.1.b RGPD) y obligación legal (art. 6.1.c RGPD) |
| Interesados | Donantes |
| Datos | Nombre y correo dados a Stripe, importe, fecha, país. No datos de tarjeta |
| Destinatarios | Stripe Payments Europe, Limited (Irlanda), responsable independiente del pago; Agencia Tributaria si lo exige la ley |
| Transferencias internacionales | Stripe, Inc. (EE. UU.), con las garantías del RGPD |
| Conservación | Lo que exija la normativa fiscal y mercantil (habitualmente entre 4 y 6 años) |

## 5. Publicidad *(solo cuando esté activada)*

| Campo | Contenido |
|---|---|
| Finalidad | Mostrar anuncios de Google AdSense en las fichas públicas; recoger el consentimiento de cookies |
| Base jurídica | Consentimiento (art. 6.1.a RGPD y art. 22.2 LSSI), recogido con el gestor certificado de Google (TCF) |
| Interesados | Visitantes de las fichas públicas |
| Datos | Cookies e identificadores del dispositivo, IP, páginas vistas (los trata Google y sus socios) |
| Destinatarios | Google Ireland Limited y los proveedores listados en el aviso de consentimiento, como responsables de sus propios tratamientos |
| Transferencias internacionales | Google (EE. UU.), Marco de Privacidad de Datos UE-EE. UU. |
| Conservación | La que indique cada proveedor en el aviso |
| Medida clave | Nunca hay anuncios ni scripts de terceros en la zona personal (datos de salud), en el inicio de sesión ni en los textos legales |

---

## Medidas de seguridad

- Conexión cifrada (HTTPS, HSTS) y cabeceras de seguridad (CSP, anti-clickjacking).
- Base de datos con seguridad por filas (RLS): cada persona solo lee y cambia sus datos.
- La clave de administración de Supabase solo está en el servidor, nunca en el navegador.
- Borrado de cuenta y exportación de datos (JSON) desde el panel.
- Consentimientos guardados con fecha y versión.
- Auditoría de seguridad del código: 22/10/2026 (ver `docs/PROGRESO.md`).

## Evaluación de impacto (EIPD, art. 35 RGPD)

Según la AEPD, la EIPD es obligatoria, con carácter general, cuando se dan **dos o más** factores de riesgo de su lista. Valoración del 22/10/2026:

- **Datos de categoría especial (salud):** sí. Es **un** factor.
- Gran escala: no (web nueva, pocas personas).
- Perfiles o decisiones automatizadas con efectos sobre las personas: no (KleyBom no hace perfiles; la personalización de anuncios la hace Google, fuera de los datos de salud).
- Observación sistemática, personas vulnerables como objetivo, tecnologías nuevas de alto riesgo, cruce de bases de datos: no.

**Conclusión provisional:** solo se da un factor, así que no parece obligatoria. Volver a valorarlo si el número de usuarios crece mucho (podría pasar a ser «gran escala») o si se añaden funciones nuevas con datos de salud. Ante la duda, el CEPD recomienda hacerla. Fuente: [FAQ de la AEPD sobre la EIPD](https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/10-evaluacion-de-impacto/FAQ-0226-en-que-supuestos-es-necesario-realizar-una-evaluacion-de-impacto). La lista exacta de criterios está en la web de la AEPD: hay que confirmarla allí.

## Si hay una brecha de seguridad

1. Anotar qué ha pasado, cuándo, qué datos y a cuántas personas afecta.
2. Si es probable que suponga un riesgo para las personas, **comunicarlo a la AEPD en un máximo de 72 horas** desde que se conoce (art. 33 RGPD), en su sede electrónica.
3. Si el riesgo es alto (con datos de salud es lo más probable), **avisar también a las personas afectadas** sin dilación (art. 34 RGPD).
4. Guardar un registro de todas las brechas, aunque no se comuniquen.
