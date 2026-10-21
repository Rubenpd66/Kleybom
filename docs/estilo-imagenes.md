# Estilo de imágenes de Forja

Imágenes generadas con Nano Banana (Gemini). Este documento guarda el estilo y los prompts para que todas parezcan de la misma marca.

## Imágenes en uso

| Archivo | Origen | Dónde se usa | Texto alternativo |
|---|---|---|---|
| `public/img/entreno-horizontal.webp` (1024×572) | Gemini, facilitada por el titular el 21/10/2026 | Portada, escritorio | Un hombre se ata las zapatillas sentado en un banco de un gimnasio amplio y luminoso; a su lado, una tableta muestra estadísticas de entrenamiento. |
| `public/img/entreno-vertical.webp` (572×1024) | Ídem, versión vertical | Portada, móvil | Ídem |
| `public/img/compartir.jpg` (1200×630) | Recorte de la horizontal | Vista previa al compartir en redes (Open Graph) | Forja: un gimnasio luminoso con una tableta que muestra estadísticas de entrenamiento |

Optimización: PNG de ~1 MB pasados a WebP (calidad 80, ~60 KB) con `sharp`; `next/image` sirve además el tamaño adecuado a cada pantalla.

## El estilo (copiar al principio de cada prompt)

> Fotografía editorial realista, luz natural de día. Gimnasio industrial amplio: hormigón visto, vigas de acero gris, grandes ventanales, lámparas colgantes de latón cálido, suelo de caucho negro y bancos de madera. Paleta apagada de grises acero con un único acento ámbar cálido y algún toque azul acero. Ambiente tranquilo y real, sin dramatismo. Personas normales y en forma, no culturistas. Ropa deportiva lisa sin logotipos. Sin texto, sin marcas, sin marcas de agua. Encuadre limpio con espacio libre para poner texto encima.

Reglas:
- **Variedad real:** mujeres y hombres, distintas edades (20 a 65 años), cuerpos y orígenes. Que no salgan siempre los mismos.
- **Técnica correcta:** si alguien hace un ejercicio, espalda neutra y postura segura. Revisa cada imagen: la IA a veces dibuja agarres o rodillas imposibles. **No uses IA para enseñar la técnica de un ejercicio**; para eso están las fichas.
- **Pantallas:** la IA inventa interfaces que no son Forja. Para anuncios, mejor dejar la pantalla en blanco o desenfocada y pegar encima una captura real de la web.
- **Sin promesas:** nada de "antes y después", cuerpos extremos ni cifras de kilos perdidos.

## Prompts para la web

Formato 16:9 salvo que se indique otro. Pega el estilo y después el prompt.

1. **Guía "Empezar a entrenar":** Una mujer de unos 40 años hace una sentadilla goblet con una kettlebell ligera, con buena técnica, junto a un ventanal. Plano medio, mucho espacio libre a la derecha.
2. **Guía "Comer mejor":** Vista cenital de una mesa de madera con un plato sencillo: arroz, pollo a la plancha, brócoli y tomate; una pieza de fruta y un vaso de agua. Luz natural lateral, sin personas.
3. **Guía "Descanso y sueño":** Un dormitorio sencillo al amanecer, luz suave entrando por la ventana, cama deshecha, zapatillas de deporte junto a la puerta. Tonos grises y un toque ámbar.
4. **Guía "Crear el hábito":** Un hombre de unos 55 años deja su bolsa de deporte en la taquilla del gimnasio, sonríe levemente. En la pared, un calendario de papel con varios días marcados con una cruz ámbar.
5. **Guía "Progresar en fuerza":** Primer plano de unas manos colocando un disco pequeño de 2,5 kg en una barra; tiza en las manos; fondo desenfocado del gimnasio.
6. **Recetas (cabecera):** Encimera de cocina con ingredientes frescos sin cocinar: huevos, patatas, garbanzos, espinacas, aceite de oliva. Luz de mañana, sin personas.

## Prompts para anuncios en redes

Formatos: 1:1 (feed), 4:5 (Instagram), 9:16 (historias, reels y TikTok). Deja la parte de arriba o la de abajo libre para el texto.

1. **"Tu entreno, ordenado" (9:16):** Una mujer de unos 30 años, sentada en el suelo del gimnasio tras entrenar, mira su móvil con expresión satisfecha. La pantalla del móvil se ve en blanco. Tercio superior libre para texto.
2. **"Sin pagar nada" (1:1):** Bodegón: zapatillas de deporte, una botella de agua y un móvil con la pantalla en blanco sobre un banco de madera del gimnasio. Mucho espacio vacío alrededor.
3. **"Para cualquier edad" (4:5):** Tres personas de edades distintas (25, 45 y 65 años) estiran juntas en un gimnasio luminoso, ambiente relajado.
4. **"Come mejor, sin dietas milagro" (4:5):** Una persona prepara una fiambrera con verduras y legumbres en una cocina luminosa; móvil apoyado con la pantalla en blanco.

**Texto que acompaña (idea):** "Ejercicios, rutinas, calendario y nutrición en un solo sitio. Gratis, sin anuncios y sin letra pequeña." Y al final, el aviso: "Información general: no sustituye a un profesional sanitario."

## Prompts para vídeo (Veo, 8 segundos)

1. Cámara lenta y suave que se acerca a un hombre que se ata las zapatillas en un banco de un gimnasio industrial luminoso; termina en la tableta a su lado, con la pantalla en blanco. Sin cortes, sin texto.
2. Plano fijo: una mano marca con un rotulador ámbar una cruz en un calendario de papel en la pared del gimnasio; al fondo, desenfocado, alguien entrena. Sin texto.
3. Travelling lateral por una encimera con ingredientes frescos hasta un plato equilibrado servido. Luz natural, sin personas, sin texto.

Después de generarlo, añade el texto, el nombre "Forja" y una captura real de la web en el editor de vídeo.
