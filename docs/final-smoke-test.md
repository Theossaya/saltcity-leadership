# Final Smoke Test

Use this checklist for the last manual pass before first real user testing. Keep the run practical: confirm the MVP paths work end to end, record failures clearly, and avoid adding new scope during the test.

## A. Pre-test setup

- [ ] Required environment variables are present: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Supabase migrations `001` through `020` have been applied in filename order.
- [ ] Demo data has been applied if using demo mode or demo/test accounts.
- [ ] Admin and leader Auth accounts exist and are linked to active profiles/memberships.
- [ ] The app builds successfully.
- [ ] Browser and dev server or deployed preview are ready for testing.

## B. Auth smoke test

- [ ] Signed-out visits to protected pages redirect to `/login`.
- [ ] Wrong password shows a calm check-email-and-password message.
- [ ] Admin can log in.
- [ ] Admin can log out.
- [ ] Company leader can log in after admin logout.
- [ ] Switching from admin to leader in the same browser does not show stale admin UI.

## C. Admin full path

- [ ] Dashboard loads.
- [ ] Reports overview loads.
- [ ] Submitted report can be reviewed.
- [ ] Submitted report can be flagged with reviewer notes.
- [ ] Follow-up shows new absentee records from reports.
- [ ] Follow-up can be assigned to a leader.
- [ ] Assigned follow-up can be updated and closed.
- [ ] Task can be created.
- [ ] Task status can be updated where assigned.
- [ ] Announcement can be created.
- [ ] Company member can be added.
- [ ] Events page can be viewed.
- [ ] Companies page can be viewed.
- [ ] More page can be viewed.

## D. Company leader full path

- [ ] Dashboard loads.
- [ ] Report draft opens or can be started for the assigned company.
- [ ] Member can be marked absent.
- [ ] Absent member can be removed if the report is still editable.
- [ ] Draft progress can be saved.
- [ ] Report can be submitted.
- [ ] Submitted, reviewed, or flagged report is read-only.
- [ ] Assigned follow-up is visible.
- [ ] Unassigned follow-up is hidden.
- [ ] Contact can be recorded on assigned follow-up.
- [ ] Assigned follow-up can be closed.
- [ ] Assigned task status can be updated.
- [ ] Announcements, events, companies, and More are readable.

## E. Assigned/general leader path

- [ ] Assigned follow-up is visible.
- [ ] Unrelated company data is hidden.
- [ ] Assigned tasks are visible.
- [ ] Admin-only controls are not shown.

## F. Mobile checks

- [ ] iPhone-width layout remains usable.
- [ ] Android-width layout remains usable.
- [ ] Bottom navigation never covers primary actions.
- [ ] Long names wrap without breaking layout.
- [ ] Long announcement text reads well.
- [ ] Forms remain usable on narrow screens.

## G. PWA checks

- [ ] Manifest is available.
- [ ] App icon is visible in browser install surfaces where supported.
- [ ] Install prompt or install option appears where the browser supports it.
- [ ] Installed app opens in standalone display mode.
- [ ] Offline submission is not expected and is not treated as a launch blocker.

## H. Pass/fail recording template

| Area | Account used | Expected | Actual | Pass/Fail | Notes |
|---|---|---|---|---|---|
| Pre-test setup | | | | | |
| Auth smoke test | | | | | |
| Admin full path | | | | | |
| Company leader full path | | | | | |
| Assigned/general leader path | | | | | |
| Mobile checks | | | | | |
| PWA checks | | | | | |
