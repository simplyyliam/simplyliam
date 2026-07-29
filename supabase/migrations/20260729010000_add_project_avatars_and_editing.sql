alter table public.projects
add column if not exists avatar_url text,
add column if not exists avatar_path text;

alter table public.projects
drop constraint if exists projects_avatar_url_check;

alter table public.projects
add constraint projects_avatar_url_check
check (
  avatar_url is null
  or (
    char_length(avatar_url) <= 2048
    and avatar_url ~* '^https://'
  )
);

grant update on table public.projects to authenticated;

drop policy if exists "Only the portfolio owner can edit projects" on public.projects;
create policy "Only the portfolio owner can edit projects"
on public.projects
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

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'project-avatars',
  'project-avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owner can read project avatar metadata" on storage.objects;
create policy "Owner can read project avatar metadata"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-avatars'
  and (select auth.uid()) =
    '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
);

drop policy if exists "Owner can upload project avatars" on storage.objects;
create policy "Owner can upload project avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (select auth.uid()) =
    '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
);

drop policy if exists "Owner can delete project avatars" on storage.objects;
create policy "Owner can delete project avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and (select auth.uid()) =
    '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
);
