-- Fix: leaders could not submit a report. The reports_update policy had only a
-- USING clause (status = 'draft'); with no explicit WITH CHECK, Postgres reuses
-- USING to validate the NEW row, so the draft -> submitted transition was
-- rejected (42501: new row violates row-level security policy).
--
-- Add a WITH CHECK that allows the leader's own company report to end up draft
-- or submitted. Reviewed/flagged remain admin-only (only is_admin_or_office can
-- produce those). Idempotent: drop + recreate. No data changes.

drop policy if exists "reports_update" on weekly_reports;

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
