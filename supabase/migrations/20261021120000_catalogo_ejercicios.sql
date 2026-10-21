-- Catálogo de ejercicios: lectura pública, sin escritura para usuarios.

create table public.muscles (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_es text not null
);

create table public.equipment (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_es text not null
);

create table public.exercises (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_es text not null,
  description_es text,
  level text not null check (level in ('principiante', 'intermedio', 'avanzado')),
  instructions_es text[] not null default '{}',
  tips_es text[] not null default '{}',
  common_mistakes_es text[] not null default '{}',
  image_url text,
  license text,
  author text,
  source text,
  source_id text
);

create table public.exercise_muscles (
  exercise_id bigint not null references public.exercises (id) on delete cascade,
  muscle_id bigint not null references public.muscles (id) on delete cascade,
  role text not null check (role in ('principal', 'secundario')),
  primary key (exercise_id, muscle_id)
);

create table public.exercise_equipment (
  exercise_id bigint not null references public.exercises (id) on delete cascade,
  equipment_id bigint not null references public.equipment (id) on delete cascade,
  primary key (exercise_id, equipment_id)
);

create index exercise_muscles_muscle_id_idx on public.exercise_muscles (muscle_id);
create index exercise_equipment_equipment_id_idx on public.exercise_equipment (equipment_id);

alter table public.muscles enable row level security;
alter table public.equipment enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_muscles enable row level security;
alter table public.exercise_equipment enable row level security;

-- Solo política de lectura; sin políticas de escritura, anon y authenticated no pueden escribir.
create policy "lectura publica" on public.muscles for select to anon, authenticated using (true);
create policy "lectura publica" on public.equipment for select to anon, authenticated using (true);
create policy "lectura publica" on public.exercises for select to anon, authenticated using (true);
create policy "lectura publica" on public.exercise_muscles for select to anon, authenticated using (true);
create policy "lectura publica" on public.exercise_equipment for select to anon, authenticated using (true);
