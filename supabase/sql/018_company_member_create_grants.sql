-- Day 12 Afternoon company member creation grants and RLS policy.
-- Run this file after 001_initial_schema.sql through
-- 017_report_review_grants.sql.
--
-- This enables active church admins and super admins to add active company
-- members for active companies in their own church through the authenticated
-- Supabase API. It does not grant update access, delete access, status
-- management, Supabase Auth user creation, or service_role behavior.

grant insert on table public.company_members to authenticated;

drop policy if exists "company_members_admin_manage" on public.company_members;
drop policy if exists "company_members_admin_insert" on public.company_members;
drop policy if exists "company_members_insert_admin" on public.company_members;
drop policy if exists "company_members_admin_create" on public.company_members;

create policy "company_members_admin_create"
on public.company_members for insert
with check (
  auth.role() = 'authenticated'
  and public.current_user_has_role(
    church_id,
    array['super_admin', 'church_admin']
  )
  and btrim(full_name) <> ''
  and status = 'active'
  and exists (
    select 1
    from public.companies c
    where c.id = company_members.company_id
      and c.church_id = company_members.church_id
      and c.status = 'active'
  )
);
