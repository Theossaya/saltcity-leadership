-- Day 3 Afternoon report write grant for starting weekly report drafts.
-- Run this file after 001_initial_schema.sql, 002_rls_policies.sql, and
-- 004_api_grants.sql have been applied.
--
-- This grant exposes INSERT on weekly_reports to the authenticated API role.
-- Because authenticated clients can call the Supabase API directly, the insert
-- RLS policy below narrows that write surface to draft-only creation for an
-- active assigned company in the user's active church, and requires the draft
-- member snapshot to match the current active company member count.
--
-- This is intentionally limited to starting draft reports through the
-- authenticated app flow. Do not add UPDATE here until the report form,
-- submission, and review flows have their own controlled server actions.
-- Full report editing/submission will get separate policies/actions later.

drop policy if exists "weekly_reports_company_leaders_insert"
on public.weekly_reports;

drop policy if exists "weekly_reports_company_leaders_insert_draft_only"
on public.weekly_reports;

create policy "weekly_reports_company_leaders_insert_draft_only"
on public.weekly_reports for insert
with check (
  auth.role() = 'authenticated'
  and status = 'draft'
  and submitted_by is null
  and submitted_at is null
  and reviewed_by is null
  and reviewed_at is null
  and reviewer_notes is null
  and testimonies is null
  and support_needed is null
  and general_notes is null
  and present_count = 0
  and absent_count = 0
  and new_visitors_count = 0
  and total_members = (
    select count(*)::integer
    from public.company_members cmembers
    where cmembers.church_id = weekly_reports.church_id
      and cmembers.company_id = weekly_reports.company_id
      and cmembers.status = 'active'
  )
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
);

grant insert on public.weekly_reports to authenticated;
