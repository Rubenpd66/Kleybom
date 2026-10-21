-- Nutrición. Valores por 100 g; un nutriente desconocido es NULL (nunca 0).
create table public.foods (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_es text not null check (char_length(name_es) between 1 and 200),
  name_en text,
  category text,
  source text not null check (source in ('usda', 'openfoodfacts', 'manual')),
  source_id text,
  search_text text not null default '',
  kcal numeric(6, 1) check (kcal between 0 and 1000),
  protein_g numeric(5, 2) check (protein_g between 0 and 100),
  carbs_g numeric(5, 2) check (carbs_g between 0 and 100),
  fat_g numeric(5, 2) check (fat_g between 0 and 100),
  fiber_g numeric(5, 2) check (fiber_g between 0 and 100),
  sugar_g numeric(5, 2) check (sugar_g between 0 and 100),
  sodium_mg numeric(8, 1) check (sodium_mg between 0 and 100000),
  unique (source, source_id)
);

create extension if not exists pg_trgm with schema extensions;
create index foods_search_text_trgm_idx on public.foods using gin (search_text extensions.gin_trgm_ops);

alter table public.foods enable row level security;
create policy "lectura publica" on public.foods for select to anon, authenticated using (true);

-- Diario de comidas: solo del dueño; se borra con su cuenta.
create table public.meal_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  meal text not null check (meal in ('desayuno', 'comida', 'cena', 'snack')),
  -- restrict: no se puede borrar del catálogo un alimento que alguien tiene en su diario
  food_id bigint not null references public.foods (id) on delete restrict,
  grams numeric(6, 1) not null check (grams > 0 and grams <= 5000),
  created_at timestamptz not null default now()
);

create index meal_entries_user_date_idx on public.meal_entries (user_id, date);
create index meal_entries_food_id_idx on public.meal_entries (food_id);

alter table public.meal_entries enable row level security;
create policy "el dueño ve su diario" on public.meal_entries
  for select to authenticated using (user_id = (select auth.uid()));
create policy "el dueño añade a su diario" on public.meal_entries
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "el dueño edita su diario" on public.meal_entries
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "el dueño borra de su diario" on public.meal_entries
  for delete to authenticated using (user_id = (select auth.uid()));

-- Objetivos diarios: uno por usuario; se borra con su cuenta.
create table public.nutrition_goals (
  user_id uuid primary key references auth.users (id) on delete cascade,
  kcal integer not null check (kcal between 800 and 6000),
  protein_g integer not null check (protein_g between 0 and 1000),
  carbs_g integer not null check (carbs_g between 0 and 1000),
  fat_g integer not null check (fat_g between 0 and 1000),
  updated_at timestamptz not null default now()
);

alter table public.nutrition_goals enable row level security;
create policy "el dueño ve sus objetivos" on public.nutrition_goals
  for select to authenticated using (user_id = (select auth.uid()));
create policy "el dueño crea sus objetivos" on public.nutrition_goals
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "el dueño edita sus objetivos" on public.nutrition_goals
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "el dueño borra sus objetivos" on public.nutrition_goals
  for delete to authenticated using (user_id = (select auth.uid()));
