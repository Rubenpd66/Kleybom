# Glosario de traducción de alimentos (USDA → español de España)

Se aplica a los nombres de `foods` importados de USDA (Tarea 26). Las traducciones están en `scripts/translate-foods/traducciones/` (un archivo por lote, `id_usda<TAB>nombre_es`) y se cargan con `node scripts/translate-foods/apply.ts`.

## Reglas generales
- Se respeta la estructura de USDA: **alimento, variante, preparación**, separados por comas. Ejemplo: "Bananas, raw" → "Plátano, crudo".
- El alimento principal va en singular cuando es lo natural en español ("Plátano", "Manzana", "Patata").
- Español de España: patata, zumo, melocotón, judías verdes, maíz, nata, bollo, galleta, filete, ternera.
- Las marcas y abreviaturas técnicas que no tienen traducción clara se dejan como están.
- Si un corte o término no tiene equivalente exacto, se pone la aproximación española y el término original entre paréntesis: "Ternera, aguja (chuck)".
- Las medidas de USDA en pulgadas se conservan y se añade la equivalencia: 1/8" = 3 mm, 1/4" = 6 mm, 0" = sin grasa visible.

## Preparación
| Inglés | Español |
|---|---|
| raw | crudo |
| cooked | cocinado |
| boiled | hervido |
| braised | estofado |
| broiled | a la parrilla |
| grilled | a la plancha |
| roasted | asado |
| baked | al horno |
| pan-fried / fried | frito en sartén / frito |
| deep-fried | frito en abundante aceite |
| stewed | guisado |
| simmered | cocido a fuego lento |
| steamed | al vapor |
| microwaved | al microondas |
| dry-roasted | tostado en seco |
| toasted | tostado |
| canned | en conserva |
| frozen | congelado |
| dried / dehydrated | seco / deshidratado |
| drained solids | escurrido |
| with salt / without salt | con sal / sin sal |
| unprepared / prepared | sin preparar / preparado |
| ready-to-eat / ready-to-serve | listo para comer / listo para servir |
| enriched / fortified / unenriched | enriquecido / enriquecido / sin enriquecer |
| sweetened / unsweetened | azucarado / sin azúcar |
| from concentrate | a partir de concentrado |
| mature seeds | semillas maduras (legumbre seca) |
| sprouted | germinado |
| whole grain | integral |

## Carne
| Inglés | Español |
|---|---|
| beef | ternera |
| veal | ternera lechal |
| lamb | cordero |
| pork | cerdo |
| game | caza |
| chicken / turkey / duck | pollo / pavo / pato |
| ground | picada |
| separable lean only | solo magro |
| separable lean and fat | magro y grasa |
| meat only / meat and skin | solo carne / carne y piel |
| boneless / bone-in | sin hueso / con hueso |
| all grades / choice / select / prime | todas las calidades / calidad Choice / calidad Select / calidad Prime |
| chuck | aguja (chuck) |
| rib | lomo alto (rib) |
| short loin | lomo bajo (short loin) |
| tenderloin | solomillo |
| top sirloin / sirloin | cadera (top sirloin) / cadera (sirloin) |
| round | redondo (round) |
| brisket | pecho (brisket) |
| flank | falda (flank) |
| plate | falda (plate) |
| shank | morcillo |
| short ribs | costilla corta (short ribs) |
| spareribs | costillas |
| ham | jamón |
| bacon | panceta / beicon |
| sausage | salchicha |
| luncheon meat | fiambre |
| giblets / liver | menudillos / hígado |

## Lácteos y huevos
| Inglés | Español |
|---|---|
| milk, whole / reduced fat 2% / lowfat 1% / nonfat (skim) | leche entera / semidesnatada (2 %) / semidesnatada (1 %) / desnatada |
| cream, heavy / light / half and half | nata para montar / nata ligera / mezcla de leche y nata |
| sour cream | nata agria |
| cheese | queso |
| cottage cheese | requesón (cottage) |
| yogurt | yogur |
| butter | mantequilla |
| egg, whole / white / yolk | huevo entero / clara / yema |

## Panadería, dulces y otros
| Inglés | Español |
|---|---|
| bread / rolls / bagels | pan / panecillos / bagels |
| cookies / crackers | galletas / galletas saladas (crackers) |
| cake / pie / pastry | bizcocho o tarta / pastel / bollería |
| muffins / doughnuts | magdalenas (muffins) / dónuts |
| candies | caramelos y golosinas |
| syrup | sirope |
| snacks | aperitivos |
| beverages | bebidas |
| juice | zumo |
| soup / sauce / gravy | sopa / salsa / salsa de carne (gravy) |
| oil / shortening / margarine | aceite / grasa vegetal / margarina |
| spices / herbs | especias / hierbas |
