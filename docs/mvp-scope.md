# MVP Scope

## In Scope

- Mobile-first PWA experience for leaders and admins.
- Supabase Auth for login and user identity.
- Company leader dashboard showing the leader's own company.
- Weekly company report submission.
- Absentee recording as part of the weekly reporting workflow.
- Follow-up case creation from absentees and report outcomes.
- Monday admin follow-up list.
- Admin assignment of follow-up tasks to leaders.
- Leader task completion flow.
- Simple plain-text announcements.
- Announcement read receipts.
- Basic document support for leadership resources.
- Data model prepared for future multi-church support with `church_id` on major tables.

## Out of Scope

- Public church website pages.
- Custom authentication.
- Separate Express backend.
- Finance features.
- Livestreaming.
- Congregation-facing features.
- Push notifications.
- Complex offline sync.
- Rich text editor for announcements.
- Broad church management features unrelated to company reporting and follow-up.

## MVP Success Criteria

- A company leader can log in, see their company, submit the weekly report, and record absentees.
- Admins can see the Monday follow-up list generated from company reports and absentees.
- Admins can assign follow-up tasks to leaders.
- Leaders can mark assigned tasks complete.
- Admins and leaders can use simple announcements with read receipts.
- The app clearly replaces scattered WhatsApp report collection for the MVP workflow.
