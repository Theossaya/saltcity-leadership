-- Pre-launch teardown of all SAMPLE/TEST data.
-- Run in the Supabase SQL Editor only when you're ready to load real church data.
-- Keeps your admin account (favoureric59@gmail.com).
--
-- Order matters: deleting a company cascades to its members, weekly_reports,
-- attendance_records, follow_up_cases and follow_up_contacts. That removes the
-- report the test leader submitted, which is the only thing blocking the leader's
-- deletion (weekly_reports.submitted_by has no ON DELETE rule = restrict).

-- 1. Sample companies -> cascades members, reports, attendance, cases, contacts
delete from companies
where id in (
  '11111111-0000-0000-0000-000000000001',  -- Company Alpha
  '11111111-0000-0000-0000-000000000002'   -- Company Beta
);

-- 2. Any test tasks / announcements / events you created while trying things out
--    (uncomment if needed — these reference profiles and would block user deletes)
-- delete from tasks         where title ilike '%test%';
-- delete from announcements where title ilike '%test%';
-- delete from events        where title ilike '%test%';

-- 3. The throwaway test-leader auth user (now unblocked). Cascades its profile row.
delete from auth.users where email = 'leader@saltcity.church';

-- Your church_admin account is intentionally left in place.
