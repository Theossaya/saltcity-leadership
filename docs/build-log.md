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

## Day 6 Afternoon — Announcements foundation

The read-only announcements foundation was added without schema changes or write actions:

- Created RLS-respecting announcement query helpers for church admin and leader visibility using the existing `announcements` table.
- Added a role-aware `/announcements` page with mobile-friendly summary cards, announcement cards, and calm empty/restricted states.
- Updated the More page so Announcements links to `/announcements`.
- Updated dashboard announcement links for admins and leaders.
- Left announcement creation, editing, notifications, read receipts, and all announcement writes for later passes.

## Day 7 — UI refinement pass 1

The first UI refinement pass improved the existing leadership app surfaces without changing product logic:

- Refined the AppShell, app header, and bottom navigation for tighter mobile rhythm, clearer identity, and more app-like navigation.
- Improved dashboard hierarchy around the "What needs attention?" flow with a stronger primary attention card and denser supporting cards.
- Added small reusable UI helpers for page headers, metric cards, empty states, and query notices to improve visual consistency.
- Tightened card, list, summary, and form presentation across Companies, Reports, Follow-up, Tasks, Announcements, and More.
- Kept the pass visual only: no business logic, SQL, RLS, schema, authentication, or write-action changes.

## Day 7 — UI refinement pass 1B

The second UI refinement pass stayed within UI and layout only:

- Fixed bottom navigation content overlap by increasing the AppShell mobile bottom safe-area padding.
- Removed the duplicate submitted report state so submitted/read-only reports show one clear locked state, followed by absentee records.
- Improved visual hierarchy and identity with stronger dashboard attention treatment, inset metric bands, more deliberate empty states, lighter bottom navigation, and refined card borders/shadows.
- Kept the pass visual only: no business logic, SQL, RLS, schema, authentication, query logic, permissions, or server-action changes.

## Day 8 Morning — Events foundation

The read-only events foundation was added using the existing `public.events` schema:

- Created RLS-respecting event query helpers for church admin overview and active leader visibility.
- Filtered event reads to a current/upcoming window before applying the 50-row limit, avoiding old historical rows crowding out upcoming events.
- Added a protected `/events` page with mobile-friendly event cards, summary cards, and the regular Sunday, Wednesday, and Friday service schedule.
- Showed the known regular service cadence: Sunday 9:00-13:00, Wednesday 17:00-19:30, and Friday 17:00-19:30.
- Updated the More page so Events opens `/events`.
- Added `/events` to middleware route protection.
- Added light dashboard links to `/events` without adding dashboard event queries.
- Confirmed an events schema exists in `supabase/sql/001_initial_schema.sql`, with RLS policies and authenticated select grants already present in `002_rls_policies.sql` and `004_api_grants.sql`.
- Left event creation, editing, attendance marking, notifications, special programme management, and all event write actions out of scope.

## Day 8 Afternoon — Demo data and QA seed foundation

The dev/test demo seed foundation was added without schema, RLS, auth, app logic, write-action, or UI changes:

- Created `supabase/sql/010_demo_data.sql` to run after migrations `001` through `009`.
- Seeded richer demo events, announcements, tasks, demo-only companies, company members, current-week demo reports, absentee records, and linked follow-up cases for QA coverage.
- Made current-week demo reports rolling fixed-ID rows so rerunning the seed across Africa/Lagos week changes moves the same QA reports to the current week.
- Matched the submitted Company Epsilon Demo report audit user to the seeded Epsilon company assignment when `leader@example.com` exists.
- Kept `admin@example.com` and `leader@example.com` profile/membership links optional and derived from real Supabase Auth users when those users exist.
- Isolated report and follow-up demo records to separate demo companies so manually tested Alpha/Beta/Gamma reports are not overwritten.
- Documented the file as dev/test only, rerunnable where possible, and not intended as production data.

## Day 9 Morning — Admin announcement creation foundation

The admin-only announcement creation foundation was added without changing the core schema:

- Added a compact create announcement form on `/announcements` for `church_admin` and `super_admin` users only.
- Added a Server Action that validates plain-text announcement input, inserts through the authenticated Supabase server client, revalidates `/announcements` and `/dashboard`, and redirects with success/error notices.
- Created `supabase/sql/011_announcement_create_grants.sql` with the authenticated insert grant and a strict admin insert RLS policy for active same-church admins.
- Replaced the previous broad announcement admin manage policy with admin select plus strict insert policy, without adding update or delete grants.
- Left announcement editing, deleting, read receipts, push notifications, rich text, and file attachments out of scope.

## Day 9 Afternoon — Admin task creation foundation

The admin-only task creation foundation was added without changing the core schema:

- Added a compact create task form on `/tasks` for `church_admin` and `super_admin` users only.
- Added a Server Action that validates task input, inserts through the authenticated Supabase server client, sets the initial status to `todo`, revalidates `/tasks` and `/dashboard`, and redirects with success/error notices.
- Created `supabase/sql/012_task_create_grants.sql` with the authenticated insert grant and a strict admin insert RLS policy for active same-church admins.
- Added RLS-respecting task create option queries for active assignees, active companies, and open follow-up cases.
- Aligned the task due-date form minimum and server validation with the RLS rule allowing null dates or dates from Africa/Lagos today minus 30 days onward.
- Left task editing, deleting, completion/progress updates, notifications, recurring tasks, and attachments out of scope.

## Day 10 Morning — Task status update foundation

The assigned-user task status update foundation was added without changing the core schema:

- Added a compact status update control on `/tasks` only for tasks assigned to the signed-in leader.
- Created `supabase/sql/013_task_status_update_grants.sql` with a column-limited authenticated update grant for `public.tasks.status` and a strict same-church assigned-user update policy.
- Added status update validation and a Server Action that updates only `status`, revalidates `/tasks` and `/dashboard`, and returns success/error notices.
- Left task title/description editing, reassignment, due date and priority changes, deletion, comments, notifications, and broad admin task editing out of scope.

## Day 10 Afternoon — Follow-up case creation foundation

The admin-only follow-up case creation foundation was added without changing the core schema:

- Added follow-up case creation from existing absentee records on `/follow-up` for `church_admin` and `super_admin` users only.
- Created `supabase/sql/014_follow_up_case_create_grants.sql` with the authenticated insert grant, a safe admin select replacement policy, a strict same-church admin insert policy tied to absentee record ownership, matching company/member links, safe initial status, supported priority values, and active same-church assignees.
- Enforced one active follow-up case per absentee record with a partial unique index on `follow_up_cases.absentee_record_id`, avoiding self-referencing RLS checks inside the insert policy.
- Added zod validation and a Server Action that uses the authenticated Supabase server client, prevents duplicate active cases for the same absentee record where visible, revalidates `/follow-up` and `/dashboard`, and returns success/error notices.
- Added RLS-respecting assignee option loading for active leaders in the church.
- Left case updates, contact tracking, status changes, reassignment after creation, deletion, notifications, and task auto-creation out of scope.

## Day 11 Morning — Follow-up case status update foundation

The assigned-user/admin follow-up progress update foundation was added without changing the core schema:

- Added compact progress updates on `/follow-up` for church admins, super admins, and leaders assigned to the existing follow-up case.
- Created `supabase/sql/015_follow_up_case_status_update_grants.sql` with column-limited authenticated update access for `status`, `date_contacted`, `next_action`, `notes`, and `resolved_at`, plus a strict same-church admin-or-assigned-user update policy.
- Added validation and a Server Action that updates only progress fields, sets `resolved_at` only when resolving, clears it otherwise, and revalidates `/follow-up` and `/dashboard`.
- Included assigned follow-up cases for assigned leaders even when the case belongs to a company they do not lead, including company leaders assigned outside their own company.
- Added read-only context policies so assigned leaders can see the linked active follow-up case, company, company member, absentee context, and weekly report context needed to make contact.
- Avoided post-update reads so assigned leaders resolving a case are not shown a false failure after a successful update.
- Preserved richer company queue report and absence context when merging duplicate company and assigned follow-up items.
- Kept company leaders who are not assigned to the case read-only.
- Left reassignment, deletion, priority changes, broader write permissions, notifications, and task auto-creation out of scope.

## Day 11 Afternoon — Follow-up history / resolved cases visibility

Resolved follow-up history was added without changing the core schema or adding write actions:

- Added a read-only "Recently resolved" section below the active `/follow-up` queue so admins and relevant leaders can confirm completed follow-up work.
- Added role-aware resolved-case query helpers for church admins, company-led cases, and cases assigned to the signed-in leader, with de-duplication when company and assigned visibility overlap.
- Kept active cases first and used separate history cards with completion context, including person, company, original absence context, assigned leader, contacted date, resolved date, final notes, and next action when visible.
- Created `supabase/sql/016_follow_up_history_read_policies.sql` because the Day 11 Morning assigned-user policies exposed active assigned cases only; the new file is SELECT-only and lets assigned leaders read resolved cases assigned to them plus minimum linked context.
- Added no new update actions, no reassignment, no priority changes, no deletion, no notifications, no task auto-creation, no service role use, and no broader update permissions.

## Day 12 Morning — Admin report review foundation

The admin-only weekly report review foundation was added without changing the core schema:

- Added compact review controls on `/reports` for `church_admin` and `super_admin` users only.
- Created `supabase/sql/017_report_review_grants.sql` with a column-limited authenticated update grant for `status`, `reviewed_by`, `reviewed_at`, and `reviewer_notes`, plus a strict same-church active admin review policy.
- Added a trigger guard so submitted report content cannot be changed during review even though authenticated users have other column-limited report grants from earlier flows.
- Added validation and a Server Action that marks submitted reports as `reviewed` or `flagged`, records reviewer notes when provided, and requires notes for flagged reports.
- Kept counts, absentees, submitted content, reopening, deletion, notifications, service role usage, and RLS bypassing out of scope.

## Day 12 UX fix — Guided member-based report attendance

The company leader draft report flow was simplified without schema or RLS changes:

- Reworked the draft report UI so leaders mark absent members instead of manually reconciling present and absent counts.
- Made the attendance summary read-only, with present and absent totals computed from active company members and absentee records.
- Updated draft save and submit actions to compute `present_count` and `absent_count` from the current active member count and linked absentee records while keeping `new_visitors_count`, notes, support needed, and testimonies editable.
- Made absentee recording read as "Mark absent members," with already-marked members listed separately and duplicate absentee checks in the action.
- Added clearer absentee error messages for missing member selection, invalid service date, inactive drafts, duplicates, and generic update failures.
- Kept special programme configuration, schema changes, RLS changes, notifications, review changes, and follow-up changes out of scope.

## Day 12 RLS fix — Absentee insert recursion

The absentee insert runtime failure was fixed without weakening write protections:

- Removed the assigned-user `weekly_reports` follow-up read policies from `015_follow_up_case_status_update_grants.sql` and `016_follow_up_history_read_policies.sql` because they queried `absentee_records` from `weekly_reports` RLS.
- Added explicit cleanup drops for the obsolete assigned-user `weekly_reports` policies to `017_report_review_grants.sql` so already-migrated Supabase databases remove the recursive policies when the pending Day 12 migration runs.
- Preserved the strict `008_absentee_record_grants.sql` insert/delete policies for current-week draft reports.
- Kept assigned leader follow-up context available through follow-up cases, companies, company members, and absentee records, with report week context falling back in the app when `weekly_reports` is not visible.
- Removed the temporary absentee insert console logging after identifying the RLS recursion root cause.

## Day 12 Afternoon — Company member creation foundation

Admin-only company member creation was added without changing the core schema:

- Added a compact `/companies` form for `church_admin` and `super_admin` users to add active members to active companies.
- Created `supabase/sql/018_company_member_create_grants.sql` with the authenticated insert grant, removal of the old broad member manage policy, and a strict same-church active-admin insert policy.
- Added validation and a Server Action that inserts through the authenticated Supabase server client, revalidates `/companies` and `/reports`, and returns success/error notices.
- Updated admin company member counts to count active members, supporting guided weekly reporting with accurate active member lists.
- Kept editing, deletion, deactivation/reactivation, status changes, company leader assignment changes, bulk import, Supabase Auth user creation, service role usage, and RLS bypassing out of scope.

## Day 13 V2 Design Foundation — Theme tokens, brand assets, V2 chrome, and dashboard

The approved SaltCity Leadership Briefing System visual foundation was started as a visual-only pass:

- Added Warm Berry as the default `html.theme-warm-berry` token foundation and Calm Teal as the alternate `html.theme-calm-teal` token set.
- Mapped V2 CSS variables into Tailwind v4 theme tokens for surfaces, ink, role colours, status colours, radii, and V2 font families.
- Connected the production brand assets from `public/brand/logo.svg` and `public/brand/logo-white.svg`, with the header mark using the white logo inside the primary-coloured mark.
- Added Newsreader, Public Sans, and JetBrains Mono through the existing Next.js font approach.
- Added the V2 chrome/component foundation needed for dashboard migration, including `V2Head`, `V2Nav`, `V2Greeting`, `V2Sect`, `Pill`, `Avatar`, `Button`, `Counter`, `Progress`, `TaskRow`, `PersonRow`, `Word`, `ReminderCard`, `Notice`, `EventCard`, and `DateTile`.
- Migrated `/dashboard` from a generic navigation-card grid to the V2 leadership briefing structure, using existing dashboard user/company data only and calm placeholders where report, care, task, event, or announcement preview data is not yet loaded.
- Updated shell/header/nav spacing for the V2 mobile-first chrome, bottom-nav safe-area padding, and scroll clearance.
- Made no database schema, SQL migration, RLS policy, Supabase query, Server Action, permission, validation, route, mutation, or business-logic changes.

### Day 13 V2 font build-safety fix

- Removed the external `next/font/google` dependency from the V2 design foundation so production builds do not fetch Google Fonts.
- Kept build-safe local/fallback font variables for `--font-serif`, `--font-sans`, and `--font-mono`, preferring Newsreader, Public Sans, and JetBrains Mono by family name only when already available locally.

## Phase 13B — V2 Reports migration

The reports experience was migrated to the approved SaltCity Leadership Briefing System as a visual and usability pass:

- Migrated the company leader draft report screen to a guided weekly flow with V2 greeting, report week context, Attendance → Notes → Submit step rail, attendance counters, present-by-default member chips, marked absent members, and clearer save/submit actions.
- Migrated submitted, reviewed, and flagged company reports to a calm read-only V2 layout with status, submission/review metadata, attendance summary, absentee records, and notes from the week.
- Migrated the admin reports overview to V2 submission progress, reviewed/submitted/flagged/missing counters, needs-attention, missing submissions, awaiting-review, and reviewed sections.
- Restyled the existing admin report review controls while preserving the reviewed/flagged outcomes, reviewer notes field, flagged-note requirement, and existing Server Action.
- Kept the pass visual only: no schema, SQL migration, RLS policy, Supabase query behavior, Server Action behavior, validation, permission, route, form field name, mutation, report submission logic, absentee insert/delete logic, or review logic changes.

### Phase 13B Reports V2 review fixes

- Restored draft reports to visible admin overview coverage with a distinct in-progress section and draft progress count.
- Checked Reports V2 bottom-nav clearance; the existing AppShell bottom padding keeps report content and actions above the floating nav.

## Phase 13C — V2 Follow-up / Care migration

The follow-up experience was migrated to the approved SaltCity Leadership Briefing System as a visual and usability pass:

- Migrated `/follow-up` from a follow-up/ticket-style page to a pastoral care operations layout with V2 greeting, care language, compact counters, and token-based status treatment.
- Restyled the active care queue with urgent cases prioritized first, a stronger dark care block for the first urgent/escalated case when present, assigned-to-you visibility for leaders, and calm active queue cards.
- Restyled the existing create/update care forms while preserving the same field names, status options, resolved-at behavior, Server Actions, validation, permissions, and update/create logic.
- Restyled recently resolved history as read-only V2 care records with absence context, resolved timing, final next action, final notes, and original leader note when available.
- Added V2 empty states for no active care cases, no assigned care cases, and no recently resolved care cases.
- Made no database schema, SQL migration, RLS policy, Supabase query behavior, Server Action behavior, validation, permission, route, form field name, mutation, or business-logic changes.

### Phase 13C follow-up case creation manual-test fix

- Fixed the follow-up case creation failure path found during manual testing by validating the selected assignee server-side against active same-church membership before insert and returning specific create-error states for duplicate cases, missing absentee records, invalid assignees, permission failures, and unknown insert failures.
- Added safe insert-failure diagnostics for follow-up case creation with Supabase error code/message/details/hint and non-private context only: absentee record ID, company ID, company member ID, assigned-to presence, and priority.
- Kept the Begin care form field names and insert payload aligned with the existing Server Action: `absenteeRecordId`, `assignedTo`, `priority`, `nextAction`, and `notes`.
- Made no database schema, SQL migration, RLS policy, permission model, follow-up update logic, reports logic, or resolved-history behavior changes.

### Phase 13C follow-up case INSERT RLS recursion fix

- Manual testing confirmed `follow_up_cases` INSERT failed with Postgres `42P17` infinite recursion because the active INSERT policy directly queried `absentee_records`, while assigned-user absentee visibility policies query `follow_up_cases`.
- Added `supabase/sql/019_follow_up_case_insert_rls_recursion_fix.sql` to replace the recursive INSERT policy checks with fixed-search-path SECURITY DEFINER helpers for absentee-record matching and active same-church assignee validation.
- Recreated `follow_up_cases_admin_create_from_absentee` so it no longer directly queries `absentee_records` or `follow_up_cases`, while preserving the same admin-only insert requirements.
- Added a church-scoped partial unique index for one active follow-up case per absentee record without adding an RLS self-reference.
- Made no UI, Server Action behavior, validation, permission model, follow-up update logic, reports logic, or resolved-history behavior changes.

### Phase 13C follow-up UX simplification

- Simplified `/follow-up` from case-management language into a church-office care workflow based on submitted absentee records.
- Admins now see `New from reports`, `Assigned follow-up`, `Needs pastor / urgent`, and `Recently closed`, with absentee records that do not yet have follow-up shown only under admin office review.
- Company leaders now see only `Assigned to you` and `Recently closed`; unassigned/new absentee records remain saved with reports but are not shown to leaders as active follow-up.
- Reworded actions and labels toward office care language: `Assign follow-up`, `Record contact`, `New from report`, `Not assigned yet`, and `Closed`.
- Kept forms collapsed by default and preserved the existing form field names, Server Actions, permissions, query helpers, reports workflow, SQL/RLS model, and follow-up status behavior.

## Phase 13D — V2 Tasks migration

The tasks experience was migrated to the approved SaltCity Leadership Briefing System as a visual and usability pass:

- Migrated `/tasks` to a leadership checklist layout with V2 greeting, compact counters, simple time/state sections, and token-based status treatment.
- Restyled task rows and assigned-user status controls so tasks read as lightweight checklist items instead of repeated heavy cards or a project-management board.
- Restyled the existing admin create-task form with V2 fields and button treatment while keeping it collapsed and preserving existing field names.
- Updated empty states for no assigned tasks, no church-wide tasks, and no done tasks with calm pastoral copy.
- Fixed the empty task checklist title so zero-task states do not show a false task count.
- Updated the checklist title count to include only actionable weekly tasks from the Today and This week groups, excluding done, later, and no-due-date tasks.
- Made no database schema, SQL migration, RLS policy, Supabase query behavior, Server Action behavior, validation, permission, route, form field name, mutation, or business-logic changes.

## Phase 13E — V2 Secondary Pages migration

Announcements, Events, Companies, and More were migrated to the approved SaltCity Leadership Briefing System as a visual and usability pass:

- Migrated `/announcements` to an official notice board style with V2 greeting, urgent notice prioritization, active notices, archive handling, published/audience/expiry metadata, long plain-text wrapping, intentional empty states, and a restyled admin create form.
- Migrated `/events` to a service and leadership calendar style with V2 greeting, regular service schedule, upcoming event cards, DateTile treatment, event time/location details, status pills, and an empty state when no events are configured.
- Migrated `/companies` to a member and leadership directory style with V2 greeting, company overview hero treatment, leadership rows, member rows, read-only company leader state, admin add-member form styling, and empty states for missing companies or members.
- Migrated `/more` to an index style with available rows, quiet coming-soon rows, settings rows, a sign-out control, and a static SaltCity leadership footer.
- Added lightweight V2 `IndexRow`, `MemberRow`, and `CompanyHero` components under `src/components/v2`.
- Made no database schema, SQL migration, RLS policy, Supabase query behavior, Server Action behavior, validation, permission, route, form field name, mutation, or business-logic changes.

### Phase 13E review fixes

- Fixed `/events` display partitioning so ongoing, upcoming, and recently passed events are separated: in-progress events appear under Happening now, Upcoming and Next up only use events whose start time is still in the future, and Recently passed only uses events whose active-until time has elapsed.
- Excluded closed event statuses from the `/events` Happening now bucket so completed and cancelled events keep their real status in history instead of receiving the In progress label.
- Fixed `/events` grouping so future closed events are not labelled recently passed.
- Updated `/events` grouping to separate happening now, upcoming, schedule changes, and recently passed events.
- Fixed the `/announcements` urgent counter so it uses the same active urgent notices shown in the Urgent notices section, preventing expired urgent announcements from inflating the displayed count.
- Fixed the company leader `/companies` member section action so the active member count matches the active count shown in the company hero while still displaying inactive members when present.
- Made no database schema, SQL migration, RLS policy, Supabase query behavior, Server Action behavior, validation, permission, route, form field name, mutation, or business-logic changes.
