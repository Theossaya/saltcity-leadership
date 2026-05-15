-- Day 5 Morning submit policy reconciliation for absentee records.
-- Run this file after 001_initial_schema.sql, 002_rls_policies.sql,
-- 004_api_grants.sql, 005_report_write_grants.sql,
-- 006_report_draft_update_grants.sql, 007_report_submit_grants.sql, and
-- 008_absentee_record_grants.sql have been applied.
--
-- 007 may already be applied in existing environments, so this migration
-- replaces the submit policy with the Day 4 submit checks plus the Day 5
-- absentee-count reconciliation check. It does not broaden grants.
--
-- Do not add DELETE, admin review, service_role, absentee UPDATE, follow-up
-- case creation, notifications, or table-wide weekly_reports UPDATE here.

drop policy if exists "weekly_reports_company_leaders_submit_current_draft"
on public.weekly_reports;

create policy "weekly_reports_company_leaders_submit_current_draft"
on public.weekly_reports for update
using (
  auth.role() = 'authenticated'
  and status = 'draft'
  -- MVP reporting uses Africa/Lagos for the current church; move this to
  -- church-specific timezone configuration when multi-church reporting needs it.
  and report_week_start = date_trunc('week', timezone('Africa/Lagos', now()))::date
  and report_week_end = (date_trunc('week', timezone('Africa/Lagos', now()))::date + 6)
  and exists (
    select 1
    from public.companies c
    join public.church_memberships cm
      on cm.church_id = c.church_id
     and cm.user_id = auth.uid()
     and cm.status = 'active'
     and cm.role in ('company_leader', 'assistant_leader')
    where c.id = weekly_reports.company_id
      and c.church_id = weekly_reports.church_id
      and c.status = 'active'
      and (c.leader_id = auth.uid() or c.assistant_leader_id = auth.uid())
  )
)
with check (
  auth.role() = 'authenticated'
  and status = 'submitted'
  and submitted_by = auth.uid()
  and submitted_at is not null
  and submitted_at between now() - interval '10 minutes' and now() + interval '10 minutes'
  and reviewed_by is null
  and reviewed_at is null
  and reviewer_notes is null
  and total_members = (
    select count(*)::integer
    from public.company_members cmembers
    where cmembers.church_id = weekly_reports.church_id
      and cmembers.company_id = weekly_reports.company_id
      and cmembers.status = 'active'
  )
  and present_count >= 0
  and absent_count >= 0
  and new_visitors_count >= 0
  and present_count + absent_count = total_members
  and absent_count = (
    select count(*)::integer
    from public.absentee_records ar
    where ar.weekly_report_id = weekly_reports.id
      and ar.church_id = weekly_reports.church_id
      and ar.company_id = weekly_reports.company_id
  )
  and report_week_start = date_trunc('week', timezone('Africa/Lagos', now()))::date
  and report_week_end = (date_trunc('week', timezone('Africa/Lagos', now()))::date + 6)
  and exists (
    select 1
    from public.companies c
    join public.church_memberships cm
      on cm.church_id = c.church_id
     and cm.user_id = auth.uid()
     and cm.status = 'active'
     and cm.role in ('company_leader', 'assistant_leader')
    where c.id = weekly_reports.company_id
      and c.church_id = weekly_reports.church_id
      and c.status = 'active'
      and (c.leader_id = auth.uid() or c.assistant_leader_id = auth.uid())
  )
);
