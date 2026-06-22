-- Product changes:
--  1. Remove the weekly "visitor count" — a fixed-roster company system tracks
--     members, not anonymous visitors. Leaders add real newcomers instead.
--  2. Allow company leaders to add members to their OWN company. Removal stays
--     with admin/office (members_update/delete unchanged).
-- Idempotent and safe on a live DB (the column holds no meaningful data).

alter table weekly_reports drop column if exists visitor_count;

drop policy if exists "members_insert" on members;
create policy "members_insert" on members
  for insert to authenticated with check (
    is_admin_or_office()
    or company_id = get_my_company_id()
  );
