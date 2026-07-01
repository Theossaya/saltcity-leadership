-- SaltCity Leadership PWA — initial schema
-- Source of truth: SCHEMA.md

-- ===== Extensions =====
create extension if not exists "uuid-ossp";

-- ===== Enums =====
create type user_role as enum (
  'company_leader',
  'assistant_leader',
  'church_admin',
  'church_office'
);

create type report_status as enum (
  'draft',
  'submitted',
  'reviewed',
  'flagged'
);

create type follow_up_status as enum (
  'new',
  'assigned',
  'active',
  'resolved'
);

create type urgency_level as enum (
  'normal',
  'urgent'
);

create type contact_method as enum (
  'called',
  'messaged',
  'visited'
);

create type task_status as enum (
  'open',
  'done'
);

create type notice_priority as enum (
  'normal',
  'urgent'
);

create type audience_type as enum (
  'all',
  'leaders',
  'admins'
);

create type member_status as enum (
  'active',
  'inactive'
);

-- ===== Tables =====

create table companies (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text not null,
  role              user_role not null default 'company_leader',
  company_id        uuid references companies(id) on delete set null,
  -- company_id is null for church_admin and church_office
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table members (
  id          uuid primary key default uuid_generate_v4(),
  full_name   text not null,
  phone       text,
  company_id  uuid not null references companies(id) on delete cascade,
  status      member_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index members_company_id_idx on members(company_id);

create table weekly_reports (
  id              uuid primary key default uuid_generate_v4(),
  company_id      uuid not null references companies(id) on delete cascade,
  submitted_by    uuid not null references profiles(id),
  week_start      date not null,         -- always a Monday
  week_number     int not null,
  year            int not null,
  status          report_status not null default 'draft',
  notes           text,
  reviewed_by     uuid references profiles(id),
  reviewed_at     timestamptz,
  flag_reason     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique(company_id, week_start)
);

create index weekly_reports_company_id_idx on weekly_reports(company_id);
create index weekly_reports_week_start_idx on weekly_reports(week_start);
create index weekly_reports_status_idx     on weekly_reports(status);

create table attendance_records (
  id                uuid primary key default uuid_generate_v4(),
  report_id         uuid not null references weekly_reports(id) on delete cascade,
  member_id         uuid not null references members(id) on delete cascade,
  present           boolean not null default true,
  absence_reason    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique(report_id, member_id)
);

create index attendance_report_id_idx on attendance_records(report_id);

create table follow_up_cases (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid not null references members(id) on delete cascade,
  report_id       uuid not null references weekly_reports(id) on delete cascade,
  company_id      uuid not null references companies(id) on delete cascade,
  assigned_to     uuid references profiles(id) on delete set null,
  assigned_by     uuid references profiles(id) on delete set null,
  status          follow_up_status not null default 'new',
  urgency         urgency_level not null default 'normal',
  escalated       boolean not null default false,   -- leader asked the office for help
  context_note    text,   -- absence reason / note carried onto the case
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index follow_up_cases_assigned_to_idx  on follow_up_cases(assigned_to);
create index follow_up_cases_status_idx        on follow_up_cases(status);
create index follow_up_cases_company_id_idx    on follow_up_cases(company_id);

create table follow_up_contacts (
  id            uuid primary key default uuid_generate_v4(),
  case_id       uuid not null references follow_up_cases(id) on delete cascade,
  recorded_by   uuid not null references profiles(id),
  method        contact_method not null,
  note          text,
  contacted_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index follow_up_contacts_case_id_idx on follow_up_contacts(case_id);

create table tasks (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  created_by    uuid not null references profiles(id),
  assigned_to   uuid references profiles(id) on delete set null,
  company_id    uuid references companies(id) on delete set null,
  due_date      date,
  status        task_status not null default 'open',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index tasks_assigned_to_idx on tasks(assigned_to);
create index tasks_status_idx       on tasks(status);

create table announcements (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  body          text not null,
  published_by  uuid not null references profiles(id),
  priority      notice_priority not null default 'normal',
  audience      audience_type not null default 'all',
  published_at  timestamptz not null default now(),
  expires_at    timestamptz,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create index announcements_active_idx    on announcements(active);
create index announcements_audience_idx  on announcements(audience);

create table events (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  event_date    date not null,
  event_time    time,
  location      text,
  description   text,
  audience      audience_type not null default 'all',
  created_by    uuid not null references profiles(id),
  created_at    timestamptz not null default now()
);

create index events_event_date_idx on events(event_date);

-- ===== Views =====

-- security_invoker: run views with the caller's permissions so they respect RLS
-- on the underlying tables (avoids the Supabase "Security Definer View" warning).
create or replace view current_week with (security_invoker = true) as
select
  date_trunc('week', now())::date as week_start,
  extract(week from now())::int    as week_number,
  extract(year from now())::int    as year;

create or replace view report_submission_summary with (security_invoker = true) as
select
  wr.week_start,
  wr.week_number,
  wr.year,
  count(*)                                              as total_companies,
  count(*) filter (where wr.status != 'draft')          as submitted_count,
  count(*) filter (where wr.status = 'submitted')       as awaiting_review,
  count(*) filter (where wr.status = 'flagged')         as flagged_count,
  count(*) filter (where wr.status = 'reviewed')        as reviewed_count
from weekly_reports wr
group by wr.week_start, wr.week_number, wr.year;

-- ===== RLS helpers =====

-- security definer functions MUST pin search_path and schema-qualify table
-- refs: when invoked under roles like supabase_auth_admin (whose search_path
-- excludes public) an unqualified `profiles` would resolve to nothing and fail.
create or replace function get_my_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function get_my_company_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function is_admin_or_office()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_my_role() in ('church_admin', 'church_office');
$$;

-- ===== RLS: profiles =====

alter table profiles enable row level security;

create policy "profiles_select" on profiles
  for select to authenticated using (true);

create policy "profiles_update_own" on profiles
  for update to authenticated using (auth.uid() = id);

create policy "profiles_update_admin" on profiles
  for update to authenticated using (is_admin_or_office());

-- ===== RLS: companies =====

alter table companies enable row level security;

create policy "companies_select" on companies
  for select to authenticated using (true);

create policy "companies_insert" on companies
  for insert to authenticated with check (is_admin_or_office());

create policy "companies_update" on companies
  for update to authenticated using (is_admin_or_office());

create policy "companies_delete" on companies
  for delete to authenticated using (get_my_role() = 'church_admin');

-- ===== RLS: members =====

alter table members enable row level security;

create policy "members_select" on members
  for select to authenticated using (
    is_admin_or_office()
    or company_id = get_my_company_id()
  );

-- Admin/office add to any company; a leader may add to their own company only.
-- Removal/deactivation (update) stays admin/office.
create policy "members_insert" on members
  for insert to authenticated with check (
    is_admin_or_office()
    or company_id = get_my_company_id()
  );

create policy "members_update" on members
  for update to authenticated using (is_admin_or_office());

create policy "members_delete" on members
  for delete to authenticated using (is_admin_or_office());

-- ===== RLS: weekly_reports =====

alter table weekly_reports enable row level security;

create policy "reports_select" on weekly_reports
  for select to authenticated using (
    is_admin_or_office()
    or company_id = get_my_company_id()
  );

create policy "reports_insert" on weekly_reports
  for insert to authenticated with check (
    company_id = get_my_company_id()
    or is_admin_or_office()
  );

-- Leaders may edit their own company's draft AND submit it (draft -> submitted).
-- USING gates which existing rows they may act on; WITH CHECK gates the result
-- row. Without an explicit WITH CHECK, Postgres reuses USING for it, which would
-- reject the draft->submitted transition. Reviewed/flagged stay admin-only.
create policy "reports_update" on weekly_reports
  for update to authenticated
  using (
    is_admin_or_office()
    or (company_id = get_my_company_id() and status = 'draft')
  )
  with check (
    is_admin_or_office()
    or (company_id = get_my_company_id() and status in ('draft', 'submitted'))
  );

-- ===== RLS: attendance_records =====

alter table attendance_records enable row level security;

create policy "attendance_select" on attendance_records
  for select to authenticated using (
    is_admin_or_office()
    or exists (
      select 1 from weekly_reports r
      where r.id = report_id and r.company_id = get_my_company_id()
    )
  );

create policy "attendance_insert" on attendance_records
  for insert to authenticated with check (
    is_admin_or_office()
    or exists (
      select 1 from weekly_reports r
      where r.id = report_id and r.company_id = get_my_company_id()
    )
  );

create policy "attendance_update" on attendance_records
  for update to authenticated using (
    is_admin_or_office()
    or exists (
      select 1 from weekly_reports r
      where r.id = report_id
        and r.company_id = get_my_company_id()
        and r.status = 'draft'
    )
  );

-- ===== RLS: follow_up_cases =====

alter table follow_up_cases enable row level security;

create policy "followup_select" on follow_up_cases
  for select to authenticated using (
    is_admin_or_office()
    or assigned_to = auth.uid()
  );

create policy "followup_insert" on follow_up_cases
  for insert to authenticated with check (is_admin_or_office());

create policy "followup_update" on follow_up_cases
  for update to authenticated using (
    is_admin_or_office()
    or assigned_to = auth.uid()
  );

-- ===== RLS: follow_up_contacts =====

alter table follow_up_contacts enable row level security;

create policy "contacts_select" on follow_up_contacts
  for select to authenticated using (
    is_admin_or_office()
    or recorded_by = auth.uid()
    or exists (
      select 1 from follow_up_cases c
      where c.id = case_id and c.assigned_to = auth.uid()
    )
  );

create policy "contacts_insert" on follow_up_contacts
  for insert to authenticated with check (
    recorded_by = auth.uid()
    and exists (
      select 1 from follow_up_cases c
      where c.id = case_id
        and (c.assigned_to = auth.uid() or is_admin_or_office())
    )
  );

-- ===== RLS: tasks =====

alter table tasks enable row level security;

create policy "tasks_select" on tasks
  for select to authenticated using (
    is_admin_or_office()
    or created_by = auth.uid()
    or assigned_to = auth.uid()
  );

create policy "tasks_insert" on tasks
  for insert to authenticated with check (created_by = auth.uid());

create policy "tasks_update" on tasks
  for update to authenticated using (
    is_admin_or_office()
    or created_by = auth.uid()
    or assigned_to = auth.uid()
  );

create policy "tasks_delete" on tasks
  for delete to authenticated using (
    get_my_role() = 'church_admin'
    or created_by = auth.uid()
  );

-- ===== RLS: announcements =====

alter table announcements enable row level security;

create policy "announcements_select" on announcements
  for select to authenticated using (
    active = true
    and (
      audience = 'all'
      or (audience = 'leaders' and get_my_role() in ('company_leader','assistant_leader','church_admin','church_office'))
      or (audience = 'admins' and is_admin_or_office())
    )
  );

create policy "announcements_insert" on announcements
  for insert to authenticated with check (get_my_role() = 'church_admin');

create policy "announcements_update" on announcements
  for update to authenticated using (get_my_role() = 'church_admin');

-- ===== RLS: events =====

alter table events enable row level security;

create policy "events_select" on events
  for select to authenticated using (
    audience = 'all'
    or (audience = 'leaders' and get_my_role() in ('company_leader','assistant_leader','church_admin','church_office'))
    or (audience = 'admins' and is_admin_or_office())
  );

create policy "events_insert" on events
  for insert to authenticated with check (get_my_role() = 'church_admin');

create policy "events_update" on events
  for update to authenticated using (get_my_role() = 'church_admin');

create policy "events_delete" on events
  for delete to authenticated using (get_my_role() = 'church_admin');

-- ===== Triggers =====

-- 1. Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'company_leader')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. Auto-create follow-up cases on report submission
create or replace function handle_report_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only fire when status changes to 'submitted'
  if new.status = 'submitted' and old.status = 'draft' then
    -- Each absentee case defaults to the submitting company's leader, and carries
    -- the absence reason the leader gave.
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
      -- don't duplicate if an open case already exists for this member this week
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

create trigger on_report_submitted
  after update on weekly_reports
  for each row execute procedure handle_report_submitted();

-- 3. updated_at auto-maintenance
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger touch_profiles          before update on profiles           for each row execute procedure touch_updated_at();
create trigger touch_members           before update on members            for each row execute procedure touch_updated_at();
create trigger touch_weekly_reports    before update on weekly_reports     for each row execute procedure touch_updated_at();
create trigger touch_attendance        before update on attendance_records for each row execute procedure touch_updated_at();
create trigger touch_follow_up_cases   before update on follow_up_cases    for each row execute procedure touch_updated_at();
create trigger touch_tasks             before update on tasks              for each row execute procedure touch_updated_at();
