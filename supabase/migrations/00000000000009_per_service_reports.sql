-- Move from ONE report per company per week to ONE REPORT PER SERVICE.
-- SaltCity runs three services a week: Sunday 09:00, Wednesday 17:00, Friday 17:00.
-- Leaders file a report immediately after each service.
--
-- week_start / week_number / year are KEPT so weekly roll-ups (trends, exports)
-- keep working unchanged; service_date is the new natural key.
-- Safe on live data: additive columns, backfill, then the constraint swap.

-- 1. New columns
alter table weekly_reports add column if not exists service_date date;
alter table weekly_reports add column if not exists service_type text;

-- 2. Backfill existing rows — they were all effectively the Sunday service,
--    which is week_start (Monday) + 6 days.
update weekly_reports
   set service_date = week_start + 6,
       service_type = 'sunday'
 where service_date is null;

-- 3. Now enforce
alter table weekly_reports alter column service_date set not null;
alter table weekly_reports alter column service_type set not null;

alter table weekly_reports drop constraint if exists weekly_reports_service_type_check;
alter table weekly_reports add constraint weekly_reports_service_type_check
  check (service_type in ('sunday', 'wednesday', 'friday', 'special'));

-- 4. Swap the uniqueness: one report per company per SERVICE (not per week).
--    Drop ANY unique constraint on exactly (company_id, week_start) regardless of
--    its generated name — if this were missed, leaders would still be capped at
--    one report per week and midweek services would silently fail.
do $$
declare c record;
begin
  for c in
    select con.conname
      from pg_constraint con
      join pg_class rel on rel.oid = con.conrelid
     where rel.relname = 'weekly_reports'
       and con.contype = 'u'
       and (
         select array_agg(att.attname order by att.attname)
           from unnest(con.conkey) k
           join pg_attribute att
             on att.attrelid = con.conrelid and att.attnum = k
       ) = array['company_id', 'week_start']
  loop
    execute format('alter table weekly_reports drop constraint %I', c.conname);
  end loop;
end $$;

alter table weekly_reports drop constraint if exists weekly_reports_company_service_key;
alter table weekly_reports add constraint weekly_reports_company_service_key
  unique (company_id, service_date);

create index if not exists weekly_reports_service_date_idx on weekly_reports(service_date);

-- 5. Follow-up cases: only SUNDAY absences open a care case.
--    Missing a midweek service is common; auto-creating cases for all three
--    services would flood the Care queue and dilute the real signal.
--    (Change 'sunday' below if you want midweek absences to raise cases too.)
create or replace function handle_report_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'submitted' and old.status = 'draft' and new.service_type = 'sunday' then
    insert into public.follow_up_cases (member_id, report_id, company_id, assigned_to, status, context_note)
    select
      ar.member_id,
      ar.report_id,
      new.company_id,
      new.submitted_by,
      'assigned',
      ar.absence_reason
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
