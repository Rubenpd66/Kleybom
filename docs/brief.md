# Brief del proyecto

> Fase 1 — Descubrimiento. El usuario decidió saltarse las preguntas, así que todo lo marcado **[mi decisión]** es una propuesta de Claude y se puede cambiar. Lo marcado **[del usuario]** lo dijo el usuario.

## 1. Visión
**[del usuario]** Una web fitness y salud gratuita, la más completa posible, para cualquier persona que quiera cambiar su vida, sus hábitos y su salud. En lugar de consultar una IA o ver vídeos, la persona entra directamente a esta web y lo tiene todo: ejercicios, rutinas, calendario, nutrición y estadísticas, con información detallada de cada ejercicio, alimento y rutina.

**[mi decisión]** Frase guía: *"Todo lo que necesitas para entrenar, comer y progresar, en un solo sitio, gratis y fiable."*

## 2. Público
- Cualquier persona interesada en mejorar su salud y hábitos, de principiante a avanzado.
- **[mi decisión]** Se diseña pensando primero en el principiante (guías claras, explicaciones sencillas) sin quitar profundidad al avanzado (detalle técnico, métricas).

## 3. Nombre y marca
**[del usuario]** Lo elijo yo, con gancho y competitivo.
**[mi decisión]** Nombre de trabajo: **Forja** ("forjar tu mejor versión"). Es corto, en español, fácil de recordar y suena a fuerza.
Alternativas: **Kinetia** (movimiento), **Vitalmente** (cuerpo y mente).
**Pendiente:** no he comprobado si el nombre, el dominio o la marca están libres. Hay que mirarlo antes de decidir (registro de marcas y dominios). Hasta entonces, "Forja" es provisional.

## 4. Qué incluye (funciones)
**[del usuario]**
- Selector de ejercicios.
- Calendario.
- Rutinas.
- Nutrición con muchos alimentos.
- Estadísticas.
- Información completa de cada ejercicio, alimento y rutina.

**[mi decisión]** Detalle de cada pieza:
- **Ejercicios:** buscador y filtros (músculo, equipo, nivel, objetivo). Ficha con descripción, músculos trabajados, errores comunes, variantes, imagen o animación y consejos de seguridad.
- **Rutinas:** rutinas prediseñadas por objetivo y nivel, y constructor de rutinas propias (el usuario elige ejercicios, series y repeticiones). Poder exportar o imprimir.
- **Calendario:** planificar entrenos y comidas, marcar lo hecho, ver la semana y el mes.
- **Registro de entrenos:** series, repeticiones, peso, descanso y esfuerzo percibido, comparando con la sesión anterior para ver la progresión. Temporizador de descanso.
- **Nutrición:** base grande de alimentos con calorías y nutrientes, diario de comidas, objetivos de calorías y macronutrientes, y recetas básicas.
- **Estadísticas:** evolución de pesos levantados, peso corporal y medidas, constancia (días entrenados), resumen semanal.
- **Guías:** artículos cortos y claros (empezar a entrenar, comer mejor, descanso, hábitos).

## 5. Lo que piden los usuarios (investigación)
La búsqueda web dio **evidencia débil**: casi todo eran páginas de reseñas de apps y blogs promocionales, no foros ni estudios. Lo poco que aparece de forma repetida:
- Quejas más comunes: **muros de pago** (funciones que antes eran gratis, como el escáner de código de barras en MyFitnessPal) y webs que cambian la interfaz y se vuelven confusas.
- Peticiones: constructor de rutinas personalizado con ejercicios a elegir, exportar rutinas para imprimir o enviar, y registrar actividad al aire libre.
- Las apps de fuerza registran series, repeticiones, peso, descanso y esfuerzo percibido para ver la progresión.

Esto refuerza dos decisiones: **todo gratis, sin muros de pago**, y **interfaz sencilla**. Lo demás de la lista de la sección 4 viene de mi criterio general y no de datos verificados.
**Pendiente:** una búsqueda más a fondo en foros (por ejemplo Reddit) para validar qué echan en falta los usuarios. Se puede hacer si quieres.

## 6. Datos: de dónde sale el contenido
Copiar de otras webs está descartado (derechos de autor). Fuentes abiertas encontradas, **con lo que se ha confirmado y lo que no**:

| Fuente | Qué aporta | Licencia (según lo encontrado) | Pendiente |
|---|---|---|---|
| **wger** | Ejercicios, con API abierta | Código AGPL-3.0. Los datos de ejercicios llevan una licencia Creative Commons **por cada entrada** (antes se citaba CC-BY-SA 3.0) | Respetar la licencia de cada ejercicio y citar autoría. Algunas imágenes podrían no tener licencia CC |
| **USDA FoodData Central** | Alimentos y nutrientes (en inglés) | Dominio público, CC0 1.0. Piden citar la fuente como cortesía | Necesita clave de API gratuita. Alimentos en inglés: hay que traducirlos |
| **Open Food Facts** | Productos envasados con código de barras | ODbL: exige atribución y **compartir igual** si se mezcla con otras bases | Consultarlo por API como capa aparte, sin fusionarlo con nuestra base. Confirmarlo antes de decidir |
| **BEDCA** (base oficial española) | Alimentos españoles | Uso no comercial permitido citando la fuente; otros usos requieren permiso de AESAN. Las condiciones que encontré son de 2010 | Pedir autorización a AESAN antes de usarla en la web |

**[mi decisión]** Contenido propio (descripciones, guías, consejos) lo redactamos nosotros, con revisión. Las imágenes y animaciones de ejercicios se pueden generar con Nano Banana.
**Pendiente:** ExerciseDB y free-exercise-db: no he podido confirmar su licencia. No usarlas hasta verificarla.

## 7. Donaciones (sin pagos)
**[del usuario]** Sin sistema de pagos. Solo donaciones voluntarias.
**[mi decisión]** Un botón "Apoya el proyecto" con enlace a una plataforma externa de donaciones, para que la web no gestione dinero ni tarjetas. La plataforma concreta queda **pendiente**: hay que comparar comisiones y requisitos.
**Aviso:** recibir ingresos, aunque sean donaciones, puede tener implicaciones fiscales en España. Conviene consultarlo con un gestor antes de abrir el canal.

## 8. Animaciones, 3D y Nano Banana
**[del usuario]** Movimiento y 3D donde haga falta, sin romper la lógica del desarrollo.
**[mi decisión]**
- Primero se construye la web completa y funcional. El movimiento se añade **después**, por capas, y se puede quitar sin romper nada.
- Animaciones 2D suaves en transiciones y botones (poco peso).
- 3D solo en un punto de alto valor: un visor de ejercicio o de músculos trabajados, cargado bajo demanda.
- Respetar a quien tiene activada la opción "reducir movimiento" en su dispositivo.
- Nano Banana (generación de imágenes de Google): ilustraciones, imágenes de portada y de ejercicios. Todas con el mismo estilo visual para que parezcan de una misma marca.
- Límite de rendimiento: Lighthouse ≥ 90 (se mide en la Fase 5).

## 9. Tamaño y entregas
**[mi decisión]** El proyecto es muy grande. Para poder usarlo pronto, se entrega por versiones:
1. **v0.1 Base:** web, cuentas de usuario y biblioteca de ejercicios con fichas y filtros.
2. **v0.2 Rutinas y calendario.**
3. **v0.3 Nutrición:** alimentos, diario y objetivos.
4. **v0.4 Estadísticas y registro de progreso.**
5. **v0.5 Pulido:** 3D, animaciones, donaciones, SEO y legal.

El plan detallado se hace en la Fase 2.

## 10. Idioma
**[mi decisión]** Español (España) de entrada. La estructura se prepara para añadir otros idiomas más adelante.

## 11. Legal y salud
**[mi decisión]**
- Aviso de que la web no sustituye a un médico, nutricionista ni entrenador.
- Peso, medidas y comidas son **datos de salud**: RGPD con cuidado especial, consentimiento claro, poder borrar la cuenta y los datos.
- Aviso legal, política de privacidad y política de cookies (RGPD/LSSI), y banner de cookies si hay analítica.
- No dar pautas peligrosas: límites sensatos en objetivos de calorías y avisos para menores y casos especiales.

## 12. Qué NO es el proyecto (fuera de alcance)
- Sin pagos ni suscripciones.
- Sin planes médicos ni diagnósticos.
- Sin red social ni chat en las primeras versiones.
- Sin app móvil nativa por ahora. La web debe funcionar muy bien en móvil.

## 13. Cómo sabremos que funciona
- Un usuario nuevo puede, sin ayuda: elegir una rutina, apuntarla en el calendario, registrar un entreno y ver su progreso.
- Buscar un alimento y sumar sus calorías al diario en menos de 30 segundos.
- Lighthouse ≥ 90 en rendimiento, accesibilidad, buenas prácticas y SEO.
- Todos los datos de terceros con su licencia respetada y citada.

## 14. Pendientes de decidir con el usuario
- Nombre definitivo, comprobando dominio y marca.
- Plataforma de donaciones y consulta fiscal.
- Dominio y hosting (no mencionados todavía).
- Fecha límite (no mencionada).
- Autorización de BEDCA y estrategia exacta con Open Food Facts.
- Búsqueda más profunda en foros de lo que echan en falta los usuarios.
