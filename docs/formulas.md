# Fórmulas de calorías y macronutrientes (Tarea 29)

Implementadas en `src/lib/nutrition/targets.ts`. Son **estimaciones orientativas** para adultos sanos: la web avisa de que no sustituyen a un profesional sanitario. Revisado el 21/10/2026.

## 1. Gasto en reposo: Mifflin-St Jeor
- Hombres: 10 × peso (kg) + 6,25 × altura (cm) − 5 × edad (años) + 5
- Mujeres: 10 × peso (kg) + 6,25 × altura (cm) − 5 × edad (años) − 161
- **Fuente:** Mifflin MD, St Jeor ST, et al. *A new predictive equation for resting energy expenditure in healthy individuals.* Am J Clin Nutr. 1990;51(2):241-247. Obtenida de 498 adultos sanos de 19 a 78 años, con peso normal y con obesidad.
- **Por eso** solo se calcula para mayores de 18 años. Para menores (que aún crecen) la web recomienda consultar con un profesional. El plan proponía permitir desde los 14; se ha cambiado por prudencia.

## 2. Nivel de actividad (multiplicador)
El informe de la FAO/OMS/UNU (2004), tabla 5.3, clasifica el nivel de actividad física (PAL) de los adultos así:

| Estilo de vida (FAO) | PAL |
|---|---|
| Sedentario o actividad ligera | 1,40–1,69 |
| Activo o moderadamente activo | 1,70–1,99 |
| Vigoroso | 2,00–2,40 (por encima de 2,40 es difícil de mantener) |

Además indica que el rango sostenible para adultos que hacen vida normal va de 1,40 a 2,40.

Valores usados:

| Opción en la web | Multiplicador | Criterio |
|---|---|---|
| Sedentario | 1,40 | límite inferior del rango sedentario |
| Ligero | 1,55 | centro del rango sedentario/ligero |
| Moderado | 1,85 | centro del rango activo |
| Alto | 2,20 | centro del rango vigoroso |

- **Fuente:** FAO/WHO/UNU. *Human energy requirements.* Food and Nutrition Technical Report Series 1. Roma, 2004. Cap. 5, sección 5.3: https://www.fao.org/4/y5686e/y5686e07.htm
- **Cambio respecto al plan:** se proponían 1,2 / 1,375 / 1,55 / 1,725 (multiplicadores populares sin fuente oficial clara); se sustituyen por los de la FAO. El 1,2 corresponde más bien a estar en cama.

## 3. Ajuste según el objetivo
- Perder peso: −15 %. Mantener: 0 %. Ganar: +10 %.
- Es una **decisión del proyecto** (moderada a propósito), no un valor de una guía. Como referencia, los materiales del NHLBI (EE. UU.) hablan de déficits de 500 a 1000 kcal/día para perder peso; nuestro −15 % suele quedar por debajo, que es más prudente.

## 4. Mínimo de seguridad
- La web nunca propone menos de **1200 kcal (mujer) o 1500 kcal (hombre)**; si el cálculo da menos, se usa el mínimo y se avisa.
- **Aviso honesto:** estas cifras son una regla prudente muy extendida, pero **no hemos encontrado una guía oficial** que las fije. Se usan como protección, no como recomendación médica. Están en una constante configurable (`MINIMO_KCAL`).

## 5. Macronutrientes
- **Proteína** (gramos por kg de peso):
  - Sedentario: 1,0 g/kg.
  - Resto: perder 1,6 · mantener 1,4 · ganar 1,6 g/kg.
  - **Fuentes:** EFSA fija la ingesta de referencia de la población adulta en 0,83 g/kg/día y considera seguras ingestas de hasta el doble (≈1,66 g/kg) (*EFSA Journal* 2012;10(2):2557, nota de prensa: https://www.efsa.europa.eu/en/press/news/120209). La ISSN recomienda 1,4–2,0 g/kg/día para personas que hacen ejercicio (Jäger R, et al. *J Int Soc Sports Nutr.* 2017;14:20, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5477153/). Nuestros valores (1,0–1,6) caben en ambos.
- **Grasa:** 30 % de las calorías. EFSA (2010) recomienda entre el 20 y el 35 % de la energía.
- **Hidratos:** el resto de las calorías. EFSA (2010) recomienda entre el 45 y el 60 %; con mucha proteína y pocas calorías puede quedar algo por debajo, lo cual se acepta.
- **Energía por gramo:** 4 kcal (proteína e hidratos), 9 kcal (grasa).
- Nota: los rangos de EFSA para grasa e hidratos (2010) están confirmados con la nota de prensa y la consulta pública de EFSA, no con el texto completo de la opinión científica.

## 6. Redondeo y límites de los datos
- Calorías redondeadas a la decena; gramos, a la unidad.
- Datos aceptados: edad 18–100 años, altura 120–230 cm, peso 30–300 kg. Fuera de esos rangos, error con mensaje claro.

## Ejemplos calculados a mano (usados en los tests)
1. Hombre, 30 años, 180 cm, 80 kg, actividad moderada, mantener:
   reposo = 800 + 1125 − 150 + 5 = 1780 → × 1,85 = 3293 → **3290 kcal**; proteína 1,4 × 80 = **112 g**; grasa 30 % de 3290 = 987 kcal → **110 g**; hidratos (3290 − 448 − 987) / 4 = **464 g**.
2. Mujer, 25 años, 165 cm, 60 kg, sedentaria, perder:
   reposo = 600 + 1031,25 − 125 − 161 = 1345,25 → × 1,40 = 1883,35 → × 0,85 = 1600,85 → **1600 kcal**; proteína **60 g**; grasa 480 kcal → **53 g**; hidratos (1600 − 240 − 480) / 4 = **220 g**.
3. Mujer, 70 años, 150 cm, 45 kg, sedentaria, perder: el cálculo da ≈1043 kcal → se aplica el **mínimo de 1200 kcal**.
