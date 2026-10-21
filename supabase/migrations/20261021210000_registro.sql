-- Registro de entrenos y medidas. Solo los ve y gestiona su dueño; se borran con su cuenta.
create table public.workout_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  routine_id bigint references public.routines (id) on delete set null,
  routine_day_index smallint check (routine_day_index between 1 and 7),
  planned_session_id bigint references public.planned_sessions (id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  note text check (char_length(note) <= 500),
  check (finished_at is null or finished_at >= started_at)
);

create index workout_logs_user_date_idx on public.workout_logs (user_id, date);
create index workout_logs_routine_id_idx on public.workout_logs (routine_id);
create index workout_logs_planned_session_id_idx on public.workout_logs (planned_session_id);

create table public.set_logs (
  id bigint generated always as identity primary key,
  workout_log_id bigint not null references public.workout_logs (id) on delete cascade,
  exercise_id bigint not null references public.exercises (id) on delete restrict,
  set_index smallint not null check (set_index >= 1),
  weight_kg numeric(5, 1) not null check (weight_kg between 0 and 1000),
  reps smallint not null check (reps between 1 and 200),
  rpe numeric(3, 1) check (rpe between 1 and 10),
  created_at timestamptz not null default now(),
  unique (workout_log_id, exercise_id, set_index)
);

create index set_logs_exercise_id_idx on public.set_logs (exercise_id);

create table public.body_measurements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  weight_kg numeric(5, 1) check (weight_kg between 20 and 400),
  waist_cm numeric(5, 1) check (waist_cm between 30 and 300),
  hip_cm numeric(5, 1) check (hip_cm between 30 and 300),
  chest_cm numeric(5, 1) check (chest_cm between 30 and 300),
  created_at timestamptz not null default now(),
  -- una medición por día; al menos un dato
  unique (user_id, date),
  check (coalesce(weight_kg, waist_cm, hip_cm, chest_cm) is not null)
);

alter table public.workout_logs enable row level security;
alter table public.set_logs enable row level security;
alter table public.body_measurements enable row level security;

-- workout_logs: del dueño; la rutina debe ser visible para él y la sesión planificada, suya.
create policy "el dueño ve sus entrenos" on public.workout_logs
  for select to authenticated using (user_id = (select auth.uid()));
create policy "el dueño crea sus entrenos" on public.workout_logs
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (routine_id is null or exists (select 1 from public.routines r where r.id = routine_id))
    and (planned_session_id is null or exists (
      select 1 from public.planned_sessions s where s.id = planned_session_id and s.user_id = (select auth.uid())
    ))
  );
create policy "el dueño edita sus entrenos" on public.workout_logs
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (routine_id is null or exists (select 1 from public.routines r where r.id = routine_id))
    and (planned_session_id is null or exists (
      select 1 from public.planned_sessions s where s.id = planned_session_id and s.user_id = (select auth.uid())
    ))
  );
create policy "el dueño borra sus entrenos" on public.workout_logs
  for delete to authenticated using (user_id = (select auth.uid()));

-- set_logs: heredan los permisos de su entreno.
create policy "ver series de mis entrenos" on public.set_logs
  for select to authenticated
  using (exists (select 1 from public.workout_logs w where w.id = workout_log_id and w.user_id = (select auth.uid())));
create policy "añadir series a mis entrenos" on public.set_logs
  for insert to authenticated
  with check (exists (select 1 from public.workout_logs w where w.id = workout_log_id and w.user_id = (select auth.uid())));
create policy "editar series de mis entrenos" on public.set_logs
  for update to authenticated
  using (exists (select 1 from public.workout_logs w where w.id = workout_log_id and w.user_id = (select auth.uid())))
  with check (exists (select 1 from public.workout_logs w where w.id = workout_log_id and w.user_id = (select auth.uid())));
create policy "borrar series de mis entrenos" on public.set_logs
  for delete to authenticated
  using (exists (select 1 from public.workout_logs w where w.id = workout_log_id and w.user_id = (select auth.uid())));

-- body_measurements: del dueño.
create policy "el dueño ve sus medidas" on public.body_measurements
  for select to authenticated using (user_id = (select auth.uid()));
create policy "el dueño añade medidas" on public.body_measurements
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "el dueño edita sus medidas" on public.body_measurements
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "el dueño borra sus medidas" on public.body_measurements
  for delete to authenticated using (user_id = (select auth.uid()));
