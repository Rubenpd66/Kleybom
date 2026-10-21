-- Recetas: contenido público (solo lectura desde la web; se cargan con la clave de servicio).
create table public.recipes (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_es text not null check (char_length(name_es) between 1 and 120),
  description_es text check (char_length(description_es) <= 2000),
  steps_es text[] not null default '{}',
  servings smallint not null check (servings between 1 and 20),
  prep_minutes smallint check (prep_minutes between 1 and 600),
  created_at timestamptz not null default now()
);

create table public.recipe_ingredients (
  id bigint generated always as identity primary key,
  recipe_id bigint not null references public.recipes (id) on delete cascade,
  food_id bigint not null references public.foods (id) on delete restrict,
  grams numeric(6, 1) not null check (grams > 0 and grams <= 5000),
  position smallint not null check (position >= 1),
  note text check (char_length(note) <= 100),
  unique (recipe_id, position)
);

create index recipe_ingredients_food_id_idx on public.recipe_ingredients (food_id);

alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
create policy "lectura publica" on public.recipes for select to anon, authenticated using (true);
create policy "lectura publica" on public.recipe_ingredients for select to anon, authenticated using (true);
