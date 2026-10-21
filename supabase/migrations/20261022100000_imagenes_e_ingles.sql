-- Imágenes con su autoría (las fotos con licencia CC exigen citar autor y licencia)
-- y columnas en inglés para el selector de idioma. Si falta el inglés, la web usa el español.

alter table public.exercises
  add column image_author text,
  add column image_license text,
  add column image_source text,
  add column name_en text,
  add column description_en text,
  add column instructions_en text[] not null default '{}',
  add column tips_en text[] not null default '{}',
  add column common_mistakes_en text[] not null default '{}';

alter table public.muscles add column name_en text;
alter table public.equipment add column name_en text;

alter table public.recipes
  add column name_en text check (char_length(name_en) between 1 and 120),
  add column description_en text check (char_length(description_en) <= 2000),
  add column steps_en text[] not null default '{}',
  add column image_url text,
  add column image_author text,
  add column image_license text,
  add column image_source text;

alter table public.recipe_ingredients add column note_en text check (char_length(note_en) <= 100);

-- Solo las plantillas públicas (owner_id nulo) llevan inglés; las rutinas de cada usuario quedan como las escribió.
alter table public.routines
  add column name_en text check (char_length(name_en) between 1 and 100),
  add column description_en text check (char_length(description_en) <= 2000);
alter table public.routine_exercises add column notes_en text check (char_length(notes_en) <= 300);

update public.muscles m set name_en = v.en from (values
  ('biceps', 'Biceps'), ('deltoides-anterior', 'Front delts'), ('serrato-anterior', 'Serratus anterior'),
  ('pectoral', 'Chest'), ('triceps', 'Triceps'), ('abdominales', 'Abs'), ('gemelos', 'Calves'),
  ('gluteos', 'Glutes'), ('trapecio', 'Trapezius'), ('cuadriceps', 'Quadriceps'), ('isquiotibiales', 'Hamstrings'),
  ('dorsal-ancho', 'Lats'), ('braquial', 'Brachialis'), ('oblicuos', 'Obliques'), ('soleo', 'Soleus')
) as v(slug, en) where m.slug = v.slug;

update public.equipment e set name_en = v.en from (values
  ('barra', 'Barbell'), ('barra-z', 'EZ bar'), ('mancuernas', 'Dumbbells'), ('esterilla', 'Mat'),
  ('balon-suizo', 'Swiss ball'), ('barra-dominadas', 'Pull-up bar'), ('sin-material', 'No equipment'),
  ('banco', 'Bench'), ('banco-inclinado', 'Incline bench'), ('pesa-rusa', 'Kettlebell'),
  ('banda-elastica', 'Resistance band'), ('polea', 'Cable')
) as v(slug, en) where e.slug = v.slug;
