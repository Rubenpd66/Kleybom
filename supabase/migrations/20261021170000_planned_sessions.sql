-- Sesiones planificadas en el calendario. Solo las ve y gestiona su dueño y se borran con su cuenta.
create table public.planned_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  -- si se borra la rutina, la sesión se conserva (sin rutina)
  routine_id bigint references public.routines (id) on delete set null,
  routine_day_index smallint check (routine_day_index between 1 and 7),
  note text check (char_length(note) <= 300),
  status text not null default 'planificada' check (status in ('planificada', 'hecha', 'saltada')),
  created_at timestamptz not null default now(),
  -- el día de la rutina solo tiene sentido si hay rutina
  check (routine_day_index is null or routine_id is not null)
);

create index planned_sessions_user_date_idx on public.planned_sessions (user_id, date);
create index planned_sessions_routine_id_idx on public.planned_sessions (routine_id);

alter table public.planned_sessions enable row level security;

create policy "el dueño ve sus sesiones" on public.planned_sessions
  for select to authenticated using (user_id = (select auth.uid()));

-- Al crear o editar, la rutina elegida debe ser una que el usuario pueda ver
-- (plantilla pública o suya): la subconsulta se evalúa con los permisos del usuario.
create policy "el dueño crea sus sesiones" on public.planned_sessions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (routine_id is null or exists (select 1 from public.routines r where r.id = routine_id))
  );
create policy "el dueño edita sus sesiones" on public.planned_sessions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (routine_id is null or exists (select 1 from public.routines r where r.id = routine_id))
  );
create policy "el dueño borra sus sesiones" on public.planned_sessions
  for delete to authenticated using (user_id = (select auth.uid()));
