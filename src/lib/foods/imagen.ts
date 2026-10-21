// Foto de cada alimento: no hay una por alimento (son más de 6000), sino una por tipo (pollo, arroz,
// manzana…). El tipo sale del nombre original en inglés de USDA y, si no encaja ninguno, de su categoría.
// Las fotos están en public/img/alimentos/<clave>.webp y su autoría en ./imagenes.json.
import FOTOS from "./imagenes.json" with { type: "json" };

export type Foto = { autor: string; licencia: string; licenciaUrl: string | null; fuente: string };

// Orden importante: las reglas más concretas van antes (p. ej. "sweet potato" antes que "potato").
const REGLAS: [clave: string, patron: RegExp][] = [
  ["sopa", /\b(soup|broth|chowder|bouillon)\b/],
  ["salsa", /\b(sauce|gravy|catsup|ketchup|dressing|mayonnaise|dip|salsa|relish|mustard, prepared)\b/],
  ["zumo", /\b(juice|nectar|lemonade|smoothie)\b/],
  ["helado", /\b(ice cream|frozen yogurt|frozen novelties|sherbet)\b/],
  ["pudin", /\b(puddings?|gelatins?|flan|custards?|mousse)\b/],
  ["margarina", /^(margarine|shortening|fat|lard|vegetable oil-butter spread)/],
  ["huevo", /^egg|\begg(s)?\b(?!plant|nog| noodles)/],
  ["yogur", /\byogh?urt\b/],
  ["queso", /\bcheese\b/],
  ["leche", /\b(milk|soymilk|buttermilk|eggnog|milk shakes?)\b/],
  ["mantequilla", /^butter\b/],
  ["nata", /\b(cream|whipped topping|dessert topping)\b/],
  ["pavo", /^turkey/],
  ["pato", /^(duck|goose)/],
  ["pollo", /^(chicken|poultry|cornish game hens|guinea hen|quail|squab|pheasant)/],
  ["jamon", /^(ham|canadian bacon|pastrami|luncheon meat|turkey breast, (pre-packaged|sliced))/],
  ["bacon", /\bbacon\b/],
  ["salchicha", /\b(sausage|frankfurter|bratwurst|kielbasa|bologna|salami|beerwurst|knackwurst|chorizo|pepperoni|liverwurst|pate|meatballs)\b/],
  ["ternera-lechal", /^veal/],
  ["cordero", /^lamb/],
  ["caza", /^(game meat|bison|ostrich|emu|deer|elk|moose|rabbit|frog legs)/],
  ["cerdo", /^pork/],
  ["ternera", /^beef/],
  ["salmon", /\bsalmon\b/],
  ["atun", /\btuna\b/],
  ["marisco", /\b(crustaceans|shrimp|crab|lobster|crayfish)\b/],
  ["moluscos", /\b(mollusks|mussel|clam|oyster|squid|octopus|scallop)\b/],
  ["pescado", /^fish\b|\b(cod|hake|sardine|trout|mackerel|anchovy|herring|tilapia)\b/],
  ["aceite", /^(oil|fish oil)\b|\boil, /],
  ["tortitas", /\b(pancakes?|waffles?|french toast)\b/],
  ["galletas", /\b(cookies?|crackers?|biscuits?|graham)\b/],
  ["bolleria", /\b(croissants?|doughnuts?|danish pastry|sweet rolls|muffins?|toaster pastries|puff pastry|strudel|cinnamon buns?)\b/],
  ["tarta", /\b(cake|pie|cheesecake|brownies?|frostings?|pie crust|pie fillings|cobbler|eclairs?)\b/],
  ["tortilla", /\b(tortillas?|taco shells|tostada shells)\b/],
  ["pan", /\b(bread|rolls|bagels|english muffins|focaccia|pita|croutons|bread crumbs|popovers|stuffing)\b/],
  ["cereales-desayuno", /\b(cereals?|granola|oat bran|muesli)\b/],
  ["avena", /\boats?\b|oatmeal/],
  ["arroz", /\b(rice|wild rice)\b(?! cake| noodles)/],
  ["pasta", /\b(pasta|spaghetti|macaroni|noodles|vermicelli|couscous|lasagna)\b/],
  ["harina", /\b(flour|cornmeal|semolina|corn grits|cornstarch|meal)\b/],
  ["grano", /\b(quinoa|barley|millet|bulgur|buckwheat|wheat|spelt|teff|amaranth grain|sorghum|triticale|rye|hominy)\b/],
  ["palomitas", /\b(popcorn|chips|pretzels|snacks?|rice cakes?|puffs|crisps)\b/],
  ["chocolate", /\b(chocolate|cocoa|candies|fudge|chewing gum|marshmallows?)\b/],
  ["mermelada", /\b(jams?|jell(y|ies)|preserves|marmalade|fruit butters)\b/],
  ["azucar", /\b(sugars?|syrups?|honey|molasses|sweeteners?|dextrose|fructose)\b/],
  ["cacahuete", /\bpeanut/],
  ["semillas", /\b(seeds?|sesame|tahini|flaxseed|chia)\b/],
  ["frutos-secos", /\b(nuts?|almonds?|walnuts?|hazelnuts?|cashews?|pistachios?|pecans?|chestnuts?|macadamia)\b/],
  ["garbanzos", /\b(chickpeas?|garbanzo|hummus)\b/],
  ["lentejas", /\blentils?\b/],
  ["soja", /\b(soy|soybeans?|tofu|tempeh|edamame|miso|natto|veggie burgers)\b/],
  ["judia-verde", /\bbeans, snap|green beans|yardlong bean|winged beans\b/],
  ["guisantes", /\bpeas\b|pigeon ?peas/],
  ["alubias", /\b(beans|cowpeas|lupins|mothbeans|broadbeans)\b/],
  ["boniato", /\b(sweet ?potato|yams?\b)/],
  ["patata", /\bpotato/],
  ["tomate", /\btomato/],
  ["zanahoria", /\bcarrots?\b/],
  ["cebolla", /\b(onions?|leeks?|shallots?|garlic|chives|scallions)\b/],
  ["brocoli", /\b(broccoli|cauliflower|brussels sprouts|cabbage|kale|collards|kohlrabi|broccoli raab)\b/],
  ["espinaca", /\b(spinach|lettuce|chard|greens|cress|arugula|endive|chicory|lambsquarters|leaves|purslane)\b/],
  ["pimiento", /\bpeppers?\b/],
  ["calabaza", /\b(squash|pumpkin|zucchini|gourd|waxgourd|chayote)\b/],
  ["setas", /\bmushrooms?\b/],
  ["pepino", /\b(cucumbers?|pickles?|gherkins?)\b/],
  ["maiz", /^corn\b|\bcorn, sweet\b|succotash/],
  ["berenjena", /\beggplant\b/],
  ["esparragos", /\b(asparagus|artichokes?|celery|fennel|okra|bamboo shoots|hearts of palm|cardoon|rhubarb)\b/],
  ["raices", /\b(beets?|turnips?|radish(es)?|parsnips?|rutabagas?|celeriac|taro|cassava|jicama|yambean|lotus root|burdock|salsify|ginger root)\b/],
  ["cafe", /\bcoffee\b/],
  ["te", /\btea\b/],
  ["cerveza", /\bbeer\b/],
  ["vino", /\bwine\b/],
  ["licores", /\b(alcoholic|liqueur|whiskey|vodka|rum|gin|distilled)\b/],
  ["refresco", /\b(carbonated|cola|soda|energy drink|sports drink)\b/],
  ["agua", /^water(,|$)|\bwater, (bottled|tap|municipal)/],
  ["aguacate", /\bavocados?\b/],
  ["aceitunas", /\bolives?\b/],
  ["manzana", /\bapples?\b|applesauce/],
  ["platano", /\b(bananas?|plantains?)\b/],
  ["naranja", /\b(oranges?|tangerines?|mandarin|grapefruit|clementines?)\b/],
  ["limon", /\b(lemons?|limes?)\b/],
  ["frutos-rojos", /\b(strawberr|blueberr|raspberr|blackberr|cranberr|currants?|gooseberr|boysenberr|elderberr|mulberr)/],
  ["uvas", /\b(grapes?|raisins)\b/],
  ["melocoton", /\b(peach(es)?|apricots?|nectarines?|plums?|prunes?)\b/],
  ["pera", /\bpears?\b/],
  ["pina", /\bpineapple\b/],
  ["melon", /\b(melons?|watermelon|cantaloupe|honeydew)\b/],
  ["cerezas", /\bcherr(y|ies)\b/],
  ["higos-datiles", /\b(figs?|dates)\b/],
  ["frutas-tropicales", /\b(mango|papaya|guavas?|passion-fruit|litchis?|longans|jackfruit|kiwi|persimmons?|pomegranate|lychee|nance|naranjilla|jujube|tamarind|starfruit|carambola|durian|breadfruit|soursop)\b/],
  ["hierbas", /\b(parsley|basil|spearmint|peppermint|dill|rosemary|thyme|oregano|coriander|cilantro|herbs?)\b/],
  ["especias", /\b(spices?|seasoning|pepper, black|cinnamon|paprika|curry|vanilla|salt|vinegar|baking powder|leavening)\b/],
];

// Si el nombre no encaja en ninguna regla: la foto de su categoría USDA.
const POR_CATEGORIA: Record<string, string> = {
  "Beef Products": "ternera",
  "Vegetables and Vegetable Products": "verduras",
  "Lamb, Veal, and Game Products": "cordero",
  "Baked Products": "pan",
  "Poultry Products": "pollo",
  "Pork Products": "cerdo",
  "Fruits and Fruit Juices": "fruta",
  Beverages: "bebidas",
  "Finfish and Shellfish Products": "pescado",
  "Dairy and Egg Products": "lacteos",
  Sweets: "dulces",
  "Legumes and Legume Products": "alubias",
  "Soups, Sauces, and Gravies": "sopa",
  "Fats and Oils": "aceite",
  "Cereal Grains and Pasta": "grano",
  "Sausages and Luncheon Meats": "salchicha",
  Snacks: "palomitas",
  "Nut and Seed Products": "frutos-secos",
  "Spices and Herbs": "especias",
  "Breakfast Cereals": "cereales-desayuno",
};

export const CLAVES = [...new Set([...REGLAS.map(([c]) => c), ...Object.values(POR_CATEGORIA)])];

// Cabezas que no dicen nada del alimento: se salta directamente al nombre entero.
const CABEZA_GENERICA = /^(beverages?|alcoholic beverages?)$/;

function porReglas(texto: string): string | null {
  for (const [clave, patron] of REGLAS) if (patron.test(texto)) return clave;
  return null;
}

// Primero se mira la cabeza del nombre ("Soup, tomato" → sopa, no tomate); si no, el nombre entero
// ("Beverages, coffee" → café); si tampoco, la categoría.
export function claveDeImagen(nameEn: string | null, categoria: string | null): string {
  const nombre = (nameEn ?? "").toLowerCase();
  const cabeza = nombre.split(",")[0].trim();
  return (CABEZA_GENERICA.test(cabeza) ? null : porReglas(cabeza)) ?? porReglas(nombre) ?? (categoria ? POR_CATEGORIA[categoria] : undefined) ?? "verduras";
}

const fotos = FOTOS as Record<string, Foto>;

export function imagenDeAlimento(nameEn: string | null, categoria: string | null): { src: string; foto: Foto } | null {
  const clave = claveDeImagen(nameEn, categoria);
  const foto = fotos[clave];
  return foto ? { src: `/img/alimentos/${clave}.webp`, foto } : null;
}
