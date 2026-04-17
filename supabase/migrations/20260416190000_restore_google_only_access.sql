drop policy if exists representatives_select_shared on public.representatives;
drop policy if exists representatives_insert_owner on public.representatives;
drop policy if exists representatives_update_owner on public.representatives;
drop policy if exists representatives_delete_owner on public.representatives;
drop policy if exists weekly_plans_select_shared on public.weekly_plans;
drop policy if exists weekly_plans_insert_owner on public.weekly_plans;
drop policy if exists weekly_plans_update_owner on public.weekly_plans;
drop policy if exists weekly_plans_delete_owner on public.weekly_plans;
drop policy if exists incidents_select_shared on public.incidents;
drop policy if exists incidents_insert_owner on public.incidents;
drop policy if exists incidents_update_owner on public.incidents;
drop policy if exists incidents_delete_owner on public.incidents;
drop policy if exists swaps_select_shared on public.swaps;
drop policy if exists swaps_insert_owner on public.swaps;
drop policy if exists swaps_update_owner on public.swaps;
drop policy if exists swaps_delete_owner on public.swaps;
drop policy if exists coverage_rules_select_shared on public.coverage_rules;
drop policy if exists coverage_rules_insert_owner on public.coverage_rules;
drop policy if exists coverage_rules_update_owner on public.coverage_rules;
drop policy if exists coverage_rules_delete_owner on public.coverage_rules;
drop policy if exists audit_log_select_shared on public.audit_log;
drop policy if exists audit_log_insert_owner on public.audit_log;
drop policy if exists call_center_global_kpis_select_shared on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_insert_owner on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_update_owner on public.call_center_global_kpis;
drop policy if exists call_center_global_kpis_delete_owner on public.call_center_global_kpis;
drop policy if exists call_center_shift_kpis_select_shared on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_insert_owner on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_update_owner on public.call_center_shift_kpis;
drop policy if exists call_center_shift_kpis_delete_owner on public.call_center_shift_kpis;
drop policy if exists call_center_operational_details_select_shared on public.call_center_operational_details;
drop policy if exists call_center_operational_details_insert_owner on public.call_center_operational_details;
drop policy if exists call_center_operational_details_update_owner on public.call_center_operational_details;
drop policy if exists call_center_operational_details_delete_owner on public.call_center_operational_details;

drop table if exists public.app_access_roles;

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

grant select, insert, update, delete on public.representatives to authenticated;
grant select, insert, update, delete on public.weekly_plans to authenticated;
grant select, insert, update, delete on public.incidents to authenticated;
grant select, insert, update, delete on public.swaps to authenticated;
grant select, insert, update, delete on public.coverage_rules to authenticated;
grant select, insert on public.audit_log to authenticated;
grant usage, select on sequence public.audit_log_id_seq to authenticated;
grant select, insert, update, delete on public.call_center_global_kpis to authenticated;
grant select, insert, update, delete on public.call_center_shift_kpis to authenticated;
grant select, insert, update, delete on public.call_center_operational_details to authenticated;
