-- Company leaders manage their OWN company's roster: add, edit (name/phone) and
-- remove. Previously members_update was admin/office only, which silently broke
-- the phone-edit control already shown to leaders.
--
-- The WITH CHECK is essential: without it a leader could move a member into
-- another company (or pull one out of it) by changing company_id.

drop policy if exists "members_update" on members;
create policy "members_update" on members
  for update to authenticated
  using (
    is_admin_or_office()
    or company_id = get_my_company_id()
  )
  with check (
    is_admin_or_office()
    or company_id = get_my_company_id()
  );

-- Removal stays a soft delete (status = 'inactive') so attendance history and
-- past follow-up cases are preserved; hard delete remains admin/office only.
