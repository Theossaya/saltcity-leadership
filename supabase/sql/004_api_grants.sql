-- Day 1 Evening Supabase API grants for the church leadership operations MVP.
-- Run this file after 001_initial_schema.sql and 002_rls_policies.sql.
--
-- Supabase "Automatically expose new tables" was disabled for security, so
-- the authenticated API role needs explicit grants before Supabase client/API
-- reads can reach these tables. These grants expose table access to the API
-- role, but Row Level Security still decides which rows each user can see.
--
-- Never use service_role or other secret keys in the browser. Browser clients
-- must use the public anon key and rely on Auth, grants, and RLS.

grant usage on schema public to authenticated;

grant select on table
  public.profiles,
  public.churches,
  public.church_memberships,
  public.companies,
  public.company_members,
  public.units,
  public.unit_members,
  public.weekly_reports,
  public.absentee_records,
  public.follow_up_cases,
  public.tasks,
  public.announcements,
  public.announcement_reads,
  public.events,
  public.event_checklist_items,
  public.documents
to authenticated;
