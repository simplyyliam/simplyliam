grant delete on table public.projects to authenticated;

drop policy if exists "Only the portfolio owner can delete projects"
on public.projects;

create policy "Only the portfolio owner can delete projects"
on public.projects
for delete
to authenticated
using (
  (select auth.uid()) =
  '79d23538-55d5-4d61-b615-bcf94a79cd68'::uuid
);
