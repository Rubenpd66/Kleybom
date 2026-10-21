-- Texto de búsqueda normalizado (minúsculas, sin tildes). Lo rellena el importador con normalizeText.
create extension if not exists pg_trgm with schema extensions;

alter table public.exercises add column search_text text not null default '';

create index exercises_search_text_trgm_idx
  on public.exercises using gin (search_text extensions.gin_trgm_ops);
