create table if not exists public.call_center_monthly_snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null check (month_key ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  month_label text not null,
  snapshot_version integer not null default 1 check (snapshot_version > 0),
  source_hash text not null,
  source_manifest jsonb not null default '[]'::jsonb,
  loaded_dates jsonb not null default '[]'::jsonb,
  coverage jsonb not null default '{}'::jsonb,
  kpis jsonb not null default '{}'::jsonb,
  shift_kpis jsonb not null default '{}'::jsonb,
  operational_detail jsonb not null default '{}'::jsonb,
  daily_cumulative jsonb not null default '[]'::jsonb,
  representatives jsonb not null default '[]'::jsonb,
  platforms jsonb not null default '[]'::jsonb,
  branches jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  synced_at timestamptz not null default now(),
  primary key (user_id, month_key),
  constraint call_center_monthly_snapshots_source_manifest_array
    check (jsonb_typeof(source_manifest) = 'array'),
  constraint call_center_monthly_snapshots_loaded_dates_array
    check (jsonb_typeof(loaded_dates) = 'array'),
  constraint call_center_monthly_snapshots_daily_cumulative_array
    check (jsonb_typeof(daily_cumulative) = 'array'),
  constraint call_center_monthly_snapshots_representatives_array
    check (jsonb_typeof(representatives) = 'array'),
  constraint call_center_monthly_snapshots_platforms_array
    check (jsonb_typeof(platforms) = 'array'),
  constraint call_center_monthly_snapshots_branches_array
    check (jsonb_typeof(branches) = 'array'),
  constraint call_center_monthly_snapshots_coverage_object
    check (jsonb_typeof(coverage) = 'object'),
  constraint call_center_monthly_snapshots_kpis_object
    check (jsonb_typeof(kpis) = 'object'),
  constraint call_center_monthly_snapshots_shift_kpis_object
    check (jsonb_typeof(shift_kpis) = 'object'),
  constraint call_center_monthly_snapshots_operational_detail_object
    check (jsonb_typeof(operational_detail) = 'object')
);

alter table public.call_center_monthly_snapshots enable row level security;

drop policy if exists call_center_monthly_snapshots_select_own
  on public.call_center_monthly_snapshots;
drop policy if exists call_center_monthly_snapshots_insert_own
  on public.call_center_monthly_snapshots;
drop policy if exists call_center_monthly_snapshots_update_own
  on public.call_center_monthly_snapshots;
drop policy if exists call_center_monthly_snapshots_delete_own
  on public.call_center_monthly_snapshots;

create policy call_center_monthly_snapshots_select_own
  on public.call_center_monthly_snapshots
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy call_center_monthly_snapshots_insert_own
  on public.call_center_monthly_snapshots
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy call_center_monthly_snapshots_update_own
  on public.call_center_monthly_snapshots
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy call_center_monthly_snapshots_delete_own
  on public.call_center_monthly_snapshots
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.call_center_monthly_snapshots
  to authenticated;
