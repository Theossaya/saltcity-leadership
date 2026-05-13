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
