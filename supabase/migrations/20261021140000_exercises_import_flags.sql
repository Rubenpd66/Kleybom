-- Marcas del importador y clave única por fuente para poder repetir la importación sin duplicar.
alter table public.exercises
  add column needs_translation boolean not null default false,
  add column needs_level_review boolean not null default false;

alter table public.exercises
  add constraint exercises_source_source_id_key unique (source, source_id);
