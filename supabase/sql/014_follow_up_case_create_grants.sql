-- Day 10 Afternoon follow-up case creation grants and RLS policy.
-- Run this file after 001_initial_schema.sql through
-- 013_task_status_update_grants.sql.
--
-- This enables active church admins and super admins to create follow-up
-- cases from existing absentee records in their own church through the
-- authenticated Supabase API. It does not grant update access, delete access,
-- contact tracking, notifications, task creation, or service_role behavior.

grant insert on table public.follow_up_cases to authenticated;

create unique index if not exists follow_up_cases_one_active_case_per_absentee
on public.follow_up_cases (absentee_record_id)
where absentee_record_id is not null
  and status in ('open', 'assigned', 'contacted', 'escalated');

drop policy if exists "follow_up_cases_admin_manage" on public.follow_up_cases;
drop policy if exists "follow_up_cases_admin_select_all" on public.follow_up_cases;
drop policy if exists "follow_up_cases_admin_insert" on public.follow_up_cases;
drop policy if exists "follow_up_cases_insert_admin" on public.follow_up_cases;
drop policy if exists "follow_up_cases_admin_create_from_absentee" on public.follow_up_cases;

create policy "follow_up_cases_admin_select_all"
on public.follow_up_cases for select
using (
  public.current_user_has_role(
    church_id,
    array['super_admin', 'church_admin']
  )
);

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
  and exists (
    select 1
    from public.absentee_records ar
    where ar.id = follow_up_cases.absentee_record_id
      and ar.church_id = follow_up_cases.church_id
      and ar.company_id = follow_up_cases.company_id
      and ar.company_member_id = follow_up_cases.company_member_id
  )
  and (
    assigned_to is null
    or exists (
      select 1
      from public.church_memberships cm
      where cm.church_id = follow_up_cases.church_id
        and cm.user_id = follow_up_cases.assigned_to
        and cm.status = 'active'
    )
  )
);
