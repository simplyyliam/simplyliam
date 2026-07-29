create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  description text not null check (char_length(description) between 1 and 500),
  link text not null check (
    char_length(link) <= 2048
    and link ~* '^https?://'
  ),
  year integer not null default extract(year from now())::integer,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

grant select on table public.projects to anon, authenticated;
grant insert on table public.projects to authenticated;

drop policy if exists "Projects are publicly readable" on public.projects;
create policy "Projects are publicly readable"
on public.projects
for select
to anon, authenticated
using (true);

drop policy if exists "Only the portfolio owner can add projects" on public.projects;
create policy "Only the portfolio owner can add projects"
on public.projects
for insert
to authenticated
with check (
  (select auth.uid()) =
  '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
);
