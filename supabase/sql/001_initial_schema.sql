-- Day 1 Afternoon initial schema draft for the church leadership operations MVP.
-- This file is intended for review before being applied to any Supabase project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.church_memberships (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (
    role in (
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    )
  ),
  status text not null default 'active' check (status in ('active', 'inactive', 'invited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (church_id, user_id, role)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  name text not null,
  leader_id uuid references public.profiles(id) on delete set null,
  assistant_leader_id uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, church_id)
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, church_id, company_id),
  foreign key (company_id, church_id)
    references public.companies(id, church_id)
    on delete cascade
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  name text not null,
  leader_id uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, church_id)
);

create table public.unit_members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text,
  role_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (profile_id is not null or full_name is not null),
  foreign key (unit_id, church_id)
    references public.units(id, church_id)
    on delete cascade
);

create table public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  report_week_start date not null,
  report_week_end date not null,
  total_members integer not null default 0 check (total_members >= 0),
  present_count integer not null default 0 check (present_count >= 0),
  absent_count integer not null default 0 check (absent_count >= 0),
  new_visitors_count integer not null default 0 check (new_visitors_count >= 0),
  testimonies text,
  support_needed text,
  general_notes text,
  status text not null default 'draft' check (
    status in ('not_started', 'draft', 'submitted', 'reviewed', 'flagged')
  ),
  submitted_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, church_id),
  unique (id, church_id, company_id),
  unique (company_id, report_week_start),
  foreign key (company_id, church_id)
    references public.companies(id, church_id)
    on delete cascade,
  check (report_week_end >= report_week_start)
);

create table public.absentee_records (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  weekly_report_id uuid not null references public.weekly_reports(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  company_member_id uuid not null references public.company_members(id) on delete cascade,
  absence_date date not null,
  reason text not null default 'no_reason_given' check (
    reason in (
      'no_reason_given',
      'illness',
      'travel',
      'work',
      'school',
      'family_issue',
      'bereavement',
      'other'
    )
  ),
  reason_note text,
  streak_count integer not null default 1 check (streak_count >= 1),
  follow_up_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, church_id),
  unique (id, church_id, company_id, company_member_id),
  unique (weekly_report_id, company_member_id),
  foreign key (weekly_report_id, church_id, company_id)
    references public.weekly_reports(id, church_id, company_id)
    on delete cascade,
  foreign key (company_member_id, church_id, company_id)
    references public.company_members(id, church_id, company_id)
    on delete cascade
);

create table public.follow_up_cases (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  company_member_id uuid not null references public.company_members(id) on delete cascade,
  absentee_record_id uuid references public.absentee_records(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (
    status in ('open', 'assigned', 'contacted', 'resolved', 'escalated')
  ),
  next_action text,
  notes text,
  date_contacted date,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, church_id),
  foreign key (company_id, church_id)
    references public.companies(id, church_id)
    on delete cascade,
  foreign key (company_member_id, church_id, company_id)
    references public.company_members(id, church_id, company_id)
    on delete cascade,
  foreign key (absentee_record_id, church_id, company_id, company_member_id)
    references public.absentee_records(id, church_id, company_id, company_member_id)
    on delete set null (absentee_record_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  due_date date,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done')),
  follow_up_case_id uuid references public.follow_up_cases(id) on delete set null,
  linked_entity_type text,
  linked_entity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (follow_up_case_id, church_id)
    references public.follow_up_cases(id, church_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  message text not null,
  audience_type text not null default 'all_leaders' check (
    audience_type in ('all_leaders', 'company', 'unit', 'role')
  ),
  audience_company_id uuid references public.companies(id) on delete cascade,
  audience_unit_id uuid references public.units(id) on delete cascade,
  audience_role text check (
    audience_role is null or audience_role in (
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    )
  ),
  is_urgent boolean not null default false,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (audience_type = 'all_leaders'
      and audience_company_id is null
      and audience_unit_id is null
      and audience_role is null)
    or (audience_type = 'company'
      and audience_company_id is not null
      and audience_unit_id is null
      and audience_role is null)
    or (audience_type = 'unit'
      and audience_company_id is null
      and audience_unit_id is not null
      and audience_role is null)
    or (audience_type = 'role'
      and audience_company_id is null
      and audience_unit_id is null
      and audience_role is not null)
  )
);

create table public.announcement_reads (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz,
  unique (announcement_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  status text not null default 'planning' check (
    status in ('planning', 'ready', 'completed', 'cancelled')
  ),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create table public.event_checklist_items (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  category text not null,
  file_path text not null,
  visibility text not null default 'all_leaders' check (
    visibility in ('all_leaders', 'admin_only', 'company', 'unit', 'role')
  ),
  company_id uuid references public.companies(id) on delete cascade,
  unit_id uuid references public.units(id) on delete cascade,
  role text check (
    role is null or role in (
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    )
  ),
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (visibility in ('all_leaders', 'admin_only')
      and company_id is null
      and unit_id is null
      and role is null)
    or (visibility = 'company'
      and company_id is not null
      and unit_id is null
      and role is null)
    or (visibility = 'unit'
      and company_id is null
      and unit_id is not null
      and role is null)
    or (visibility = 'role'
      and company_id is null
      and unit_id is null
      and role is not null)
  )
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_churches_updated_at
before update on public.churches
for each row execute function public.set_updated_at();

create trigger set_church_memberships_updated_at
before update on public.church_memberships
for each row execute function public.set_updated_at();

create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger set_company_members_updated_at
before update on public.company_members
for each row execute function public.set_updated_at();

create trigger set_units_updated_at
before update on public.units
for each row execute function public.set_updated_at();

create trigger set_unit_members_updated_at
before update on public.unit_members
for each row execute function public.set_updated_at();

create trigger set_weekly_reports_updated_at
before update on public.weekly_reports
for each row execute function public.set_updated_at();

create trigger set_absentee_records_updated_at
before update on public.absentee_records
for each row execute function public.set_updated_at();

create trigger set_follow_up_cases_updated_at
before update on public.follow_up_cases
for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger set_announcements_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger set_event_checklist_items_updated_at
before update on public.event_checklist_items
for each row execute function public.set_updated_at();

create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create index idx_church_memberships_church_id on public.church_memberships(church_id);
create index idx_church_memberships_user_id on public.church_memberships(user_id);
create index idx_church_memberships_role_status on public.church_memberships(role, status);

create index idx_companies_church_id on public.companies(church_id);
create index idx_companies_leader_id on public.companies(leader_id);
create index idx_companies_assistant_leader_id on public.companies(assistant_leader_id);
create index idx_companies_status on public.companies(status);

create index idx_company_members_church_id on public.company_members(church_id);
create index idx_company_members_company_id on public.company_members(company_id);
create index idx_company_members_status on public.company_members(status);

create index idx_units_church_id on public.units(church_id);
create index idx_units_leader_id on public.units(leader_id);
create index idx_units_status on public.units(status);

create index idx_unit_members_church_id on public.unit_members(church_id);
create index idx_unit_members_unit_id on public.unit_members(unit_id);
create index idx_unit_members_profile_id on public.unit_members(profile_id);

create index idx_weekly_reports_church_id on public.weekly_reports(church_id);
create index idx_weekly_reports_company_id on public.weekly_reports(company_id);
create index idx_weekly_reports_status on public.weekly_reports(status);
create index idx_weekly_reports_created_at on public.weekly_reports(created_at desc);

create index idx_absentee_records_church_id on public.absentee_records(church_id);
create index idx_absentee_records_weekly_report_id on public.absentee_records(weekly_report_id);
create index idx_absentee_records_company_id on public.absentee_records(company_id);
create index idx_absentee_records_company_member_id on public.absentee_records(company_member_id);
create index idx_absentee_records_follow_up_required on public.absentee_records(follow_up_required);
create index idx_absentee_records_created_at on public.absentee_records(created_at desc);

create index idx_follow_up_cases_church_id on public.follow_up_cases(church_id);
create index idx_follow_up_cases_company_id on public.follow_up_cases(company_id);
create index idx_follow_up_cases_company_member_id on public.follow_up_cases(company_member_id);
create index idx_follow_up_cases_assigned_to on public.follow_up_cases(assigned_to);
create index idx_follow_up_cases_status on public.follow_up_cases(status);
create index idx_follow_up_cases_created_at on public.follow_up_cases(created_at desc);

create index idx_tasks_church_id on public.tasks(church_id);
create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_tasks_created_by on public.tasks(created_by);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_created_at on public.tasks(created_at desc);
create index idx_tasks_follow_up_case_id on public.tasks(follow_up_case_id);
create index idx_tasks_linked_entity on public.tasks(linked_entity_type, linked_entity_id);

create index idx_announcements_church_id on public.announcements(church_id);
create index idx_announcements_audience_company_id on public.announcements(audience_company_id);
create index idx_announcements_audience_unit_id on public.announcements(audience_unit_id);
create index idx_announcements_audience_role on public.announcements(audience_role);
create index idx_announcements_created_at on public.announcements(created_at desc);

create index idx_announcement_reads_church_id on public.announcement_reads(church_id);
create index idx_announcement_reads_user_id on public.announcement_reads(user_id);
create index idx_announcement_reads_announcement_id on public.announcement_reads(announcement_id);

create index idx_events_church_id on public.events(church_id);
create index idx_events_status on public.events(status);
create index idx_events_starts_at on public.events(starts_at);
create index idx_events_created_at on public.events(created_at desc);

create index idx_event_checklist_items_church_id on public.event_checklist_items(church_id);
create index idx_event_checklist_items_event_id on public.event_checklist_items(event_id);
create index idx_event_checklist_items_assigned_to on public.event_checklist_items(assigned_to);

create index idx_documents_church_id on public.documents(church_id);
create index idx_documents_visibility on public.documents(visibility);
create index idx_documents_company_id on public.documents(company_id);
create index idx_documents_unit_id on public.documents(unit_id);
create index idx_documents_role on public.documents(role);
create index idx_documents_created_at on public.documents(created_at desc);
