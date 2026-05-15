-- Day 5 Morning absentee record grants for current-week draft reports.
-- Run this file after 001_initial_schema.sql, 002_rls_policies.sql,
-- 004_api_grants.sql, 005_report_write_grants.sql,
-- 006_report_draft_update_grants.sql, and 007_report_submit_grants.sql
-- have been applied.
--
-- This exposes only INSERT and DELETE on absentee_records to authenticated
-- users. RLS keeps both operations limited to the signed-in company leader or
-- assistant leader for their active assigned company, and only while the
-- linked weekly report is a current Africa/Lagos week draft.
--
-- Do not add UPDATE, weekly_reports DELETE/UPDATE, service_role behavior,
-- follow-up case creation, admin review, or notifications here.

drop policy if exists "absentee_records_company_leaders_insert"
on public.absentee_records;

drop policy if exists "absentee_records_company_leaders_update"
on public.absentee_records;

drop policy if exists "absentee_records_company_leaders_delete"
on public.absentee_records;

drop policy if exists "absentee_records_company_leaders_insert_current_draft"
on public.absentee_records;

drop policy if exists "absentee_records_company_leaders_delete_current_draft"
on public.absentee_records;

create policy "absentee_records_company_leaders_insert_current_draft"
on public.absentee_records for insert
with check (
  auth.role() = 'authenticated'
  and reason in (
    'no_reason_given',
    'illness',
    'travel',
    'work',
    'school',
    'family_issue',
    'bereavement',
    'other'
  )
  and streak_count = 1
  and follow_up_required = false
  and exists (
    select 1
    from public.weekly_reports wr
    join public.companies c
      on c.id = wr.company_id
     and c.church_id = wr.church_id
     and c.status = 'active'
    join public.church_memberships cm
      on cm.church_id = wr.church_id
     and cm.user_id = auth.uid()
     and cm.status = 'active'
     and cm.role in ('company_leader', 'assistant_leader')
    join public.company_members member
      on member.id = absentee_records.company_member_id
     and member.church_id = wr.church_id
     and member.company_id = wr.company_id
     and member.status = 'active'
    where wr.id = absentee_records.weekly_report_id
      and wr.church_id = absentee_records.church_id
      and wr.company_id = absentee_records.company_id
      and wr.status = 'draft'
      -- MVP reporting uses Africa/Lagos for the current church; move this to
      -- church-specific timezone configuration when multi-church reporting needs it.
      and wr.report_week_start = date_trunc('week', timezone('Africa/Lagos', now()))::date
      and wr.report_week_end = (date_trunc('week', timezone('Africa/Lagos', now()))::date + 6)
      and absentee_records.absence_date between wr.report_week_start and wr.report_week_end
      and c.id = absentee_records.company_id
      and c.church_id = absentee_records.church_id
      and (c.leader_id = auth.uid() or c.assistant_leader_id = auth.uid())
  )
);

create policy "absentee_records_company_leaders_delete_current_draft"
on public.absentee_records for delete
using (
  auth.role() = 'authenticated'
  and exists (
    select 1
    from public.weekly_reports wr
    join public.companies c
      on c.id = wr.company_id
     and c.church_id = wr.church_id
     and c.status = 'active'
    join public.church_memberships cm
      on cm.church_id = wr.church_id
     and cm.user_id = auth.uid()
     and cm.status = 'active'
     and cm.role in ('company_leader', 'assistant_leader')
    where wr.id = absentee_records.weekly_report_id
      and wr.church_id = absentee_records.church_id
      and wr.company_id = absentee_records.company_id
      and wr.status = 'draft'
      and wr.report_week_start = date_trunc('week', timezone('Africa/Lagos', now()))::date
      and wr.report_week_end = (date_trunc('week', timezone('Africa/Lagos', now()))::date + 6)
      and c.id = absentee_records.company_id
      and c.church_id = absentee_records.church_id
      and (c.leader_id = auth.uid() or c.assistant_leader_id = auth.uid())
  )
);

revoke update on public.absentee_records from authenticated;

grant insert on public.absentee_records to authenticated;
grant delete on public.absentee_records to authenticated;
