-- Rutinas. owner_id nulo = plantilla pública (solo la crea el administrador, nunca un usuario).
-- Las rutinas propias solo las ve y edita su dueño y se borran con su cuenta.
create table public.routines (
  id bigint generated always as identity primary key,
  slug text unique,
  owner_id uuid references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text check (char_length(description) <= 2000),
  goal text not null check (goal in ('fuerza', 'hipertrofia', 'perdida_grasa', 'resistencia', 'movilidad')),
  level text not null check (level in ('principiante', 'intermedio', 'avanzado')),
  days_per_week smallint not null check (days_per_week between 1 and 7),
  created_at timestamptz not null default now(),
  -- una plantilla pública necesita slug para tener dirección
  check (owner_id is not null or slug is not null)
);

create table public.routine_exercises (
  id bigint generated always as identity primary key,
  routine_id bigint not null references public.routines (id) on delete cascade,
  -- restrict: borrar un ejercicio del catálogo no debe vaciar en silencio las rutinas de nadie
  exercise_id bigint not null references public.exercises (id) on delete restrict,
  day_index smallint not null check (day_index between 1 and 7),
  position smallint not null check (position >= 1),
  sets smallint not null check (sets between 1 and 20),
  reps_min smallint not null check (reps_min between 1 and 100),
  reps_max smallint not null check (reps_max between 1 and 100),
  rest_seconds integer not null default 60 check (rest_seconds between 0 and 600),
  notes text check (char_length(notes) <= 300),
  check (reps_max >= reps_min),
  unique (routine_id, day_index, position)
);

create index routines_owner_id_idx on public.routines (owner_id);
create index routine_exercises_exercise_id_idx on public.routine_exercises (exercise_id);

alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;

-- routines: todos ven las plantillas; el dueño ve y gestiona las suyas.
create policy "ver plantillas y propias" on public.routines
  for select to anon, authenticated
  using (owner_id is null or owner_id = (select auth.uid()));
create policy "crear propias" on public.routines
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "editar propias" on public.routines
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "borrar propias" on public.routines
  for delete to authenticated using (owner_id = (select auth.uid()));

-- routine_exercises: heredan los permisos de su rutina.
create policy "ver ejercicios de plantillas y propias" on public.routine_exercises
  for select to anon, authenticated
  using (exists (
    select 1 from public.routines r
    where r.id = routine_id and (r.owner_id is null or r.owner_id = (select auth.uid()))
  ));
create policy "añadir a propias" on public.routine_exercises
  for insert to authenticated
  with check (exists (
    select 1 from public.routines r where r.id = routine_id and r.owner_id = (select auth.uid())
  ));
create policy "editar de propias" on public.routine_exercises
  for update to authenticated
  using (exists (
    select 1 from public.routines r where r.id = routine_id and r.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.routines r where r.id = routine_id and r.owner_id = (select auth.uid())
  ));
create policy "borrar de propias" on public.routine_exercises
  for delete to authenticated
  using (exists (
    select 1 from public.routines r where r.id = routine_id and r.owner_id = (select auth.uid())
  ));
