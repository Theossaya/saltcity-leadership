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

-- Do not recreate a weekly_reports assigned-user policy that queries
-- absentee_records. The current-week absentee insert policy reads
-- weekly_reports, and a weekly_reports policy that reads absentee_records
-- creates an RLS recursion cycle. Assigned leaders can still see resolved
-- follow-up context through the absentee record policy below, while report week
-- context gracefully falls back in the application when weekly_reports is not
-- visible.

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
