-- Longitud del nombre para ordenar la búsqueda: primero los nombres más simples
-- ("Plátanos, crudos" antes que "Plátano macho, verde, frito").
alter table public.foods
  add column name_len integer generated always as (char_length(name_es)) stored;

create index foods_name_len_idx on public.foods (name_len, name_es);
