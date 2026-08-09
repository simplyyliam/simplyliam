alter table public.projects
add column if not exists show_avatar boolean not null default true;

alter table public.projects
drop constraint if exists projects_year_check;

alter table public.projects
add constraint projects_year_check
check (year between 1900 and 9999);
