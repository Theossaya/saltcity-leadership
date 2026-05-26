# Launch Checklist

Phase 14C audit scope: demo data, seed sanity, migration order, and launch readiness. This checklist is for Supabase/manual QA readiness before an MVP demo or pilot launch.

## SQL migration checklist

Run the files in filename order. Files marked "Yes" must be applied to Supabase for the current app behavior. `010_demo_data.sql` is dev/test only and should not be run in production.

| Order | File | What it does | Run in Supabase? | Dependency/order notes |
|---|---|---|---|---|
| 001 | `supabase/sql/001_initial_schema.sql` | Creates the MVP schema, constraints, indexes, timestamp trigger function, and tables for profiles, churches, memberships, companies, reports, absentees, follow-up, tasks, announcements, events, and documents. | Yes | First migration. Requires Supabase Auth schema to exist. |
| 002 | `supabase/sql/002_rls_policies.sql` | Enables RLS, creates role/company helper functions, and adds baseline read/write policies. | Yes | Run after `001`. Later migrations tighten several broad baseline policies. |
| 003 | `supabase/sql/003_seed_data.sql` | Seeds the base church, Alpha/Beta/Gamma companies, members, units, one announcement, one event, event checklist items, and one document placeholder. | Yes for demo/test; optional for production | Does not create Auth users. Profile/membership examples are comments only. |
| 004 | `supabase/sql/004_api_grants.sql` | Grants authenticated API access to read base tables while RLS controls row visibility. | Yes | Required when automatic table exposure is disabled. Run after `001` and `002`. |
| 005 | `supabase/sql/005_report_write_grants.sql` | Grants draft weekly report insert with strict current-week company leader RLS. | Yes | Run after `001`, `002`, and `004`. |
| 006 | `supabase/sql/006_report_draft_update_grants.sql` | Revokes broad weekly report update, grants draft-edit columns, and limits draft updates to assigned current-week leaders. | Yes | Run after `005`. |
| 007 | `supabase/sql/007_report_submit_grants.sql` | Grants submission columns and adds a trigger guard preventing report content mutation during submit. | Yes | Run after `006`. `009` replaces the submit policy with absentee reconciliation. |
| 008 | `supabase/sql/008_absentee_record_grants.sql` | Grants insert/delete for absentee records and limits them to current-week draft reports owned by assigned company leaders. | Yes | Run after `007`. |
| 009 | `supabase/sql/009_report_submit_absentee_reconciliation.sql` | Replaces submit RLS so submitted absent count must match linked absentee records. | Yes | Run after `008`; needed even if `007` was already applied earlier. |
| 010 | `supabase/sql/010_demo_data.sql` | Seeds richer rolling demo data: optional Auth-linked profiles, demo companies, members, events, announcements, reports, absentees, follow-up cases, and tasks. | Demo/test only | Run after `001` through `009`, and preferably after all grants through `020` for current QA. Safe to rerun where fixed IDs are used. Requires Auth users to exist only if account-linked rows should resolve. |
| 011 | `supabase/sql/011_announcement_create_grants.sql` | Adds admin-only announcement insert grant/policy and replaces broad announcement admin manage policy. | Yes | Run after `010` in the historical sequence. |
| 012 | `supabase/sql/012_task_create_grants.sql` | Adds admin-only task insert grant/policy and replaces broad task admin manage policy. | Yes | Run after `011`. |
| 013 | `supabase/sql/013_task_status_update_grants.sql` | Grants assigned leaders update access to `tasks.status` only. | Yes | Run after `012`. |
| 014 | `supabase/sql/014_follow_up_case_create_grants.sql` | Adds admin-only follow-up case creation from absentee records and a partial unique index for one active case per absentee. | Yes | Run after `013`. The INSERT policy is superseded by `019` to avoid recursion. |
| 015 | `supabase/sql/015_follow_up_case_status_update_grants.sql` | Grants safe follow-up progress updates for admins and assigned leaders, plus active assigned-case context visibility. | Yes | Run after `014`. Intentionally does not recreate recursive assigned-user `weekly_reports` policies. |
| 016 | `supabase/sql/016_follow_up_history_read_policies.sql` | Adds SELECT-only visibility for resolved follow-up history assigned to a leader and linked context. | Yes | Run after `015`. Intentionally avoids recursive `weekly_reports` assigned-user policy. |
| 017 | `supabase/sql/017_report_review_grants.sql` | Adds admin report review grant/policy, drops obsolete recursive weekly report policies, and guards report content during review. | Yes | Run after `016`. Confirms report review grants and follow-up RLS recursion cleanup. |
| 018 | `supabase/sql/018_company_member_create_grants.sql` | Adds admin-only company member insert grant/policy and removes broad member manage policy. | Yes | Run after `017`. Confirms company member creation grants. |
| 019 | `supabase/sql/019_follow_up_case_insert_rls_recursion_fix.sql` | Replaces recursive follow-up case INSERT checks with SECURITY DEFINER helpers and a church-scoped active-case unique index. | Yes | Run after `018`. Confirms follow-up RLS recursion cleanup. |
| 020 | `supabase/sql/020_follow_up_company_leader_visibility_tightening.sql` | Tightens follow-up case SELECT so non-admin leaders rely on assigned active/resolved policies instead of company-wide case visibility. | Yes | Run after `019`. Confirms company leader follow-up visibility tightening. |

Confirmed latest coverage:

- Follow-up RLS recursion cleanup: `017` drops obsolete weekly report policies and `019` removes recursive follow-up INSERT checks.
- Company leader follow-up visibility tightening: `020`.
- Report review grants: `017`.
- Company member creation grants: `018`.
- Task/follow-up/announcement grants: `011`, `012`, `013`, `014`, and `015`.

## Demo data sanity

Reviewed `supabase/sql/010_demo_data.sql`.

- Ownership: optional `admin@example.com` and `leader@example.com` links are derived from real `auth.users` rows. If those Auth users do not exist, profile/membership/assignee fields remain no-op or `null` instead of inventing impossible users.
- `leader@example.com`: assigned as a `company_leader` and linked to Company Alpha plus Company Epsilon Demo when the Auth user exists. This matches the submitted Epsilon demo report audit trail.
- Reports: rolling current `Africa/Lagos` week with fixed IDs. Demo reports are isolated to Delta/Epsilon demo companies so manual Alpha/Beta/Gamma report testing is not overwritten.
- Absentees: one absentee per seeded report/member conflict key; reruns update the same rows.
- Follow-up cases: one active assigned case and one resolved case. No duplicate active follow-up case was found in the seed.
- Events: use dates relative to the current Lagos date, so the events UI should not be empty after rerun.
- Announcements: expiry dates are relative to `now()` and should remain visible after rerun.
- Tasks: include actionable future/current tasks plus one completed task; they are not all stale or completed.

Manual seed expectations:

- Create Supabase Auth users for `admin@example.com` and `leader@example.com` before running `010_demo_data.sql` when testing real login flows.
- Run `010_demo_data.sql` again shortly before demo/QA so rolling dates, active announcements, events, and task due dates are fresh.
- Do not run `010_demo_data.sql` against production unless the production launch intentionally includes demo/test records.

## Test accounts checklist

Expected accounts:

| Account | Expected role | Expected company | Key pages to test |
|---|---|---|---|
| `admin@example.com` | `church_admin` | Church-wide admin; no single company required | Login, Dashboard, Reports review/flag, Follow-up assign/update/close, Tasks create/update, Announcements create, Companies member add, Events, More |
| `leader@example.com` | `company_leader` | Company Alpha for manual report QA; Company Epsilon Demo for seeded submitted-report audit trail | Login, Dashboard, Reports draft/submit/read-only, mark absent, Follow-up assigned update/close, Tasks update, Announcements, Events, Companies |

Recommended test accounts:

| Account | Expected role | Expected company | Why useful |
|---|---|---|---|
| `assistant@example.com` | `assistant_leader` | Company Alpha or Beta | Confirms assistant leader can use company report workflow where assigned. |
| `assigned@example.com` | `general_leader` or `unit_leader` | No company required | Confirms assigned follow-up visibility and assigned task visibility without company-wide data. |
| `outside@example.com` | Active leader in no assigned company, or inactive membership | None | Confirms unrelated reports, follow-up, and company data remain hidden. |

## Manual smoke test checklist

Auth and session:

- Log in as `admin@example.com`; confirm `/dashboard` loads the admin briefing and admin-visible pages stay scoped by role.
- Log out from the app chrome or `/more`; confirm the browser lands on `/login` and protected app pages no longer render as signed in.
- Log in as `leader@example.com` in the same browser session after admin logout; confirm the dashboard, navigation context, reports, follow-up, tasks, and companies views show leader-scoped content rather than stale admin UI.
- While signed out, open `/dashboard`, `/reports`, `/follow-up`, `/tasks`, `/announcements`, `/events`, `/companies`, and `/more`; confirm each redirects to `/login`.
- Try a valid email with a wrong password; confirm the login page shows calm copy that asks the leader to check the email and password and try again.
- If a test account exists without an active `church_memberships` row, log in and confirm `/dashboard` explains that the account is signed in but no active leadership profile is connected yet.

Admin:

- Log in as `admin@example.com`.
- Confirm `/dashboard` shows report progress, care, tasks, announcements, and event briefing.
- Open `/reports`; review a submitted report.
- Flag a submitted report and confirm reviewer notes are required.
- Open `/follow-up`; assign a new absentee follow-up.
- Update an assigned follow-up and close it.
- Open `/tasks`; create a task and update an admin-assigned task status if assigned.
- Open `/announcements`; create a plain-text announcement.
- Open `/companies`; add a company member to an active company.
- Open `/events`; confirm current/upcoming event sections and regular schedule render.
- Open `/companies`; confirm all active companies and member counts are visible.
- Open `/more`; confirm available links, coming-soon rows, settings rows, and sign-out.

Company leader:

- Log in as `leader@example.com`.
- Confirm `/dashboard` shows company report state, assigned care only, assigned tasks, announcements, and events.
- Open `/reports`; start or continue the current-week draft for the assigned company.
- Mark a member absent.
- Save the draft.
- Submit the report.
- Confirm the submitted report is read-only after submission.
- Open `/follow-up`; confirm only assigned follow-up and recently closed assigned follow-up are visible.
- Update and close an assigned follow-up case.
- Open `/tasks`; update assigned task status.
- Open `/announcements` and `/events`; confirm leader-visible data appears.
- Open `/companies`; confirm only the assigned company directory is visible.

Assigned/general leader:

- Log in with a recommended assigned/general leader account after assigning at least one task or follow-up case.
- Confirm assigned follow-up is visible on `/follow-up`.
- Confirm unrelated company follow-up and reports are hidden.
- Confirm assigned tasks are visible on `/tasks`.
- Confirm unrelated church-wide admin controls are not shown.

## PWA and deployment readiness

Current Phase 14D status:

- `public/brand/logo.svg` and `public/brand/logo-white.svg` exist and are used by the V2 header/design system.
- No missing production logo reference was found in `src/`.
- `src/app/manifest.ts` is present with the SaltCity Leadership app name, `/dashboard` start URL, standalone display, portrait orientation, Warm Berry background/theme colours, and PNG app icons.
- `public/icons/icon-192.png`, `public/icons/icon-512.png`, and `public/icons/apple-touch-icon.png` were generated from `public/brand/logo-white.svg` on the Warm Berry primary background.
- Root metadata in `src/app/layout.tsx` includes the app name, manifest link, icon references, Apple web app metadata, and a viewport `themeColor`.
- No service worker/offline mode is present.
- Mobile safe-area spacing is present in the app shell and bottom navigation.

Launch note: the app can be installed where the browser accepts the configured manifest and icon set. Offline queued report submissions are not part of the MVP yet. Users need a network connection to submit reports, follow-up updates, and tasks.

## Environment readiness

Required environment variables:

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL used by browser, server, and middleware clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key used by browser, server, and middleware clients. RLS still controls row access. |

Do not expose service-role keys in browser code or checked-in env files.

## Known MVP limitations

- No push notifications yet.
- No offline queued report submissions or sync.
- No announcement acknowledgement/read receipt UI yet, although `announcement_reads` exists in the schema.
- No event creation/editing UI yet.
- No member edit/deactivate UI yet.
- No company leader assignment management UI yet.
- No theme switcher UI yet, although Warm Berry and Calm Teal tokens exist.
- No documents UI yet.
- No unit management UI yet.
- No task editing/reassignment/deletion UI yet.
- No follow-up reassignment or priority edit UI after creation.
- No report reopening or resubmission workflow after submission/review.
