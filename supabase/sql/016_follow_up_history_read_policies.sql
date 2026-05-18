-- Day 11 Afternoon follow-up history read policies.
-- Run this file after 001_initial_schema.sql through
-- 015_follow_up_case_status_update_grants.sql.
--
-- This adds SELECT-only visibility for assigned leaders to read resolved
-- follow-up cases assigned to them and the linked context needed to understand
-- the completed work. It does not add insert, update, delete, reassignment,
-- priority change, notification, task creation, service_role behavior, or
-- broader write access.

drop policy if exists "follow_up_cases_assigned_resolved_select"
on public.follow_up_cases;
drop policy if exists "weekly_reports_assigned_resolved_follow_up_select"
on public.weekly_reports;
drop policy if exists "absentee_records_assigned_resolved_follow_up_select"
on public.absentee_records;
drop policy if exists "company_members_assigned_resolved_follow_up_select"
on public.company_members;
drop policy if exists "companies_assigned_resolved_follow_up_select"
on public.companies;

create policy "follow_up_cases_assigned_resolved_select"
on public.follow_up_cases for select
using (
  auth.role() = 'authenticated'
  and assigned_to = auth.uid()
  and status = 'resolved'
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

create policy "weekly_reports_assigned_resolved_follow_up_select"
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
      and fuc.status = 'resolved'
  )
);

create policy "absentee_records_assigned_resolved_follow_up_select"
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
      and fuc.status = 'resolved'
  )
);

create policy "company_members_assigned_resolved_follow_up_select"
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
      and fuc.status = 'resolved'
  )
);

create policy "companies_assigned_resolved_follow_up_select"
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
      and fuc.status = 'resolved'
  )
);
