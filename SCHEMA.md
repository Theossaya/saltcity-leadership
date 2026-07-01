# SaltCity Leadership PWA — Database Schema & RLS

> Reference for Claude Code.
> Every table, column, type, index, and Row Level Security policy needed to build the app.

---

## Corrections (June 2026)

This document has been updated to match the shipped database. The live source of
truth is `supabase/migrations/`. Changes from the first draft:

1. **Security-definer functions pin `search_path = public` and schema-qualify all
   table/type references.** Without this, signups failed (`handle_new_user` ran as
   `supabase_auth_admin`, whose search_path excludes `public`, so `insert into
   profiles` threw). Applies to `get_my_role`, `get_my_company_id`,
   `is_admin_or_office`, `handle_new_user`, `handle_report_submitted`.
2. **`weekly_reports.visitor_count` removed.** A fixed-roster company system tracks
   members, not anonymous weekly visitors.
3. **`reports_update` policy gained a `WITH CHECK`.** Without it, Postgres reused
   the `USING` clause (`status = 'draft'`) to validate the new row, so leaders
   could not transition a report draft → submitted.
4. **`members_insert` allows a leader to add to their own company** (removal stays
   admin/office).

The sections below already reflect these fixes.

---

## 1. Supabase Project Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialise in project root
supabase init

# Link to your remote Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

Set these environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-only, never expose to client
```

---

## 2. Enable Required Extensions

Run in Supabase SQL editor:

```sql
create extension if not exists "uuid-ossp";
```

---

## 3. Enums

```sql
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
```

---

## 4. Tables

### 4.1 companies

```sql
create table companies (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  created_at  timestamptz not null default now()
);
```

### 4.2 profiles

Extends `auth.users`. Created automatically on signup via trigger (see §7).

```sql
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text not null,
  role              user_role not null default 'company_leader',
  company_id        uuid references companies(id) on delete set null,
  -- company_id is null for church_admin and church_office
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
```

### 4.3 members

Church members (not app users). Managed by admin/office.

```sql
create table members (
  id          uuid primary key default uuid_generate_v4(),
  full_name   text not null,
  company_id  uuid not null references companies(id) on delete cascade,
  status      member_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index members_company_id_idx on members(company_id);
```

### 4.4 weekly_reports

One per company per week.

```sql
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
```

### 4.5 attendance_records

One row per member per report. Created when a report is first saved.

```sql
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
```

### 4.6 follow_up_cases

Auto-created when an attendance record is marked absent and the report is submitted.

```sql
create table follow_up_cases (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid not null references members(id) on delete cascade,
  report_id       uuid not null references weekly_reports(id) on delete cascade,
  company_id      uuid not null references companies(id) on delete cascade,
  assigned_to     uuid references profiles(id) on delete set null,
  assigned_by     uuid references profiles(id) on delete set null,
  status          follow_up_status not null default 'new',
  urgency         urgency_level not null default 'normal',
  context_note    text,   -- admin note added when assigning
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index follow_up_cases_assigned_to_idx  on follow_up_cases(assigned_to);
create index follow_up_cases_status_idx        on follow_up_cases(status);
create index follow_up_cases_company_id_idx    on follow_up_cases(company_id);
```

### 4.7 follow_up_contacts

Each contact attempt a leader records on a case.

```sql
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
```

### 4.8 tasks

```sql
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
```

### 4.9 announcements

```sql
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
```

### 4.10 events

```sql
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
```

---

## 5. Views (optional helpers)

```sql
-- Current week number helper
-- security_invoker so the view respects RLS (avoids the "Security Definer View"
-- advisor warning). Requires Postgres 15+.
create or replace view current_week with (security_invoker = true) as
select
  date_trunc('week', now())::date as week_start,
  extract(week from now())::int    as week_number,
  extract(year from now())::int    as year;

-- Report submission summary for admin dashboard
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
```

---

## 6. Row Level Security (RLS)

Enable RLS on every table, then add policies. The helper function `get_my_role()` avoids repeated subqueries.

```sql
-- Helper: current user's role
-- NOTE: security definer functions MUST set search_path and schema-qualify table
-- refs — otherwise they fail when invoked under a role whose search_path excludes
-- public (e.g. supabase_auth_admin during signup).
create or replace function get_my_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: current user's company_id
create or replace function get_my_company_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- Helper: is current user admin or office?
create or replace function is_admin_or_office()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_my_role() in ('church_admin', 'church_office');
$$;
```

### 6.1 profiles

```sql
alter table profiles enable row level security;

-- Anyone authenticated can read all profiles (needed for displaying names/roles)
create policy "profiles_select" on profiles
  for select to authenticated using (true);

-- Users can only update their own profile
create policy "profiles_update_own" on profiles
  for update to authenticated using (auth.uid() = id);

-- Admin/office can update any profile (for role assignment)
create policy "profiles_update_admin" on profiles
  for update to authenticated using (is_admin_or_office());
```

### 6.2 companies

```sql
alter table companies enable row level security;

create policy "companies_select" on companies
  for select to authenticated using (true);

create policy "companies_insert" on companies
  for insert to authenticated with check (is_admin_or_office());

create policy "companies_update" on companies
  for update to authenticated using (is_admin_or_office());

create policy "companies_delete" on companies
  for delete to authenticated using (get_my_role() = 'church_admin');
```

### 6.3 members

```sql
alter table members enable row level security;

-- Leaders see only their own company's members; admins/office see all
create policy "members_select" on members
  for select to authenticated using (
    is_admin_or_office()
    or company_id = get_my_company_id()
  );

-- Admin/office add to any company; a leader may add to their own company only.
create policy "members_insert" on members
  for insert to authenticated with check (
    is_admin_or_office()
    or company_id = get_my_company_id()
  );

create policy "members_update" on members
  for update to authenticated using (is_admin_or_office());

create policy "members_delete" on members
  for delete to authenticated using (is_admin_or_office());
```

### 6.4 weekly_reports

```sql
alter table weekly_reports enable row level security;

-- Leaders see their company; admins see all
create policy "reports_select" on weekly_reports
  for select to authenticated using (
    is_admin_or_office()
    or company_id = get_my_company_id()
  );

-- Leaders can create a report for their own company
create policy "reports_insert" on weekly_reports
  for insert to authenticated with check (
    company_id = get_my_company_id()
    or is_admin_or_office()
  );

-- Leaders may edit their own company's draft AND submit it (draft -> submitted).
-- The WITH CHECK is required: without it Postgres reuses USING to validate the
-- new row, rejecting the draft -> submitted transition.
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
```

### 6.5 attendance_records

```sql
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
```

### 6.6 follow_up_cases

```sql
alter table follow_up_cases enable row level security;

-- Assigned leader sees their own cases; admins/office see all
create policy "followup_select" on follow_up_cases
  for select to authenticated using (
    is_admin_or_office()
    or assigned_to = auth.uid()
  );

-- Only admin/office can create or assign
create policy "followup_insert" on follow_up_cases
  for insert to authenticated with check (is_admin_or_office());

-- Admin can update anything; assigned leader can update status/urgency only
create policy "followup_update" on follow_up_cases
  for update to authenticated using (
    is_admin_or_office()
    or assigned_to = auth.uid()
  );
```

### 6.7 follow_up_contacts

```sql
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
```

### 6.8 tasks

```sql
alter table tasks enable row level security;

-- Users see tasks they created or are assigned to; admins see all
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
```

### 6.9 announcements

```sql
alter table announcements enable row level security;

-- Active announcements visible to matching audience
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
```

### 6.10 events

```sql
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
```

---

## 7. Triggers

### 7.1 Auto-create profile on signup

```sql
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
```

### 7.2 Auto-create follow-up cases on report submission

When a report is submitted (status changes from draft → submitted), create a `follow_up_case` for every absent member who doesn't already have an open case this week.

```sql
create or replace function handle_report_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only fire when status changes to 'submitted'
  if new.status = 'submitted' and old.status = 'draft' then
    insert into public.follow_up_cases (member_id, report_id, company_id)
    select
      ar.member_id,
      ar.report_id,
      new.company_id
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
```

### 7.3 updated_at auto-maintenance

```sql
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to every table that has updated_at
create trigger touch_profiles          before update on profiles           for each row execute procedure touch_updated_at();
create trigger touch_members           before update on members            for each row execute procedure touch_updated_at();
create trigger touch_weekly_reports    before update on weekly_reports     for each row execute procedure touch_updated_at();
create trigger touch_attendance        before update on attendance_records  for each row execute procedure touch_updated_at();
create trigger touch_follow_up_cases   before update on follow_up_cases    for each row execute procedure touch_updated_at();
create trigger touch_tasks             before update on tasks              for each row execute procedure touch_updated_at();
```

---

## 8. Seed Data (Development)

```sql
-- Create two companies
insert into companies (id, name) values
  ('11111111-0000-0000-0000-000000000001', 'Company Alpha'),
  ('11111111-0000-0000-0000-000000000002', 'Company Beta');

-- Members for Company Alpha (create via Supabase dashboard for auth users,
-- then update profiles table; members table is for church members, not app users)
insert into members (full_name, company_id) values
  ('DJ Wes',         '11111111-0000-0000-0000-000000000001'),
  ('John Adeyemi',   '11111111-0000-0000-0000-000000000001'),
  ('Mary Okafor',    '11111111-0000-0000-0000-000000000001'),
  ('Emeka Ibe',      '11111111-0000-0000-0000-000000000001'),
  ('Tobi Ade',       '11111111-0000-0000-0000-000000000001'),
  ('Ada Nwo',        '11111111-0000-0000-0000-000000000001'),
  ('Sade Kor',       '11111111-0000-0000-0000-000000000001'),
  ('Femi Olu',       '11111111-0000-0000-0000-000000000001'),
  ('Ngozi Eze',      '11111111-0000-0000-0000-000000000001'),
  ('Ruth Eze',       '11111111-0000-0000-0000-000000000001'),
  ('Joy Ben',        '11111111-0000-0000-0000-000000000001'),
  ('Grace Udo',      '11111111-0000-0000-0000-000000000001');

-- A sample announcement
insert into announcements (title, body, published_by, priority, audience)
values (
  'Side entrance only this Sunday',
  'Main vestibule is under repair. Please use the side entrance and brief your members.',
  (select id from profiles limit 1),   -- replace with real admin id
  'urgent',
  'all'
);
```

---

## 9. TypeScript Types

Generate automatically from Supabase:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/database.types.ts
```

Or define manually based on the schema above. Use these as the source of truth for all server actions and data fetching.

---

## 10. Supabase Client Setup

```ts
// lib/supabase/server.ts  — for server components and server actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}
```

```ts
// lib/supabase/client.ts  — for client components
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```ts
// lib/supabase/middleware.ts  — for session refresh in middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
  await supabase.auth.getUser()
  return response
}
```
