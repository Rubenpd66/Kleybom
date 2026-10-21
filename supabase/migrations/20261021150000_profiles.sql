-- Perfil del usuario. Son datos personales y de salud: solo los ve y edita su dueño,
-- y se borran en cascada cuando se borra la cuenta (auth.users).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  sex text check (sex in ('mujer', 'hombre', 'otro')),
  birth_date date check (birth_date >= date '1900-01-01' and birth_date <= current_date),
  height_cm numeric(4, 1) check (height_cm between 100 and 250),
  timezone text not null default 'Europe/Madrid',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "el dueño lee su perfil" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "el dueño crea su perfil" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "el dueño edita su perfil" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "el dueño borra su perfil" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);
