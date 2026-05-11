-- Day 1 Afternoon RLS policy draft for the church leadership operations MVP.
-- Review in a Supabase branch before applying to production.

create or replace function public.current_user_has_role(
  target_church_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.church_memberships cm
    where cm.church_id = target_church_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role = any(allowed_roles)
  );
$$;

create or replace function public.current_user_company_ids(target_church_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from public.companies c
  where c.church_id = target_church_id
    and (c.leader_id = auth.uid() or c.assistant_leader_id = auth.uid());
$$;

create or replace function public.current_user_is_company_leader(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies c
    where c.id = target_company_id
      and (c.leader_id = auth.uid() or c.assistant_leader_id = auth.uid())
  );
$$;

create or replace function public.current_user_is_unit_leader(target_unit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.units u
    where u.id = target_unit_id
      and u.leader_id = auth.uid()
  );
$$;

create or replace function public.current_user_can_read_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = target_profile_id
    or exists (
      select 1
      from public.church_memberships viewer
      join public.church_memberships target
        on target.church_id = viewer.church_id
      where viewer.user_id = auth.uid()
        and viewer.status = 'active'
        and target.user_id = target_profile_id
        and target.status = 'active'
    );
$$;

create or replace function public.current_user_can_read_announcement(target_announcement_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.announcements a
    where a.id = target_announcement_id
      and (a.expires_at is null or a.expires_at > now())
      and (
        public.current_user_has_role(
          a.church_id,
          array['super_admin', 'church_admin']
        )
        or (
          a.audience_type = 'all_leaders'
          and public.current_user_has_role(
            a.church_id,
            array[
              'company_leader',
              'assistant_leader',
              'unit_leader',
              'general_leader',
              'church_admin',
              'super_admin'
            ]
          )
        )
        or (
          a.audience_type = 'role'
          and a.audience_role is not null
          and public.current_user_has_role(a.church_id, array[a.audience_role])
        )
        or (
          a.audience_type = 'company'
          and a.audience_company_id in (
            select * from public.current_user_company_ids(a.church_id)
          )
        )
        or (
          a.audience_type = 'unit'
          and a.audience_unit_id is not null
          and public.current_user_is_unit_leader(a.audience_unit_id)
        )
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.churches enable row level security;
alter table public.church_memberships enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.units enable row level security;
alter table public.unit_members enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.absentee_records enable row level security;
alter table public.follow_up_cases enable row level security;
alter table public.tasks enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;
alter table public.events enable row level security;
alter table public.event_checklist_items enable row level security;
alter table public.documents enable row level security;

create policy "profiles_select_accessible"
on public.profiles for select
using (public.current_user_can_read_profile(id));

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert
with check (id = auth.uid());

create policy "churches_select_members"
on public.churches for select
using (
  public.current_user_has_role(
    id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
);

create policy "churches_admin_manage"
on public.churches for update
using (public.current_user_has_role(id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(id, array['super_admin', 'church_admin']));

create policy "church_memberships_select_members_or_admin"
on public.church_memberships for select
using (
  user_id = auth.uid()
  or public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
);

create policy "church_memberships_admin_manage"
on public.church_memberships for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "companies_select_admin_or_assigned_leader"
on public.companies for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or id in (select * from public.current_user_company_ids(church_id))
);

create policy "companies_admin_manage"
on public.companies for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "company_members_select_admin_or_company_leader"
on public.company_members for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or company_id in (select * from public.current_user_company_ids(church_id))
);

create policy "company_members_admin_manage"
on public.company_members for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "units_select_admin_or_unit_leader"
on public.units for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or leader_id = auth.uid()
);

create policy "units_admin_manage"
on public.units for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "unit_members_select_admin_or_unit_leader"
on public.unit_members for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or public.current_user_is_unit_leader(unit_id)
  or profile_id = auth.uid()
);

create policy "unit_members_admin_manage"
on public.unit_members for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "weekly_reports_select_admin_or_company_leader"
on public.weekly_reports for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or company_id in (select * from public.current_user_company_ids(church_id))
);

create policy "weekly_reports_company_leaders_insert"
on public.weekly_reports for insert
with check (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or company_id in (select * from public.current_user_company_ids(church_id))
);

create policy "weekly_reports_company_leaders_update_drafts"
on public.weekly_reports for update
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or (
    company_id in (select * from public.current_user_company_ids(church_id))
    and status in ('not_started', 'draft', 'flagged')
  )
)
with check (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or company_id in (select * from public.current_user_company_ids(church_id))
);

create policy "absentee_records_select_admin_or_company_leader"
on public.absentee_records for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or company_id in (select * from public.current_user_company_ids(church_id))
);

create policy "absentee_records_company_leaders_insert"
on public.absentee_records for insert
with check (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or company_id in (select * from public.current_user_company_ids(church_id))
);

create policy "absentee_records_company_leaders_update"
on public.absentee_records for update
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or company_id in (select * from public.current_user_company_ids(church_id))
)
with check (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or company_id in (select * from public.current_user_company_ids(church_id))
);

create policy "follow_up_cases_select_restricted"
on public.follow_up_cases for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or assigned_to = auth.uid()
  or company_id in (select * from public.current_user_company_ids(church_id))
);

create policy "follow_up_cases_admin_manage"
on public.follow_up_cases for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "follow_up_cases_assigned_update_limited"
on public.follow_up_cases for update
using (assigned_to = auth.uid())
with check (assigned_to = auth.uid());

-- TODO: tighten column-level update permissions for assigned follow-up users in application code
-- or with dedicated RPCs so they can update notes/contact status without reassigning cases.

create policy "tasks_select_admin_or_assigned_or_creator"
on public.tasks for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or assigned_to = auth.uid()
  or created_by = auth.uid()
);

create policy "tasks_admin_manage"
on public.tasks for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "tasks_assigned_update"
on public.tasks for update
using (assigned_to = auth.uid())
with check (assigned_to = auth.uid());

create policy "announcements_select_targeted"
on public.announcements for select
using (public.current_user_can_read_announcement(id));

create policy "announcements_admin_manage"
on public.announcements for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "announcement_reads_select_own_or_admin"
on public.announcement_reads for select
using (
  user_id = auth.uid()
  or public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
);

create policy "announcement_reads_insert_own"
on public.announcement_reads for insert
with check (
  user_id = auth.uid()
  and public.current_user_can_read_announcement(announcement_id)
);

create policy "announcement_reads_update_own"
on public.announcement_reads for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "events_select_admin_or_leaders"
on public.events for select
using (
  public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
);

create policy "events_admin_manage"
on public.events for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "event_checklist_items_select_admin_or_assigned"
on public.event_checklist_items for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or assigned_to = auth.uid()
);

create policy "event_checklist_items_admin_manage"
on public.event_checklist_items for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

create policy "event_checklist_items_assigned_update"
on public.event_checklist_items for update
using (assigned_to = auth.uid())
with check (assigned_to = auth.uid());

create policy "documents_select_visible"
on public.documents for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
  or visibility = 'all_leaders'
  or (
    visibility = 'company'
    and company_id in (select * from public.current_user_company_ids(church_id))
  )
  or (
    visibility = 'unit'
    and unit_id is not null
    and public.current_user_is_unit_leader(unit_id)
  )
  or (
    visibility = 'role'
    and role is not null
    and public.current_user_has_role(church_id, array[role])
  )
);

create policy "documents_admin_manage"
on public.documents for all
using (public.current_user_has_role(church_id, array['super_admin', 'church_admin']))
with check (public.current_user_has_role(church_id, array['super_admin', 'church_admin']));

-- TODO: consider separate RPCs for creating reports and follow-up cases once the app flow is implemented.
-- That would keep cross-table consistency checks out of client-side writes.
