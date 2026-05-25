-- Phase 14A role-based QA and permission sanity pass.
-- Run this file after 001_initial_schema.sql through
-- 019_follow_up_case_insert_rls_recursion_fix.sql have been applied.
--
-- The app UI now treats follow-up case work as assigned-only for company
-- leaders and general leaders. Older RLS still let company leaders read every
-- follow-up case for their assigned company through the API. Keep admins
-- church-wide and rely on the assigned active/resolved SELECT policies for
-- non-admin leader follow-up visibility.

drop policy if exists "follow_up_cases_select_restricted"
on public.follow_up_cases;

create policy "follow_up_cases_select_restricted"
on public.follow_up_cases for select
using (
  public.current_user_has_role(church_id, array['super_admin', 'church_admin'])
);
