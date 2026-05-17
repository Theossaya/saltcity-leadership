-- Day 9 Morning announcement creation grants and RLS policy.
-- Run this file after 001_initial_schema.sql through 010_demo_data.sql.
--
-- This enables active church admins and super admins to create plain-text
-- announcements for their own church through the authenticated Supabase API.
-- It does not grant update or delete access.

grant insert on table public.announcements to authenticated;

drop policy if exists "announcements_admin_manage" on public.announcements;
drop policy if exists "announcements_admin_select_all" on public.announcements;
drop policy if exists "announcements_admin_insert" on public.announcements;

create policy "announcements_admin_select_all"
on public.announcements for select
using (
  public.current_user_has_role(
    church_id,
    array['super_admin', 'church_admin']
  )
);

create policy "announcements_admin_insert"
on public.announcements for insert
with check (
  auth.role() = 'authenticated'
  and created_by = auth.uid()
  and btrim(title) <> ''
  and btrim(message) <> ''
  and (expires_at is null or expires_at > now())
  and public.current_user_has_role(
    church_id,
    array['super_admin', 'church_admin']
  )
  and (
    (
      audience_type = 'all_leaders'
      and audience_company_id is null
      and audience_unit_id is null
      and audience_role is null
    )
    or (
      audience_type = 'company'
      and audience_company_id is not null
      and audience_unit_id is null
      and audience_role is null
      and exists (
        select 1
        from public.companies c
        where c.id = audience_company_id
          and c.church_id = announcements.church_id
      )
    )
    or (
      audience_type = 'unit'
      and audience_company_id is null
      and audience_unit_id is not null
      and audience_role is null
      and exists (
        select 1
        from public.units u
        where u.id = audience_unit_id
          and u.church_id = announcements.church_id
      )
    )
    or (
      audience_type = 'role'
      and audience_company_id is null
      and audience_unit_id is null
      and audience_role in (
        'super_admin',
        'church_admin',
        'company_leader',
        'assistant_leader',
        'unit_leader',
        'general_leader'
      )
    )
  )
);
