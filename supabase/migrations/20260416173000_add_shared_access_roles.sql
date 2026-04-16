create table if not exists public.app_access_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('OWNER', 'READER')),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists app_access_roles_single_owner_idx
  on public.app_access_roles ((role))
  where role = 'OWNER';

create index if not exists app_access_roles_role_idx
  on public.app_access_roles (role);

alter table public.app_access_roles enable row level security;

drop policy if exists app_access_roles_select_relevant on public.app_access_roles;
drop policy if exists app_access_roles_insert_initial_owner on public.app_access_roles;
drop policy if exists app_access_roles_owner_manage on public.app_access_roles;

create policy app_access_roles_select_relevant on public.app_access_roles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or role = 'OWNER'
    or exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy app_access_roles_insert_initial_owner on public.app_access_roles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'OWNER'
    and not exists (
      select 1
      from public.app_access_roles access
      where access.role = 'OWNER'
    )
  );

create policy app_access_roles_owner_manage on public.app_access_roles
  for all to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  )
  with check (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

grant select, insert, update, delete on public.app_access_roles to authenticated;

drop policy if exists representatives_select_own on public.representatives;
drop policy if exists representatives_insert_own on public.representatives;
drop policy if exists representatives_update_own on public.representatives;
drop policy if exists representatives_delete_own on public.representatives;
drop policy if exists representatives_select_shared on public.representatives;
drop policy if exists representatives_insert_owner on public.representatives;
drop policy if exists representatives_update_owner on public.representatives;
drop policy if exists representatives_delete_owner on public.representatives;

create policy representatives_select_shared on public.representatives
  for select to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role in ('OWNER', 'READER')
    )
    and exists (
      select 1
      from public.app_access_roles owner_access
      where owner_access.user_id = representatives.user_id
        and owner_access.role = 'OWNER'
    )
  );

create policy representatives_insert_owner on public.representatives
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy representatives_update_owner on public.representatives
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy representatives_delete_owner on public.representatives
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

drop policy if exists weekly_plans_select_own on public.weekly_plans;
drop policy if exists weekly_plans_insert_own on public.weekly_plans;
drop policy if exists weekly_plans_update_own on public.weekly_plans;
drop policy if exists weekly_plans_delete_own on public.weekly_plans;
drop policy if exists weekly_plans_select_shared on public.weekly_plans;
drop policy if exists weekly_plans_insert_owner on public.weekly_plans;
drop policy if exists weekly_plans_update_owner on public.weekly_plans;
drop policy if exists weekly_plans_delete_owner on public.weekly_plans;

create policy weekly_plans_select_shared on public.weekly_plans
  for select to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role in ('OWNER', 'READER')
    )
    and exists (
      select 1
      from public.app_access_roles owner_access
      where owner_access.user_id = weekly_plans.user_id
        and owner_access.role = 'OWNER'
    )
  );

create policy weekly_plans_insert_owner on public.weekly_plans
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy weekly_plans_update_owner on public.weekly_plans
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy weekly_plans_delete_owner on public.weekly_plans
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

drop policy if exists incidents_select_own on public.incidents;
drop policy if exists incidents_insert_own on public.incidents;
drop policy if exists incidents_update_own on public.incidents;
drop policy if exists incidents_delete_own on public.incidents;
drop policy if exists incidents_select_shared on public.incidents;
drop policy if exists incidents_insert_owner on public.incidents;
drop policy if exists incidents_update_owner on public.incidents;
drop policy if exists incidents_delete_owner on public.incidents;

create policy incidents_select_shared on public.incidents
  for select to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role in ('OWNER', 'READER')
    )
    and exists (
      select 1
      from public.app_access_roles owner_access
      where owner_access.user_id = incidents.user_id
        and owner_access.role = 'OWNER'
    )
  );

create policy incidents_insert_owner on public.incidents
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy incidents_update_owner on public.incidents
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy incidents_delete_owner on public.incidents
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

drop policy if exists swaps_select_own on public.swaps;
drop policy if exists swaps_insert_own on public.swaps;
drop policy if exists swaps_update_own on public.swaps;
drop policy if exists swaps_delete_own on public.swaps;
drop policy if exists swaps_select_shared on public.swaps;
drop policy if exists swaps_insert_owner on public.swaps;
drop policy if exists swaps_update_owner on public.swaps;
drop policy if exists swaps_delete_owner on public.swaps;

create policy swaps_select_shared on public.swaps
  for select to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role in ('OWNER', 'READER')
    )
    and exists (
      select 1
      from public.app_access_roles owner_access
      where owner_access.user_id = swaps.user_id
        and owner_access.role = 'OWNER'
    )
  );

create policy swaps_insert_owner on public.swaps
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy swaps_update_owner on public.swaps
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy swaps_delete_owner on public.swaps
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

drop policy if exists coverage_rules_select_own on public.coverage_rules;
drop policy if exists coverage_rules_insert_own on public.coverage_rules;
drop policy if exists coverage_rules_update_own on public.coverage_rules;
drop policy if exists coverage_rules_delete_own on public.coverage_rules;
drop policy if exists coverage_rules_select_shared on public.coverage_rules;
drop policy if exists coverage_rules_insert_owner on public.coverage_rules;
drop policy if exists coverage_rules_update_owner on public.coverage_rules;
drop policy if exists coverage_rules_delete_owner on public.coverage_rules;

create policy coverage_rules_select_shared on public.coverage_rules
  for select to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role in ('OWNER', 'READER')
    )
    and exists (
      select 1
      from public.app_access_roles owner_access
      where owner_access.user_id = coverage_rules.user_id
        and owner_access.role = 'OWNER'
    )
  );

create policy coverage_rules_insert_owner on public.coverage_rules
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy coverage_rules_update_owner on public.coverage_rules
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy coverage_rules_delete_owner on public.coverage_rules
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

drop policy if exists audit_log_select_own on public.audit_log;
drop policy if exists audit_log_insert_own on public.audit_log;
drop policy if exists audit_log_select_shared on public.audit_log;
drop policy if exists audit_log_insert_owner on public.audit_log;

create policy audit_log_select_shared on public.audit_log
  for select to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role in ('OWNER', 'READER')
    )
    and exists (
      select 1
      from public.app_access_roles owner_access
      where owner_access.user_id = audit_log.user_id
        and owner_access.role = 'OWNER'
    )
  );

create policy audit_log_insert_owner on public.audit_log
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

drop policy if exists call_center_global_kpis_select_own on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_insert_own on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_update_own on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_delete_own on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_select_shared on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_insert_owner on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_update_owner on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_delete_owner on public.call_center_global_kpis;

create policy call_center_global_kpis_select_shared on public.call_center_global_kpis
  for select to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role in ('OWNER', 'READER')
    )
    and exists (
      select 1
      from public.app_access_roles owner_access
      where owner_access.user_id = call_center_global_kpis.user_id
        and owner_access.role = 'OWNER'
    )
  );

create policy call_center_global_kpis_insert_owner on public.call_center_global_kpis
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy call_center_global_kpis_update_owner on public.call_center_global_kpis
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy call_center_global_kpis_delete_owner on public.call_center_global_kpis
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

drop policy if exists call_center_shift_kpis_select_own on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_insert_own on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_update_own on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_delete_own on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_select_shared on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_insert_owner on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_update_owner on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_delete_owner on public.call_center_shift_kpis;

create policy call_center_shift_kpis_select_shared on public.call_center_shift_kpis
  for select to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role in ('OWNER', 'READER')
    )
    and exists (
      select 1
      from public.app_access_roles owner_access
      where owner_access.user_id = call_center_shift_kpis.user_id
        and owner_access.role = 'OWNER'
    )
  );

create policy call_center_shift_kpis_insert_owner on public.call_center_shift_kpis
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy call_center_shift_kpis_update_owner on public.call_center_shift_kpis
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy call_center_shift_kpis_delete_owner on public.call_center_shift_kpis
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

drop policy if exists call_center_operational_details_select_own on public.call_center_operational_details;
drop policy if exists call_center_operational_details_insert_own on public.call_center_operational_details;
drop policy if exists call_center_operational_details_update_own on public.call_center_operational_details;
drop policy if exists call_center_operational_details_delete_own on public.call_center_operational_details;
drop policy if exists call_center_operational_details_select_shared on public.call_center_operational_details;
drop policy if exists call_center_operational_details_insert_owner on public.call_center_operational_details;
drop policy if exists call_center_operational_details_update_owner on public.call_center_operational_details;
drop policy if exists call_center_operational_details_delete_owner on public.call_center_operational_details;

create policy call_center_operational_details_select_shared on public.call_center_operational_details
  for select to authenticated
  using (
    exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role in ('OWNER', 'READER')
    )
    and exists (
      select 1
      from public.app_access_roles owner_access
      where owner_access.user_id = call_center_operational_details.user_id
        and owner_access.role = 'OWNER'
    )
  );

create policy call_center_operational_details_insert_owner on public.call_center_operational_details
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy call_center_operational_details_update_owner on public.call_center_operational_details
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );

create policy call_center_operational_details_delete_owner on public.call_center_operational_details
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.app_access_roles access
      where access.user_id = (select auth.uid())
        and access.role = 'OWNER'
    )
  );
