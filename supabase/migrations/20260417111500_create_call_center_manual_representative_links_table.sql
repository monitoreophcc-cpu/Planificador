create table if not exists public.call_center_manual_representative_links (
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_name text not null,
  representative_name text not null,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, agent_name)
);

create index if not exists call_center_manual_representative_links_user_idx
  on public.call_center_manual_representative_links (user_id, agent_name);

alter table public.call_center_manual_representative_links enable row level security;

drop policy if exists call_center_manual_representative_links_select_own on public.call_center_manual_representative_links;
drop policy if exists call_center_manual_representative_links_insert_own on public.call_center_manual_representative_links;
drop policy if exists call_center_manual_representative_links_update_own on public.call_center_manual_representative_links;
drop policy if exists call_center_manual_representative_links_delete_own on public.call_center_manual_representative_links;

create policy call_center_manual_representative_links_select_own on public.call_center_manual_representative_links
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy call_center_manual_representative_links_insert_own on public.call_center_manual_representative_links
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy call_center_manual_representative_links_update_own on public.call_center_manual_representative_links
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy call_center_manual_representative_links_delete_own on public.call_center_manual_representative_links
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.call_center_manual_representative_links to authenticated;
