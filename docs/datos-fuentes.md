# Fuentes de datos

## wger (ejercicios)
- **Qué es:** base de datos abierta de ejercicios. API: https://wger.de/api/v2/exerciseinfo/
- **Licencias vistas en los datos:** CC-BY-SA 3, CC-BY-SA 4 y CC0. Cada ejercicio trae su licencia y su autor.
- **Qué exigen:** CC-BY-SA pide indicar el autor y la licencia y compartir las adaptaciones con la misma licencia. Por eso cada ejercicio guarda `license` y `author`, y la ficha los debe mostrar.
- **Qué se descarta:** ejercicios sin licencia, sin autor o sin nombre (simulación del 21/10/2026: 122 de 932).
- **Imágenes:** solo se usan si la imagen tiene licencia y autor propios (22/10/2026: 185). Se revisaron a mano y se descartaron 21 con logotipos, marcas de agua o avisos de copyright de otras webs (lista en `scripts/imagenes-wger/run.ts`); quedan 164. Se copian a `public/img/ejercicios/<slug>.webp` (fondo blanco, 640 px) y la ficha muestra su autor y licencia. Cómo: `node scripts/imagenes-wger/run.ts` (también guarda el nombre y los pasos originales en inglés).
- **Ejercicios sin foto (646):** se dibuja el cuerpo de frente y de espaldas con los músculos que trabaja (dibujo de `react-body-highlighter`, MIT), en ámbar los principales y más suave los secundarios.
- **Ojo:** volver a ejecutar `scripts/import-wger/run.ts` pondría otra vez la dirección de wger en `image_url`; después hay que repetir `scripts/imagenes-wger/run.ts`.
- **Pendiente de revisar tras importar:** `needs_translation` (texto en inglés, traducir al español) y `needs_level_review` (wger no indica nivel; se pone "intermedio" provisional).
- **Cómo se importa:** `node scripts/import-wger/run.ts --dry-run` cuenta sin escribir; sin `--dry-run` escribe en Supabase y necesita `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`. Se puede repetir sin duplicar.

## USDA FoodData Central (alimentos)
- **Qué es:** base pública de alimentos y nutrientes del Departamento de Agricultura de EE. UU. Usamos el conjunto **SR Legacy** (alimentos genéricos, abril de 2018), descargado de https://fdc.nal.usda.gov/download-datasets (no necesita clave de API).
- **Licencia:** dominio público (CC0 1.0). USDA pide citarla como cortesía.
- **Cita que mostramos:** "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central." (https://fdc.nal.usda.gov/)
- **Qué se importa:** 6.061 de 7.793 alimentos (21/10/2026). Se descartan productos de marca y las categorías comida de bebé, comida rápida, restaurantes, platos preparados y alimentos tradicionales de Alaska.
- **Nutrientes (por 100 g):** energía (kcal; si falta, kJ convertido), proteína, hidratos, grasa, fibra, azúcares y sodio. Un nutriente ausente se guarda como vacío, nunca como 0 (sin dato: fibra 372, azúcares 1.564, sodio 29).
- **Por qué no Foundation Foods:** es más moderno pero solo tiene 363 alimentos y a muchos les falta la energía.
- **Cómo se importa:** `node scripts/import-usda/run.ts <ruta al JSON> --dry-run` cuenta; sin `--dry-run` escribe. Repetible: no pisa los nombres ya traducidos.
- **Nombres en español:** traducidos por nosotros (Tarea 26) con el glosario de `docs/glosario-alimentos.md`. Se quitaron además 23 productos de marca que el primer filtro no detectó (quedan 6.038 alimentos).

## Open Food Facts (productos envasados por código de barras)
- **Qué es:** base colaborativa de productos envasados. API: `https://world.openfoodfacts.org/api/v2/product/<código>`.
- **Licencia:** base de datos bajo Open Database License (ODbL): exige atribución y "compartir igual" si se mezcla con otra base. Las fotos tienen otra licencia (CC BY-SA) y no las mostramos.
- **Cómo la usamos (Tarea 33):** se consulta en directo desde `/alimentos/codigo` y `/api/openfoodfacts/<código>`. **No se copian sus datos a nuestra tabla `foods`** (así no se mezcla con USDA y no se activa el "compartir igual"). Se muestra siempre la atribución con enlace a la ficha del producto. Las respuestas se cachean un día.
- **Identificación:** se envía el User-Agent `Forja/0.3 (https://forja-five-zeta.vercel.app)`, como pide Open Food Facts.
- **Limitación:** como no se guardan en nuestra base, los productos envasados todavía no se pueden apuntar en el diario de comidas.
- **Pendiente de confirmar por el usuario:** que esta estrategia de licencia le parece bien (el plan lo dejaba a su decisión).

## Fuentes de las guías (Tarea 45)
Textos redactados por Forja; las cifras salen de estas fuentes, comprobadas el 21/10/2026 en el original o en su resumen oficial. Solo se citan, no se copia su texto.
- **OMS 2020, actividad física:** Bull FC et al., Br J Sports Med 2020;54(24):1451-1462 (https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/). Acceso abierto CC BY-NC.
- **OMS, alimentación sana:** nota descriptiva de 26/01/2026 (https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet).
- **Sueño:** Watson NF et al., Sleep 2015;38(6):843-844 (https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/).
- **Fuerza:** ACSM, Med Sci Sports Exerc 2009;41(3):687-708 (resumen en PubMed 19204579). Existe una actualización de 2026 sin revisar todavía: revisarla al actualizar la guía de progresión.
- **Guías nuevas (22/10/2026):** meditación y yoga con las páginas del NCCIH (EE. UU.) "Meditation and Mindfulness: Effectiveness and Safety" (actualizada en junio de 2022) y "Yoga: Effectiveness and Safety", leídas en el original; flexibilidad, equilibrio y cardio con el posicionamiento del ACSM de 2011 (Garber CE et al., Med Sci Sports Exerc 2011;43(7):1334-1359; resumen leído en Europe PMC) y la OMS 2020. Una guía de hidratación quedó fuera: no se pudo leer la fuente oficial (EFSA) para comprobar las cifras.
- **Hábitos:** Lally P et al., Eur J Soc Psychol 2010;40(6):998-1009 (resumen leído vía OpenAlex). La cifra popular de "66 días" no aparece en el resumen, así que no se usa.

## Mapa del cuerpo (selector de músculos en /ejercicios)
- **Paquete:** `react-body-highlighter` 2.0.5 (https://github.com/GV79/react-body-highlighter), licencia MIT (uso libre, conservando el aviso de copyright, que va dentro del paquete instalado).
- **Uso:** dibujo de frente y de espaldas; cada zona se traduce a un músculo del catálogo en `src/lib/exercises/bodymap.ts`. Las zonas sin músculo en el catálogo (antebrazo, lumbar, aductores…) no hacen nada.

## Fondos 3D (three.js)
- **Paquete:** `three` 0.180.0 (https://threejs.org), licencia MIT. Las 12 escenas son código propio (`src/components/fondo/escenas.ts`), sin modelos ni texturas de terceros.

## Wikimedia Commons (fotos de alimentos y recetas)
- **Qué es:** el banco de imágenes libres de la Fundación Wikimedia. API pública: https://commons.wikimedia.org/w/api.php
- **Licencias admitidas:** CC0, dominio público, CC BY y CC BY-SA (todas permiten el uso con atribución). Se comprueba en cada foto.
- **Qué exigen:** citar autor y licencia, con enlace. Cada ficha muestra "Foto: autor · licencia · Wikimedia Commons".
- **Alimentos (22/10/2026):** 98 fotos, una por tipo de alimento (pollo, arroz, manzana…), no por alimento. El tipo se deduce del nombre original en inglés con las reglas de `src/lib/foods/imagen.ts`; si no encaja, el de su categoría USDA. Fotos en `public/img/alimentos/`, autoría en `src/lib/foods/imagenes.json`.
- **Cómo se eligieron:** el script baja 4 candidatas por tipo, se revisaron a mano y la elegida queda fijada en `scripts/imagenes-commons/busquedas.ts`. Repetir: `node scripts/imagenes-commons/run.ts alimentos`.
- **Recetas (22/10/2026):** 30 fotos, una por receta, elegidas a mano igual que las de alimentos. Fotos en `public/img/recetas/<slug>.webp`, autoría en `src/lib/recipes/imagenes.json`. Repetir: `node scripts/imagenes-commons/run.ts recetas`. Las columnas `image_*` de la tabla `recipes` quedan sin uso.
