-- Day 4 Afternoon report submission column-limited update grant.
-- Run this file after 001_initial_schema.sql, 002_rls_policies.sql,
-- 004_api_grants.sql, 005_report_write_grants.sql, and
-- 006_report_draft_update_grants.sql have been applied.
--
-- This grants authenticated users UPDATE only on the columns needed to submit
-- an existing draft report. RLS keeps submission limited to the current
-- Africa/Lagos week draft for the signed-in company leader or assistant leader
-- of an active assigned company. The trigger below prevents the draft-edit
-- grant from being combined with this submit grant to change report content in
-- the same direct API update that submits the report.
--
-- Do not add DELETE, admin review, service_role, absentee, or follow-up
-- behavior here.

drop policy if exists "weekly_reports_company_leaders_submit"
on public.weekly_reports;

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

create or replace function public.prevent_weekly_report_submit_content_mutation()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'draft' and new.status = 'submitted' then
    if old.id is distinct from new.id
      or old.church_id is distinct from new.church_id
      or old.company_id is distinct from new.company_id
      or old.report_week_start is distinct from new.report_week_start
      or old.report_week_end is distinct from new.report_week_end
      or old.total_members is distinct from new.total_members
      or old.present_count is distinct from new.present_count
      or old.absent_count is distinct from new.absent_count
      or old.new_visitors_count is distinct from new.new_visitors_count
      or old.general_notes is distinct from new.general_notes
      or old.support_needed is distinct from new.support_needed
      or old.testimonies is distinct from new.testimonies
      or old.reviewed_by is distinct from new.reviewed_by
      or old.reviewed_at is distinct from new.reviewed_at
      or old.reviewer_notes is distinct from new.reviewer_notes
    then
      raise exception 'weekly report content cannot change during submission';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists weekly_reports_prevent_submit_content_mutation
on public.weekly_reports;

create trigger weekly_reports_prevent_submit_content_mutation
before update on public.weekly_reports
for each row execute function public.prevent_weekly_report_submit_content_mutation();

grant update (
  status,
  submitted_by,
  submitted_at
)
on public.weekly_reports to authenticated;
