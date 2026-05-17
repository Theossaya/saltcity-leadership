-- Day 9 Afternoon task creation grants and RLS policy.
-- Run this file after 001_initial_schema.sql through 011_announcement_create_grants.sql.
--
-- This enables active church admins and super admins to create leadership
-- tasks for their own church through the authenticated Supabase API.
-- It does not grant update or delete access.

grant insert on table public.tasks to authenticated;

drop policy if exists "tasks_admin_manage" on public.tasks;
drop policy if exists "tasks_admin_select_all" on public.tasks;
drop policy if exists "tasks_admin_insert" on public.tasks;
drop policy if exists "tasks_insert_admin" on public.tasks;

create policy "tasks_admin_select_all"
on public.tasks for select
using (
  public.current_user_has_role(
    church_id,
    array['super_admin', 'church_admin']
  )
);

create policy "tasks_admin_insert"
on public.tasks for insert
with check (
  auth.role() = 'authenticated'
  and created_by = auth.uid()
  and btrim(title) <> ''
  and status = 'todo'
  and priority in ('low', 'normal', 'high', 'urgent')
  and (due_date is null or due_date >= (timezone('Africa/Lagos', now())::date - 30))
  and public.current_user_has_role(
    church_id,
    array['super_admin', 'church_admin']
  )
  and (
    assigned_to is null
    or exists (
      select 1
      from public.church_memberships cm
      where cm.church_id = tasks.church_id
        and cm.user_id = tasks.assigned_to
        and cm.status = 'active'
    )
  )
  and (
    follow_up_case_id is null
    or exists (
      select 1
      from public.follow_up_cases fuc
      where fuc.id = tasks.follow_up_case_id
        and fuc.church_id = tasks.church_id
    )
  )
  and (
    follow_up_case_id is null
    or linked_entity_type is null
    or linked_entity_type <> 'company'
    or exists (
      select 1
      from public.follow_up_cases fuc
      where fuc.id = tasks.follow_up_case_id
        and fuc.church_id = tasks.church_id
        and fuc.company_id = tasks.linked_entity_id
    )
  )
  and (
    (
      linked_entity_type is null
      and linked_entity_id is null
    )
    or (
      linked_entity_type = 'company'
      and linked_entity_id is not null
      and exists (
        select 1
        from public.companies c
        where c.id = tasks.linked_entity_id
          and c.church_id = tasks.church_id
          and c.status = 'active'
      )
    )
  )
);
