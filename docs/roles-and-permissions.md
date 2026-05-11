# Roles and Permissions

## Role Model

The MVP uses a small leadership-only role model.

## Admin

Admins manage the operational workflow across the church.

Admins can:

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

## Future Roles

Possible later roles include:

- Unit leader
- Pastor or overseer
- Document manager
- Read-only auditor

These roles are not required for the MVP unless explicitly added to scope.

## Permission Principles

- Supabase Auth is the source of user identity.
- Row Level Security should protect user-facing data.
- Major tables should include `church_id` for future multi-church support.
- User access should be based on role, church, and company assignment.
- The MVP should prefer clear, simple permissions over complex policy trees.
