# Database Schema

This is the Day 1 Afternoon database schema draft for the church leadership operations MVP. It is designed for Supabase/PostgreSQL, Supabase Auth, and Row Level Security.

## Core Shape

Companies are the backbone of the MVP. The main operational workflow starts with a company leader and their assigned company, then moves through weekly reports, absentee records, follow-up cases, and assigned tasks. Units, events, announcements, and documents support that workflow without becoming separate dashboards in the first pilot.

Every major operational table includes `church_id`. The first pilot may use one church, but storing `church_id` from day one keeps the data model ready for future multi-church support and makes RLS policies easier to reason about.

## Identity

Supabase Auth is the source of identity. The app does not create a custom user table.

The `profiles` table uses the same UUID as `auth.users.id`:

- `auth.users` stores authentication identity.
- `profiles` stores app-facing identity fields such as full name, phone, and avatar URL.
- `church_memberships` connects a profile to a church and assigns one of the MVP role values.

The role values are:

- `super_admin`
- `church_admin`
- `company_leader`
- `assistant_leader`
- `unit_leader`
- `general_leader`

## Church Structure

`churches` stores each church or campus organization that uses the app.

`church_memberships` records who belongs to each church, which role they hold, and whether the membership is active, inactive, or invited.

`companies` stores the company structure. A company can have a `leader_id` and `assistant_leader_id`, both linked to `profiles`.

`company_members` stores the people being reported on by company leaders. These are not required to be app users, so they are stored separately from `profiles`.

`units` and `unit_members` prepare the app for unit-linked tasks, events, and documents. Unit dashboards are not required in the first working pilot.

## Reports, Absentees, and Follow-Up

`weekly_reports` stores one report per company per week. The unique constraint on `company_id` and `report_week_start` prevents duplicate weekly reports for the same company.

`absentee_records` stores absent company members for a weekly report. Each absentee record links back to:

- the church
- the company
- the weekly report
- the company member

`follow_up_cases` are created from absentee records or other report outcomes. A follow-up case links to the relevant company and company member, and can optionally link back to the absentee record that created it. Admins can assign a case to a leader for contact and resolution.

## Tasks

`tasks` stores actionable assignments. Tasks can stand alone or link to another record with:

- `linked_entity_type`
- `linked_entity_id`

This supports simple links to follow-up cases, events, reports, companies, or future operational records without over-engineering a separate table for every relationship during the MVP.

Assigned users can see and update their own tasks. Admins can manage church-wide tasks.

## Announcements

`announcements` stores simple plain-text leadership messages. The MVP intentionally avoids rich text editing.

Announcements can target:

- all leaders
- one company
- one unit
- one role

`announcement_reads` stores one read receipt per announcement and user. This lets admins see who has read an announcement while keeping the announcement body simple.

## Events and Documents

`events` stores leadership events such as review meetings or preparation sessions.

`event_checklist_items` stores simple event tasks that can be assigned and completed.

`documents` stores metadata for leadership resources. It stores a `file_path`, not the file itself. File storage and bucket policy details are intentionally left for a later Supabase storage pass.

## RLS Draft

The RLS draft in `supabase/sql/002_rls_policies.sql` uses helper functions for role checks, company assignment checks, unit leader checks, and announcement targeting.

The first-pass intent is:

- users can read and update their own profile
- users can read churches where they have active membership
- `super_admin` and `church_admin` can manage church-wide operational data
- `company_leader` and `assistant_leader` can access assigned company data and submit reports
- assigned users can read and update their own tasks
- follow-up data is restricted to admins, assigned users, and related company leaders
- announcements and documents are readable based on audience or visibility

Some column-level restrictions should be tightened later with Server Actions or dedicated RPCs once the app flows are implemented.

## Intentionally Left Out

The MVP schema intentionally leaves out:

- finance, giving, pledges, or accounting
- livestreaming
- congregation-facing login or member portal workflows
- push notification tables
- complex offline sync queues
- rich text announcement content
- broad pastoral care or CRM features outside the company report and follow-up workflow
- Prisma setup or generated ORM models
- Supabase storage bucket policies

These can be added later only if they support the core leadership operations workflow.
