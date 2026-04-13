create table if not exists public.call_center_global_kpis (
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null,
  recibidas integer not null default 0 check (recibidas >= 0),
  contestadas integer not null default 0 check (contestadas >= 0),
  abandonadas integer not null default 0 check (abandonadas >= 0),
  nivel_servicio numeric(6,2) not null default 0,
  abandono_pct numeric(6,2) not null default 0,
  transacciones_cc integer not null default 0 check (transacciones_cc >= 0),
  conversion_pct numeric(6,2) not null default 0,
  ventas_validas numeric(14,2) not null default 0,
  ticket_promedio numeric(14,2) not null default 0,
  answered_loaded boolean not null default false,
  abandoned_loaded boolean not null default false,
  transactions_loaded boolean not null default false,
  loaded_sources smallint not null default 0 check (loaded_sources between 0 and 3),
  is_complete boolean not null default false,
  source_updated_at timestamptz not null default timezone('utc', now()),
  synced_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, report_date)
);

create table if not exists public.call_center_shift_kpis (
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null,
  shift text not null check (shift in ('DAY', 'NIGHT')),
  recibidas integer not null default 0 check (recibidas >= 0),
  contestadas integer not null default 0 check (contestadas >= 0),
  transacciones_cc integer not null default 0 check (transacciones_cc >= 0),
  conversion_pct numeric(6,2) not null default 0,
  abandonadas integer not null default 0 check (abandonadas >= 0),
  duplicadas integer not null default 0 check (duplicadas >= 0),
  lt20 integer not null default 0 check (lt20 >= 0),
  nivel_servicio numeric(6,2) not null default 0,
  abandono_pct numeric(6,2) not null default 0,
  synced_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, report_date, shift),
  foreign key (user_id, report_date)
    references public.call_center_global_kpis(user_id, report_date)
    on delete cascade
);

create table if not exists public.call_center_operational_details (
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null,
  shift text not null check (shift in ('DAY', 'NIGHT')),
  slot_start time not null,
  recibidas integer not null default 0 check (recibidas >= 0),
  contestadas integer not null default 0 check (contestadas >= 0),
  transacciones_cc integer not null default 0 check (transacciones_cc >= 0),
  conexion_sum numeric(12,2) not null default 0,
  conexion_avg numeric(12,2) not null default 0,
  pct_atencion numeric(6,2) not null default 0,
  abandonadas integer not null default 0 check (abandonadas >= 0),
  aband_conn_sum numeric(12,2) not null default 0,
  aband_avg numeric(12,2) not null default 0,
  pct_abandono numeric(6,2) not null default 0,
  conversion_pct numeric(6,2) not null default 0,
  synced_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, report_date, shift, slot_start),
  foreign key (user_id, report_date)
    references public.call_center_global_kpis(user_id, report_date)
    on delete cascade
);

create index if not exists call_center_global_kpis_user_date_idx
  on public.call_center_global_kpis (user_id, report_date desc);
create index if not exists call_center_shift_kpis_user_date_idx
  on public.call_center_shift_kpis (user_id, report_date desc, shift);
create index if not exists call_center_operational_details_user_date_idx
  on public.call_center_operational_details (user_id, report_date desc, shift, slot_start);

alter table public.call_center_global_kpis enable row level security;
alter table public.call_center_shift_kpis enable row level security;
alter table public.call_center_operational_details enable row level security;

drop policy if exists call_center_global_kpis_select_own on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_insert_own on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_update_own on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_delete_own on public.call_center_global_kpis;
create policy call_center_global_kpis_select_own on public.call_center_global_kpis
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy call_center_global_kpis_insert_own on public.call_center_global_kpis
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy call_center_global_kpis_update_own on public.call_center_global_kpis
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy call_center_global_kpis_delete_own on public.call_center_global_kpis
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists call_center_shift_kpis_select_own on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_insert_own on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_update_own on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_delete_own on public.call_center_shift_kpis;
create policy call_center_shift_kpis_select_own on public.call_center_shift_kpis
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy call_center_shift_kpis_insert_own on public.call_center_shift_kpis
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy call_center_shift_kpis_update_own on public.call_center_shift_kpis
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy call_center_shift_kpis_delete_own on public.call_center_shift_kpis
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists call_center_operational_details_select_own on public.call_center_operational_details;
drop policy if exists call_center_operational_details_insert_own on public.call_center_operational_details;
drop policy if exists call_center_operational_details_update_own on public.call_center_operational_details;
drop policy if exists call_center_operational_details_delete_own on public.call_center_operational_details;
create policy call_center_operational_details_select_own on public.call_center_operational_details
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy call_center_operational_details_insert_own on public.call_center_operational_details
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy call_center_operational_details_update_own on public.call_center_operational_details
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy call_center_operational_details_delete_own on public.call_center_operational_details
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.call_center_global_kpis to authenticated;
grant select, insert, update, delete on public.call_center_shift_kpis to authenticated;
grant select, insert, update, delete on public.call_center_operational_details to authenticated;
