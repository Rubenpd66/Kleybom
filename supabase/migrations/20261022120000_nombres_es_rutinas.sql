-- Nombres en español de ejercicios de wger que solo venían en inglés y se usan en las rutinas plantilla.
-- (Si se vuelve a ejecutar scripts/import-wger/run.ts, habría que repetir esta migración.)
update public.exercises x set name_es = v.es, search_text = v.busqueda, needs_translation = false
from (values
  ('box-jumps', 'Saltos al cajón', 'saltos al cajon'),
  ('cross-body-stretch', 'Estiramiento de hombro cruzado', 'estiramiento de hombro cruzado'),
  ('hamstring-stretch', 'Estiramiento de isquiotibiales', 'estiramiento de isquiotibiales'),
  ('hip-flexor-stretch', 'Estiramiento del flexor de cadera', 'estiramiento del flexor de cadera'),
  ('lunge-with-twist-stretch', 'Zancada con giro de tronco', 'zancada con giro de tronco'),
  ('pigeon-stretch', 'Postura de la paloma', 'postura de la paloma'),
  ('plank-jacks', 'Plancha con apertura de piernas', 'plancha con apertura de piernas'),
  ('quad-stretch', 'Estiramiento de cuádriceps', 'estiramiento de cuadriceps'),
  ('runners-lunge-stretch', 'Estiramiento en zancada baja', 'estiramiento en zancada baja'),
  ('side-stretch', 'Estiramiento lateral', 'estiramiento lateral'),
  ('squat-jumps', 'Sentadillas con salto', 'sentadillas con salto'),
  ('squat-sky-reach-stretch', 'Sentadilla profunda con brazos arriba', 'sentadilla profunda con brazos arriba'),
  ('wall-balls', 'Lanzamientos de balón a la pared', 'lanzamientos de balon a la pared')
) as v(slug, es, busqueda)
where x.slug = v.slug;
