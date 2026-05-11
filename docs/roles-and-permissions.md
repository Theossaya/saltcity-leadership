# Roles and Permissions

## Role Model

The MVP uses a leadership-only role model with six role values:

- `super_admin`
- `church_admin`
- `company_leader`
- `assistant_leader`
- `unit_leader`
- `general_leader`

Only admin and company leader workflows are required for the first working pilot. Assistant, unit, and general leader roles are schema-ready so the app can grow without changing the core identity model.

## Super Admin

Super admins are reserved for cross-church or platform-level oversight.

For the MVP schema, super admins can:

- Access church-wide operational data.
- Support future multi-church administration.
- Perform the same church-level operations as church admins where assigned.

The first pilot does not require a dedicated super admin interface.

## Church Admin

Church admins manage the operational workflow across one church.

Church admins can:

- View all companies in their church.
- View submitted weekly company reports.
- View absentee records.
- View the Monday follow-up list.
- Create and assign follow-up tasks.
- Reassign or close follow-up tasks.
- Create simple plain-text announcements.
- View announcement read receipts.
- Manage leadership documents.

## Company Leader

Company leaders are responsible for their assigned company.

Company leaders can:

- View their own company.
- Submit weekly company reports for their company.
- Record absentees for their company.
- View follow-up tasks assigned to them.
- Complete assigned tasks.
- Read announcements.
- Access leadership documents made available to them.

Company leaders should not see unrelated company data unless explicitly granted.
Report submission and task completion should be handled through trusted Server Actions or RPCs so review fields, assignments, and linked records stay admin-controlled.

## Assistant Leader

Assistant leaders support an assigned company.

Assistant leaders can:

- View their assigned company.
- Draft or support weekly reports for their company.
- Help record absentees for their company.
- View and complete tasks assigned to them.
- Read announcements and accessible documents.

The first pilot may treat assistant leaders similarly to company leaders for reporting support, but the main required flow remains company leader submission.

## Unit Leader

Unit leaders exist for task, event, and document linkage.

Unit leaders can:

- View tasks assigned to them.
- View unit-linked event checklist items assigned to them.
- Access documents visible to their unit or role.
- Read announcements targeted to all leaders or their role.

Complex unit dashboards are not required for the MVP.

## General Leader

General leaders are leadership users without admin, company, or unit ownership.

General leaders can:

- View announcements targeted to all leaders or their role.
- View and complete tasks assigned to them.
- Access documents visible to all leaders or their role.

General leaders should not access unrelated company reports, absentee records, or follow-up cases.
Assigned task completion should be exposed through a narrow trusted action, not broad table updates from the client.

## Permission Principles

- Supabase Auth is the source of user identity.
- Row Level Security should protect user-facing data.
- Major tables should include `church_id` for future multi-church support.
- User access should be based on role, church, and company assignment.
- The MVP should prefer clear, simple permissions over complex policy trees.
