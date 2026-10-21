# Diseño — Forja (provisional)

Propuesta visual de la Fase 3. Maqueta de la página de inicio: [docs/diseno/inicio.html](diseno/inicio.html) (ábrela en el navegador). Capturas: `docs/diseno/captura-escritorio.png` y `captura-movil.png`.
Las imágenes y los textos de ejemplo son provisionales. La marca "Forja" sigue pendiente de comprobar (dominio y marca).

## Idea
El nombre viene de la forja. Al templar acero, el metal pasa de gris a amarillo paja y luego a azul. Esa secuencia es la identidad visual: **gris acero → ámbar → azul templado**. Es una decisión propia de este proyecto, no la típica web fitness oscura con naranja.

## Colores
| Nombre | Valor | Uso |
|---|---|---|
| Tiza | `#EDEFEA` | Fondo general |
| Papel | `#F8F9F6` | Fichas y paneles |
| Hierro | `#1C2126` | Texto, botón principal, paneles oscuros |
| Acero | `#4F5D68` | Texto secundario |
| Línea | `#C9CFC8` | Bordes finos y separadores |
| Temple | `#F0B429` | Acento: selección, progreso, donar. Siempre con texto Hierro encima |
| Temple oscuro | `#8A5F00` | El punto del logo sobre fondo claro |
| Azul templado | `#2F5D8A` | Enlaces, gráficos, foco de teclado |

Regla: el ámbar nunca lleva texto blanco. El azul y el ámbar nunca son los únicos portadores de información (siempre hay texto o forma).

## Tipografías (Google Fonts)
- **Titulares:** Big Shoulders Display, pesos 700 y 800. Condensada, aspecto de estampado industrial. Siempre en minúsculas y mayúsculas normales.
- **Texto:** Schibsted Grotesk, pesos 400, 500 y 700.
- Escala (≈ razón 1,25): 17 px texto · 24–27 px subtítulos · 1,7 rem h3 · 2,2–3,6 rem h2 · 3,2–6,6 rem h1 (fluida con `clamp`).
- Líneas de texto de 62 caracteres como máximo.

## Espaciado, bordes y sombras
- Unidad de 4 px: 4, 8, 12, 16, 24, 32, 48, 72, 112.
- Contenedor de 1180 px, margen lateral de 24 px.
- Esquinas: 6 px en botones y controles, 12 px en paneles, 999 px en etiquetas de nivel y selectores. No todo tiene el mismo radio.
- Sin sombras. La jerarquía se marca con borde de 1,5 px en Hierro o con cambio de fondo.

## Componentes definidos en la maqueta
- Cabecera con logo, navegación y botón "Entrar".
- Botones: principal (Hierro), secundario (borde), donar (ámbar).
- Selector de músculos con resultados en directo (el elemento memorable de la portada).
- Ficha de ejercicio: imagen, músculos principales (ámbar) y secundarios (borde), nivel, pasos, error común y licencia.
- Ficha de alimento: tabla por 100 g, "— sin dato" cuando falta un valor, barra de reparto de calorías con leyenda.
- Gráfico de progreso con puntos y tabla alternativa (la tabla se añade en la Tarea 42 del plan).
- Lista de contenidos con filas de distinta estructura (sin tarjetas idénticas).
- Bloque de donaciones sobre fondo Hierro.
- Pie con aviso de salud.

## Movimiento
- **Un solo movimiento automático:** la barra de temple de la portada se "calienta" una vez al cargar (1,4 s).
- Respuesta a acciones: los botones suben 2 px al pasar el ratón, y los selectores cambian de color al pulsarlos.
- Con "reducir movimiento" activado en el dispositivo, no hay ninguna animación.
- El 3D y otras animaciones se añaden en la versión 0.5, nunca antes, y con el visor 3D cargado bajo demanda.

## Textos
- Frases en minúsculas y mayúsculas normales, verbos claros: "Explorar ejercicios", "Crear mi cuenta", "Apoyar el proyecto".
- Un dato que falta se muestra como "— sin dato", nunca como 0.
- Estados vacíos: dicen qué hacer ("Aún no has registrado nada. Empieza por…").
- Errores: dicen qué ha pasado y cómo arreglarlo, sin disculpas ni vaguedades.

## Accesibilidad (mínimos)
- Foco visible en todo: contorno azul de 3 px.
- Contraste de texto suficiente en todos los pares de la paleta.
- Etiquetas `aria` en el selector, los gráficos y la barra de calorías.
- Funciona en 375 px de ancho sin scroll horizontal (comprobado).

## Pendiente
- **Menú de móvil:** la maqueta oculta la navegación en pantallas pequeñas; el botón de menú se crea en la Tarea 3.
- **Imágenes:** las de ejercicios y portada se generan con Nano Banana (Tarea 46). En la maqueta hay un marcador.
- **Dos ideas de este diseño que pueden gustar o no:** la portada con demo en lugar de foto, y el fondo claro (en vez del oscuro habitual del sector).
- Páginas interiores (ejercicios, rutinas, calendario, nutrición, estadísticas): se diseñan al construirlas, con estos mismos elementos.
