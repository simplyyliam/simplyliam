create table if not exists public.banner_settings (
  id text primary key check (id = 'main'),
  url text check (
    url is null
    or (
      char_length(url) <= 2048
      and url ~* '^https?://'
    )
  ),
  updated_at timestamptz not null default now()
);

insert into public.banner_settings (id, url)
values ('main', null)
on conflict (id) do nothing;

alter table public.banner_settings enable row level security;

grant select on table public.banner_settings to anon, authenticated;
grant update on table public.banner_settings to authenticated;

drop policy if exists "Banner settings are publicly readable"
on public.banner_settings;
create policy "Banner settings are publicly readable"
on public.banner_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Only the portfolio owner can edit the banner"
on public.banner_settings;
create policy "Only the portfolio owner can edit the banner"
on public.banner_settings
for update
to authenticated
using (
  (select auth.uid()) =
  '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
)
with check (
  (select auth.uid()) =
  '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
);
