-- Day 12 Morning admin report review column-limited update grant.
-- Run this file after 001_initial_schema.sql through
-- 016_follow_up_history_read_policies.sql have been applied.
--
-- This grants authenticated users UPDATE only on weekly report review columns.
-- RLS keeps the write path limited to active same-church church_admin and
-- super_admin users reviewing already-submitted reports. It does not allow
-- report content edits, reopening, deletion, notifications, service_role logic,
-- or table-wide UPDATE access.

-- Drop obsolete assigned-user weekly report policies from older 015/016 runs.
-- These queried absentee_records from weekly_reports RLS and caused a
-- weekly_reports -> absentee_records -> weekly_reports/absentee_records RLS
-- recursion cycle during absentee inserts.
drop policy if exists "weekly_reports_assigned_follow_up_select"
on public.weekly_reports;

drop policy if exists "weekly_reports_assigned_resolved_follow_up_select"
on public.weekly_reports;

drop policy if exists "weekly_reports_admin_update"
on public.weekly_reports;

drop policy if exists "weekly_reports_admin_review_submitted"
on public.weekly_reports;

create policy "weekly_reports_admin_review_submitted"
on public.weekly_reports for update
using (
  auth.role() = 'authenticated'
  and status = 'submitted'
  and exists (
    select 1
    from public.church_memberships cm
    where cm.church_id = weekly_reports.church_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role in ('church_admin', 'super_admin')
  )
)
with check (
  auth.role() = 'authenticated'
  and status in ('reviewed', 'flagged')
  and reviewed_by = auth.uid()
  and reviewed_at is not null
  and reviewed_at between now() - interval '10 minutes'
                  and now() + interval '1 minute'
  and (
    status = 'reviewed'
    or (
      status = 'flagged'
      and reviewer_notes is not null
      and length(btrim(reviewer_notes)) > 0
    )
  )
  and exists (
    select 1
    from public.church_memberships cm
    where cm.church_id = weekly_reports.church_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role in ('church_admin', 'super_admin')
  )
);

create or replace function public.prevent_weekly_report_review_content_mutation()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'submitted' and new.status in ('reviewed', 'flagged') then
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
      or old.submitted_by is distinct from new.submitted_by
      or old.submitted_at is distinct from new.submitted_at
    then
      raise exception 'weekly report content cannot change during review';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists weekly_reports_prevent_review_content_mutation
on public.weekly_reports;

create trigger weekly_reports_prevent_review_content_mutation
before update on public.weekly_reports
for each row execute function public.prevent_weekly_report_review_content_mutation();

grant update (
  status,
  reviewed_by,
  reviewed_at,
  reviewer_notes
)
on public.weekly_reports to authenticated;
