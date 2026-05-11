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
