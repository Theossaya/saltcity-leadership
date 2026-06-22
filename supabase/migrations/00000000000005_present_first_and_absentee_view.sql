-- Absentee/report UX overhaul:
--  1. members.phone — so the office can call absentees straight from the list.
--  2. follow_up_cases.escalated — a leader can flag a case for office help.
--  3. handle_report_submitted now DEFAULT-ASSIGNS each absentee case to the
--     leader who submitted the report (their own company's members are naturally
--     theirs), and copies the leader's absence reason onto the case so the office
--     sees it without opening the report.
-- Safe on a live DB: additive columns + create-or-replace function.

alter table members          add column if not exists phone     text;
alter table follow_up_cases  add column if not exists escalated boolean not null default false;

create or replace function handle_report_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'submitted' and old.status = 'draft' then
    insert into public.follow_up_cases (member_id, report_id, company_id, assigned_to, status, context_note)
    select
      ar.member_id,
      ar.report_id,
      new.company_id,
      new.submitted_by,           -- the company's leader owns their own absentees
      'assigned',
      ar.absence_reason           -- carry the reason the leader gave
    from public.attendance_records ar
    where ar.report_id = new.id
      and ar.present = false
      and not exists (
        select 1 from public.follow_up_cases fc
        where fc.member_id = ar.member_id
          and fc.status not in ('resolved')
          and fc.report_id = new.id
      );
  end if;
  return new;
end;
$$;
