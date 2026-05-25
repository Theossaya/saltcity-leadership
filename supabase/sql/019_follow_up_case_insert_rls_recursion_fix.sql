-- Phase 13C follow-up case INSERT RLS recursion fix.
-- Run this file after 001_initial_schema.sql through
-- 018_company_member_create_grants.sql have been applied.
--
-- The original follow_up_cases INSERT policy checked linked absentee records
-- with a direct SELECT from public.absentee_records. Later assigned-user
-- absentee read policies query public.follow_up_cases, so the INSERT check can
-- recurse:
--
-- follow_up_cases INSERT policy -> absentee_records RLS -> follow_up_cases RLS.
--
-- These SECURITY DEFINER helpers perform the same relationship checks without
-- invoking caller RLS, then the INSERT policy calls the helpers instead of
-- directly querying absentee_records or follow_up_cases. This does not broaden
-- read/write permissions.

create or replace function public.follow_up_absentee_record_matches(
  p_absentee_record_id uuid,
  p_church_id uuid,
  p_company_id uuid,
  p_company_member_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.absentee_records ar
    where ar.id = p_absentee_record_id
      and ar.church_id = p_church_id
      and ar.company_id = p_company_id
      and ar.company_member_id = p_company_member_id
  );
$$;

create or replace function public.follow_up_assignee_is_active_member(
  p_church_id uuid,
  p_assigned_to uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_assigned_to is null
    or exists (
      select 1
      from public.church_memberships cm
      where cm.church_id = p_church_id
        and cm.user_id = p_assigned_to
        and cm.status = 'active'
    );
$$;

revoke all on function public.follow_up_absentee_record_matches(
  uuid,
  uuid,
  uuid,
  uuid
) from public;

revoke all on function public.follow_up_assignee_is_active_member(
  uuid,
  uuid
) from public;

grant execute on function public.follow_up_absentee_record_matches(
  uuid,
  uuid,
  uuid,
  uuid
) to authenticated;

grant execute on function public.follow_up_assignee_is_active_member(
  uuid,
  uuid
) to authenticated;

create unique index if not exists follow_up_cases_one_active_per_absentee
on public.follow_up_cases (church_id, absentee_record_id)
where absentee_record_id is not null
  and status in ('open', 'assigned', 'contacted', 'escalated');

drop policy if exists "follow_up_cases_admin_create_from_absentee"
on public.follow_up_cases;

create policy "follow_up_cases_admin_create_from_absentee"
on public.follow_up_cases for insert
with check (
  auth.role() = 'authenticated'
  and public.current_user_has_role(
    church_id,
    array['super_admin', 'church_admin']
  )
  and absentee_record_id is not null
  and priority in ('low', 'normal', 'high', 'urgent')
  and (
    (
      assigned_to is null
      and status = 'open'
    )
    or (
      assigned_to is not null
      and status = 'assigned'
    )
  )
  and resolved_at is null
  and date_contacted is null
  and public.follow_up_absentee_record_matches(
    absentee_record_id,
    church_id,
    company_id,
    company_member_id
  )
  and public.follow_up_assignee_is_active_member(
    church_id,
    assigned_to
  )
);
