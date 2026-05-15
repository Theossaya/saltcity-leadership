# Build Log

## Day 0

The Next.js app was scaffolded successfully with:

- TypeScript
- Tailwind
- App Router
- ESLint
- `src` directory
- `AGENTS.md`

## Day 1 Morning — Foundation setup

The MVP foundation was prepared with:

- Core packages installed: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, and `lucide-react`.
- shadcn/ui initialized for the Next.js App Router, TypeScript, and Tailwind setup.
- Starter shadcn/ui components added: `button`, `card`, `input`, `label`, `textarea`, `badge`, `separator`, `alert`, and `skeleton`.
- Supabase helper placeholders created under `src/lib/supabase/`.
- App and workflow constants created under `src/lib/constants/`.
- Foundation folders prepared under `src/components/`, `src/lib/`, and `src/features/`.

## Day 1 Afternoon — Database schema draft

The first database draft was prepared without connecting to Supabase or running SQL:

- Created `supabase/sql/001_initial_schema.sql` with the MVP tables, constraints, timestamps, triggers, and indexes.
- Created `supabase/sql/002_rls_policies.sql` with a conservative first-pass RLS policy draft and helper functions.
- Created `supabase/sql/003_seed_data.sql` with manual seed data and clear placeholders for real Supabase Auth user UUIDs.
- Added `docs/database-schema.md` explaining the schema, company workflow backbone, identity model, RLS approach, and intentional MVP exclusions.
- Updated `docs/roles-and-permissions.md` with the six role values and first-pilot permission expectations.

## Day 1 Afternoon — Schema/RLS review fix pass

The schema and RLS drafts were tightened after review, without connecting to Supabase or running SQL:

- Fixed `all_leaders` document visibility so it requires active leadership membership in the same church.
- Added duplicate absentee prevention with one absentee row per report/member.
- Added stronger same-church and same-company integrity constraints for the core report and absentee workflow.
- Removed broad assigned-user update policies and documented the safer RPC/server-action direction for task completion, follow-up contact updates, event checklist completion, and report submission.
- Added a direct nullable `follow_up_case_id` link on `tasks` for the MVP follow-up task workflow.
- Added basic audience/visibility consistency checks for announcements and documents.
- Updated schema documentation to explain the direct follow-up task link, trusted workflow actions, document membership checks, and absentee uniqueness.

## Day 1 Evening — Auth proof

The first Supabase Auth proof was added without introducing custom authentication or schema changes:

- Added a mobile-first login page using shadcn/ui components and Supabase email/password sign-in.
- Added protected dashboard placeholder with session checks, role display, church display, admin/company/leader placeholder branching, and logout.
- Added a simple current-user helper that reads the Supabase auth user, profile, active church memberships, primary role, church, and assigned company.
- Added logout through a Server Action using the Supabase server client.
- Added root route protection for `/dashboard`, `/companies`, `/reports`, `/follow-up`, `/tasks`, `/more`, and `/admin`, with authenticated `/login` users redirected to `/dashboard`.
- Kept Supabase usage tied to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the existing environment helper setup.

## Day 1 Evening — Supabase API grants

The manual Supabase API grants were documented without connecting to Supabase or running SQL:

- Created `supabase/sql/004_api_grants.sql` with the explicit `authenticated` role grants needed after disabling automatic table exposure.
- Documented that the grants expose table access to the Supabase client/API role while RLS still controls row-level visibility.
- Reiterated that `service_role` and other secret keys must never be used in browser code.

## Day 2 Design — Galano Grotesque font integration

The app typography was aligned with the church visual identity:

- Wired the local Galano Grotesque font files through `next/font/local`.
- Set Galano Grotesque as the primary sans font for the app with system fallbacks.

## Day 2 Design — Visual direction locked

The final visual direction was documented before building the AppShell:

- Locked the direction as Premium Pastoral Operations.
- Defined the app as a private leadership command center with premium pastoral warmth, mobile banking clarity, editorial restraint, and operational urgency.
- Documented the restrained warm palette, Galano Grotesque typography rules, dashboard hierarchy, mobile interaction rules, component principles, and screen mood guidance.

## Day 2 Morning — AppShell foundation

The protected leadership app foundation was added using the Premium Pastoral Operations direction:

- Created the AppShell with a simple premium header, mobile-first content width, warm off-white background, and bottom spacing for app navigation.
- Added a clean header with app identity, leader identity, role badge, church name, and compact logout.
- Added thumb-friendly bottom navigation for Home, Reports, Follow-up, Tasks, and More.
- Added protected placeholder pages for reports, follow-up, tasks, companies, and more.
- Redesigned the dashboard foundation around the "What needs attention?" hierarchy with role-aware placeholder cards.

## Day 2 — Company module foundation

The read-only company module foundation was added without schema changes or write actions:

- Created RLS-respecting Supabase query helpers for company overview, assigned company details, and company members.
- Replaced the Companies placeholder with an admin company overview showing leadership assignments and member counts.
- Added the assigned company view for company leaders and assistant leaders.
- Added read-only member visibility for assigned company leaders.
- Improved dashboard company cards so admins and assigned company leaders can move into the Companies view.

## Day 3 Morning — Reports foundation

The read-only reports foundation was added without schema changes or write actions:

- Created RLS-respecting Supabase query helpers for current week reports, company leader report workspace data, and admin report overview data.
- Added a deterministic Monday-to-Sunday current week range for the reporting UI.
- Replaced the Reports placeholder with a company leader workspace showing assigned company, current week, and report status.
- Added an admin reports overview with summary counts and mobile-friendly company report cards.
- Improved dashboard report cards so company leaders and admins can move into Reports.
- Left report submission, absentee entry, follow-up case creation, and all write actions for later passes.

## Day 3 Afternoon — Start draft report

The first controlled write flow was added for weekly reports:

- Added a Server Action that lets assigned company leaders and assistant leaders start a draft report for the current week from `/reports`.
- Kept the action role-aware and RLS-respecting, with duplicate prevention by checking the current company and report week before insert.
- Created `supabase/sql/005_report_write_grants.sql` with the minimum authenticated `insert` grant for `public.weekly_reports`; RLS remains responsible for row-level restrictions.
- Activated only the `Start report` CTA for `not_started` company leader workspaces.
- Left report editing, absentee entry, submission, follow-up case creation, and review/approval out of this pass.

## Day 3 Afternoon — Start draft report review fixes

The start draft flow was tightened after review:

- Updated `supabase/sql/005_report_write_grants.sql` to replace the broad weekly report insert policy with a draft-only company leader policy for active assigned companies.
- Constrained direct draft inserts to the current `Africa/Lagos` report week.
- Passed the displayed company id through the `/reports` start form and validated it server-side before draft creation.
- Disabled the start CTA for inactive displayed companies and kept the calm notice in the report workspace.
- Required direct draft inserts to set `total_members` to the current active company member count, preserving the report snapshot even if a leader bypasses the app flow.

## Day 4 Morning — Draft report editing foundation

The draft report editing foundation was added without expanding into submission or follow-up workflows:

- Created `supabase/sql/006_report_draft_update_grants.sql` with column-limited authenticated update access for draft-edit fields only, plus a strict current-week draft update policy for assigned active company leaders and assistant leaders.
- Added zod validation for draft counts and basic notes, including the total member count check.
- Added a Server Action for saving draft report counts and notes while leaving submission, review, company, church, and report week fields untouched.
- Added the company leader draft form on `/reports` for present count, absent count, new visitors, general notes, support needed, and testimonies.
- Left submit report, absentee entry, follow-up case creation, and admin review out of this pass.

## Day 4 Afternoon — Submit weekly report

The current-week draft submission flow was added without expanding into review or follow-up workflows:

- Created `supabase/sql/007_report_submit_grants.sql` with a column-limited authenticated update grant for submission fields only, plus a strict current-week draft submit policy for assigned active company leaders and assistant leaders.
- Added a database trigger guard so draft content cannot be changed in the same update that submits the report.
- Added a Server Action for submitting an existing current-week draft report while leaving counts, notes, company, church, report week, and review fields untouched.
- Updated submission so it sends the visible draft fields and saves those draft-edit columns before locking the report, preventing unsaved draft edits from being silently lost.
- Required all members to be accounted for before submission: `present_count + absent_count` must equal the current active company member count.
- Locked editing after submission by showing the submitted state on `/reports` instead of the draft form.
- Left absentee records, follow-up case creation, and admin review actions for later passes.

## Day 5 Morning — Absentee records foundation

The draft-only absentee record foundation was added without creating follow-up cases or expanding pastoral workflow:

- Created `supabase/sql/008_absentee_record_grants.sql` with authenticated insert/delete grants and strict RLS policies for current `Africa/Lagos` week draft reports owned by active assigned company leaders or assistant leaders.
- Added zod validation for absentee record creation/removal using the actual `absentee_records` columns, including `company_member_id`, `absence_date`, `reason`, and optional `reason_note`.
- Added server actions for adding and removing absentee records from a current-week draft report while keeping report status and report counts untouched.
- Updated the company leader reports workspace to show active company members for absentee selection, draft-only add/remove controls, and read-only absentee display after submission.
- Tightened submission so locking a report now requires `absent_count` to match the linked absentee records before submission.
- Kept Submit enabled for draft reports so visible form values can be saved and validated by the server action at submission time, instead of blocking on stale saved draft values.
- Applied database-level absentee reconciliation for report submission through a new `supabase/sql/009_report_submit_absentee_reconciliation.sql` migration because `007_report_submit_grants.sql` may already be applied in existing environments.
- Set the absentee form's default absence date from the most recent regular service day in the current reporting week.
- Added absentee counts to the admin report overview cards.
- Left follow-up case creation, admin review, notifications, and pastoral workflow for later passes.

## Day 5 Afternoon — Follow-up queue foundation

The read-only follow-up queue foundation was added without schema changes or write actions:

- Created a role-aware follow-up queue from existing absentee records, recent weekly reports, companies, company members, and already-linked follow-up cases when present.
- Added admin visibility across church companies and company leader visibility limited to assigned companies.
- Replaced the Follow-up placeholder with mobile-friendly summary cards and sensitive absentee follow-up cards.
- Updated dashboard follow-up cards to point to `/follow-up`.
- Left follow-up case creation, marking contacted, assignment workflow, admin review, notifications, and all write actions for later passes.

## Day 6 Morning — Tasks foundation

The read-only tasks foundation was added without schema changes or write actions:

- Created RLS-respecting task query helpers for church admin overview and leader task visibility using the existing `tasks` table.
- Added mobile-friendly task summary cards, task cards, and empty states for `/tasks`.
- Added admin visibility for church-wide tasks and leader visibility for assigned tasks, with safe enrichment for assignees, companies, and linked follow-up cases when visible.
- Updated dashboard task cards to point to `/tasks` for admins and leaders.
- Left task creation, completion/update actions, assignment workflow, notifications, admin review, and all task writes for later passes.
