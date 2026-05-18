-- Day 11 Morning follow-up case progress update grants and RLS policy.
-- Run this file after 001_initial_schema.sql through
-- 014_follow_up_case_create_grants.sql.
--
-- This enables active authenticated church admins, super admins, and assigned
-- leaders to update only safe follow-up progress columns. It does not grant
-- table-wide update access, delete access, reassignment, priority changes,
-- notifications, task creation, or service_role behavior.

grant update (
  status,
  date_contacted,
  next_action,
  notes,
  resolved_at
) on table public.follow_up_cases to authenticated;

drop policy if exists "follow_up_cases_select_restricted" on public.follow_up_cases;
drop policy if exists "follow_up_cases_assigned_select" on public.follow_up_cases;
drop policy if exists "weekly_reports_assigned_follow_up_select" on public.weekly_reports;
drop policy if exists "absentee_records_assigned_follow_up_select" on public.absentee_records;
drop policy if exists "company_members_assigned_follow_up_select" on public.company_members;
drop policy if exists "companies_assigned_follow_up_select" on public.companies;
drop policy if exists "follow_up_cases_admin_manage" on public.follow_up_cases;
drop policy if exists "follow_up_cases_progress_update" on public.follow_up_cases;
drop policy if exists "follow_up_cases_status_update" on public.follow_up_cases;
drop policy if exists "follow_up_cases_update_progress" on public.follow_up_cases;

create policy "follow_up_cases_select_restricted"
on public.follow_up_cases for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or company_id in (select * from public.current_user_company_ids(church_id))
);

create policy "follow_up_cases_assigned_select"
on public.follow_up_cases for select
using (
  auth.role() = 'authenticated'
  and assigned_to = auth.uid()
  and status in ('open', 'assigned', 'contacted', 'escalated')
  and public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
);

create policy "weekly_reports_assigned_follow_up_select"
on public.weekly_reports for select
using (
  auth.role() = 'authenticated'
  and public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
  and exists (
    select 1
    from public.absentee_records ar
    join public.follow_up_cases fuc
      on fuc.absentee_record_id = ar.id
      and fuc.church_id = ar.church_id
      and fuc.company_id = ar.company_id
      and fuc.company_member_id = ar.company_member_id
    where ar.weekly_report_id = weekly_reports.id
      and ar.church_id = weekly_reports.church_id
      and ar.company_id = weekly_reports.company_id
      and fuc.assigned_to = auth.uid()
      and fuc.status in ('open', 'assigned', 'contacted', 'escalated')
  )
);

create policy "absentee_records_assigned_follow_up_select"
on public.absentee_records for select
using (
  auth.role() = 'authenticated'
  and public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
  and exists (
    select 1
    from public.follow_up_cases fuc
    where fuc.absentee_record_id = absentee_records.id
      and fuc.church_id = absentee_records.church_id
      and fuc.company_id = absentee_records.company_id
      and fuc.company_member_id = absentee_records.company_member_id
      and fuc.assigned_to = auth.uid()
      and fuc.status in ('open', 'assigned', 'contacted', 'escalated')
  )
);

create policy "company_members_assigned_follow_up_select"
on public.company_members for select
using (
  auth.role() = 'authenticated'
  and public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
  and exists (
    select 1
    from public.follow_up_cases fuc
    where fuc.company_member_id = company_members.id
      and fuc.church_id = company_members.church_id
      and fuc.company_id = company_members.company_id
      and fuc.assigned_to = auth.uid()
      and fuc.status in ('open', 'assigned', 'contacted', 'escalated')
  )
);

create policy "companies_assigned_follow_up_select"
on public.companies for select
using (
  auth.role() = 'authenticated'
  and public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
  and exists (
    select 1
    from public.follow_up_cases fuc
    where fuc.company_id = companies.id
      and fuc.church_id = companies.church_id
      and fuc.assigned_to = auth.uid()
      and fuc.status in ('open', 'assigned', 'contacted', 'escalated')
  )
);

create policy "follow_up_cases_progress_update"
on public.follow_up_cases for update
using (
  auth.role() = 'authenticated'
  and public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
  and (
    public.current_user_has_role(
      church_id,
      array['super_admin', 'church_admin']
    )
    or assigned_to = auth.uid()
  )
)
with check (
  auth.role() = 'authenticated'
  and public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
  and (
    public.current_user_has_role(
      church_id,
      array['super_admin', 'church_admin']
    )
    or assigned_to = auth.uid()
  )
  and status in ('open', 'assigned', 'contacted', 'resolved', 'escalated')
  and (
    status <> 'assigned'
    or assigned_to is not null
  )
  and (
    (
      status = 'resolved'
      and resolved_at is not null
    )
    or (
      status <> 'resolved'
      and resolved_at is null
    )
  )
  and (
    resolved_at is null
    or resolved_at <= now()
  )
  and (
    date_contacted is null
    or date_contacted <= ((now() at time zone 'Africa/Lagos')::date)
  )
);
