alter table public.representatives
  add column if not exists employment_type text not null default 'FULL_TIME'
    check (employment_type in ('PART_TIME', 'FULL_TIME')),
  add column if not exists commercial_eligible boolean not null default false;

create table if not exists public.commercial_goals (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  shift text not null check (shift in ('DAY', 'NIGHT')),
  segment text not null check (segment in ('PART_TIME', 'FULL_TIME', 'MIXTO')),
  monthly_target integer not null default 0 check (monthly_target >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, id)
);

create index if not exists commercial_goals_user_shift_segment_idx
  on public.commercial_goals (user_id, shift, segment);

alter table public.commercial_goals enable row level security;

drop policy if exists commercial_goals_select_own on public.commercial_goals;
drop policy if exists commercial_goals_insert_own on public.commercial_goals;
drop policy if exists commercial_goals_update_own on public.commercial_goals;
drop policy if exists commercial_goals_delete_own on public.commercial_goals;

create policy commercial_goals_select_own on public.commercial_goals
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy commercial_goals_insert_own on public.commercial_goals
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy commercial_goals_update_own on public.commercial_goals
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy commercial_goals_delete_own on public.commercial_goals
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.commercial_goals to authenticated;
