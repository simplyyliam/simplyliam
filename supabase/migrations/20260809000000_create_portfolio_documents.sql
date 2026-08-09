create table if not exists public.portfolio_documents (
  id uuid primary key default gen_random_uuid(),
  page_id text not null,
  owner_id uuid not null,
  status text not null check (status in ('draft', 'published')),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, status)
);

alter table public.portfolio_documents enable row level security;

grant select on table public.portfolio_documents to anon, authenticated;
grant insert, update, delete on table public.portfolio_documents
to authenticated;

drop policy if exists "Published portfolio documents are publicly readable"
on public.portfolio_documents;
create policy "Published portfolio documents are publicly readable"
on public.portfolio_documents
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Owner can read portfolio drafts"
on public.portfolio_documents;
create policy "Owner can read portfolio drafts"
on public.portfolio_documents
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Owner can create portfolio documents"
on public.portfolio_documents;
create policy "Owner can create portfolio documents"
on public.portfolio_documents
for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and owner_id = '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
);

drop policy if exists "Owner can update portfolio documents"
on public.portfolio_documents;
create policy "Owner can update portfolio documents"
on public.portfolio_documents
for update
to authenticated
using (
  (select auth.uid()) = owner_id
  and owner_id = '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
)
with check (
  (select auth.uid()) = owner_id
  and owner_id = '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
);

drop policy if exists "Owner can delete portfolio documents"
on public.portfolio_documents;
create policy "Owner can delete portfolio documents"
on public.portfolio_documents
for delete
to authenticated
using (
  (select auth.uid()) = owner_id
  and owner_id = '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
);

with initial_document as (
  select $document$
  {
    "schemaVersion": 1,
    "blocks": [
      {
        "id": "about",
        "type": "about",
        "visible": true,
        "content": {
          "introduction": "Hey, I'm liam! I'm a",
          "roles": ["Developer", "Designer"],
          "biography": {
            "type": "doc",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "I’m a curious person who enjoys bringing little ideas to life. I’m happiest when I’m learning, making things, and slowly turning something that once lived in my head into something real."
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "id": "banner",
        "type": "banner",
        "visible": true,
        "content": { "label": "Banner" }
      },
      {
        "id": "projects",
        "type": "projects",
        "visible": true,
        "content": {
          "heading": "Projects",
          "emptyMessage": "No projects yet, come back later :)"
        }
      }
    ],
    "layouts": {
      "lg": [
        { "i": "about", "x": 0, "y": 0, "w": 12, "h": 4, "minW": 4, "minH": 3 },
        { "i": "banner", "x": 0, "y": 4, "w": 12, "h": 6, "minW": 4, "minH": 4 },
        { "i": "projects", "x": 0, "y": 10, "w": 12, "h": 8, "minW": 6, "minH": 4 }
      ],
      "md": [
        { "i": "about", "x": 0, "y": 0, "w": 6, "h": 4, "minW": 3, "minH": 3 },
        { "i": "banner", "x": 0, "y": 4, "w": 6, "h": 6, "minW": 3, "minH": 4 },
        { "i": "projects", "x": 0, "y": 10, "w": 6, "h": 8, "minW": 3, "minH": 4 }
      ],
      "sm": [
        { "i": "about", "x": 0, "y": 0, "w": 1, "h": 4, "minW": 1, "minH": 3 },
        { "i": "banner", "x": 0, "y": 4, "w": 1, "h": 5, "minW": 1, "minH": 4 },
        { "i": "projects", "x": 0, "y": 9, "w": 1, "h": 8, "minW": 1, "minH": 4 }
      ]
    }
  }
  $document$::jsonb as document
)
insert into public.portfolio_documents (
  page_id,
  owner_id,
  status,
  document
)
select
  'main',
  '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid,
  status,
  initial_document.document
from initial_document
cross join (
  values ('draft'), ('published')
) as versions(status)
on conflict (page_id, status) do nothing;
