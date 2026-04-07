create table if not exists public.representatives (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  base_shift text not null check (base_shift in ('DAY', 'NIGHT')),
  base_schedule jsonb not null default '{}'::jsonb,
  mix_profile jsonb,
  role text not null check (role in ('SALES', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'MANAGER')),
  is_active boolean not null default true,
  order_index integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, id)
);

create table if not exists public.weekly_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  week_start date not null,
  agents jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, id)
);

create table if not exists public.incidents (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  representative_id text not null,
  type text not null check (type in ('TARDANZA', 'AUSENCIA', 'ERROR', 'OTRO', 'LICENCIA', 'VACACIONES', 'OVERRIDE', 'SWAP')),
  start_date date not null,
  duration integer not null default 1 check (duration > 0),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  custom_points integer,
  assignment jsonb,
  previous_assignment jsonb,
  details text,
  source text check (source in ('BASE', 'COVERAGE', 'SWAP', 'OVERRIDE')),
  slot_owner_id text,
  metadata jsonb,
  disciplinary_key text,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, id)
);

create table if not exists public.swaps (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  type text not null check (type in ('COVER', 'DOUBLE', 'SWAP')),
  date date not null,
  shift text check (shift in ('DAY', 'NIGHT')),
  from_representative_id text,
  to_representative_id text,
  representative_id text,
  from_shift text check (from_shift in ('DAY', 'NIGHT')),
  to_shift text check (to_shift in ('DAY', 'NIGHT')),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, id)
);

create table if not exists public.coverage_rules (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  scope jsonb not null default '{"type":"GLOBAL"}'::jsonb,
  required integer not null default 0 check (required >= 0),
  label text,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, id)
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists representatives_user_order_idx
  on public.representatives (user_id, order_index);
create index if not exists weekly_plans_user_week_idx
  on public.weekly_plans (user_id, week_start);
create index if not exists incidents_user_start_date_idx
  on public.incidents (user_id, start_date);
create index if not exists swaps_user_date_idx
  on public.swaps (user_id, date);
create index if not exists audit_log_user_created_at_idx
  on public.audit_log (user_id, created_at desc);

alter table public.representatives enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.incidents enable row level security;
alter table public.swaps enable row level security;
alter table public.coverage_rules enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists representatives_select_own on public.representatives;
drop policy if exists representatives_insert_own on public.representatives;
drop policy if exists representatives_update_own on public.representatives;
drop policy if exists representatives_delete_own on public.representatives;
create policy representatives_select_own on public.representatives
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy representatives_insert_own on public.representatives
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy representatives_update_own on public.representatives
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy representatives_delete_own on public.representatives
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists weekly_plans_select_own on public.weekly_plans;
drop policy if exists weekly_plans_insert_own on public.weekly_plans;
drop policy if exists weekly_plans_update_own on public.weekly_plans;
drop policy if exists weekly_plans_delete_own on public.weekly_plans;
create policy weekly_plans_select_own on public.weekly_plans
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy weekly_plans_insert_own on public.weekly_plans
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy weekly_plans_update_own on public.weekly_plans
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy weekly_plans_delete_own on public.weekly_plans
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists incidents_select_own on public.incidents;
drop policy if exists incidents_insert_own on public.incidents;
drop policy if exists incidents_update_own on public.incidents;
drop policy if exists incidents_delete_own on public.incidents;
create policy incidents_select_own on public.incidents
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy incidents_insert_own on public.incidents
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy incidents_update_own on public.incidents
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy incidents_delete_own on public.incidents
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists swaps_select_own on public.swaps;
drop policy if exists swaps_insert_own on public.swaps;
drop policy if exists swaps_update_own on public.swaps;
drop policy if exists swaps_delete_own on public.swaps;
create policy swaps_select_own on public.swaps
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy swaps_insert_own on public.swaps
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy swaps_update_own on public.swaps
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy swaps_delete_own on public.swaps
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists coverage_rules_select_own on public.coverage_rules;
drop policy if exists coverage_rules_insert_own on public.coverage_rules;
drop policy if exists coverage_rules_update_own on public.coverage_rules;
drop policy if exists coverage_rules_delete_own on public.coverage_rules;
create policy coverage_rules_select_own on public.coverage_rules
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy coverage_rules_insert_own on public.coverage_rules
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy coverage_rules_update_own on public.coverage_rules
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy coverage_rules_delete_own on public.coverage_rules
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists audit_log_select_own on public.audit_log;
drop policy if exists audit_log_insert_own on public.audit_log;
create policy audit_log_select_own on public.audit_log
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy audit_log_insert_own on public.audit_log
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.representatives to authenticated;
grant select, insert, update, delete on public.weekly_plans to authenticated;
grant select, insert, update, delete on public.incidents to authenticated;
grant select, insert, update, delete on public.swaps to authenticated;
grant select, insert, update, delete on public.coverage_rules to authenticated;
grant select, insert on public.audit_log to authenticated;
grant usage, select on sequence public.audit_log_id_seq to authenticated;
