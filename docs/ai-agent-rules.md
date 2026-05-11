# AI Agent Rules

These rules guide AI agents working on this repository.

## Architecture Rules

- Do not create custom authentication.
- Use Supabase Auth only.
- Do not create a separate Express backend.
- Use Next.js Route Handlers, Server Actions, and Supabase.
- Build mobile-first.
- Do not modify the product into a public church website.

## MVP Scope Rules

- Do not add finance features in the MVP.
- Do not add livestreaming in the MVP.
- Do not add congregation-facing features in the MVP.
- Do not add push notifications in the MVP.
- Do not add complex offline sync in the MVP.
- Use simple plain-text announcements in the MVP, not a rich text editor.

## Product Workflow Rules

- Companies and weekly reports are the backbone.
- Units, tasks, events, announcements, and documents support the company workflow.
- Keep the MVP focused on proving that leaders can stop sending scattered WhatsApp reports.
- Prioritize the flow from company report to absentee tracking to follow-up task assignment.

## Data and Supabase Rules

- Use Supabase client for user-facing data where Row Level Security matters.
- Every major table should be designed with `church_id` for future multi-church support.
- Model access around church, role, and company assignment.
- If Prisma is used, use it only for migrations and seed scripts unless explicitly told otherwise.

## Development Rules

- Read the relevant Next.js documentation in `node_modules/next/dist/docs/` before writing Next.js code.
- Follow the existing project structure and conventions.
- Keep changes focused on the requested scope.
- Do not install packages unless explicitly asked.
- Do not expand the MVP without product approval.
