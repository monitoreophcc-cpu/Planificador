create table if not exists public.call_center_daily_sources (
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null,
  answered_calls jsonb not null default '[]'::jsonb,
  raw_abandoned_calls jsonb not null default '[]'::jsonb,
  raw_transactions jsonb not null default '[]'::jsonb,
  source_updated_at timestamptz not null default timezone('utc', now()),
  synced_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, report_date),
  constraint call_center_daily_sources_answered_calls_array
    check (jsonb_typeof(answered_calls) = 'array'),
  constraint call_center_daily_sources_raw_abandoned_calls_array
    check (jsonb_typeof(raw_abandoned_calls) = 'array'),
  constraint call_center_daily_sources_raw_transactions_array
    check (jsonb_typeof(raw_transactions) = 'array')
);

create index if not exists call_center_daily_sources_user_date_idx
  on public.call_center_daily_sources (user_id, report_date desc);

alter table public.call_center_daily_sources enable row level security;

drop policy if exists call_center_daily_sources_select_own on public.call_center_daily_sources;
drop policy if exists call_center_daily_sources_insert_own on public.call_center_daily_sources;
drop policy if exists call_center_daily_sources_update_own on public.call_center_daily_sources;
drop policy if exists call_center_daily_sources_delete_own on public.call_center_daily_sources;

create policy call_center_daily_sources_select_own on public.call_center_daily_sources
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy call_center_daily_sources_insert_own on public.call_center_daily_sources
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy call_center_daily_sources_update_own on public.call_center_daily_sources
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy call_center_daily_sources_delete_own on public.call_center_daily_sources
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.call_center_daily_sources to authenticated;
