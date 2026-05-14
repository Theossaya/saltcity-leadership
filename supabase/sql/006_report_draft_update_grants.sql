-- Day 4 Morning report draft column-limited update grant for counts and basic notes.
-- Run this file after 001_initial_schema.sql, 002_rls_policies.sql,
-- 004_api_grants.sql, and 005_report_write_grants.sql have been applied.
--
-- This revokes any table-wide weekly_reports UPDATE access from the
-- authenticated API role, then grants UPDATE only on the draft-edit columns
-- used by the report editing flow. The RLS policy below keeps that write
-- surface limited to the current Africa/Lagos week draft for an active company
-- assigned to the signed-in company leader or assistant leader. Submission,
-- review, company, church, and report week state are not update-granted and
-- must remain unchanged by direct authenticated updates.
--
-- Do not add DELETE, admin update, service_role, submission, review, absentee,
-- or follow-up behavior here.

drop policy if exists "weekly_reports_company_leaders_update_draft_flow"
on public.weekly_reports;

drop policy if exists "weekly_reports_admin_update"
on public.weekly_reports;

drop policy if exists "weekly_reports_company_leaders_update_current_draft"
on public.weekly_reports;

create policy "weekly_reports_company_leaders_update_current_draft"
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
  and status = 'draft'
  and submitted_by is null
  and submitted_at is null
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
  and present_count + absent_count <= total_members
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

revoke update on public.weekly_reports from authenticated;

grant update (
  total_members,
  present_count,
  absent_count,
  new_visitors_count,
  general_notes,
  support_needed,
  testimonies
)
on public.weekly_reports to authenticated;
