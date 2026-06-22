# SaltCity Leadership — Administrator Guide

A practical guide for the person who runs SaltCity Leadership day to day (the
Church Admin / structure coordinator). No coding required — most of this is done
inside the app, with a few one-time setup steps in the Supabase dashboard.

---

## 1. The roles

| Role | What they can do |
|---|---|
| **Company Leader** | Submit their company's weekly report, mark absentees, add new members to their own company, work their assigned follow-ups, manage their own tasks, read announcements/events |
| **Assistant Leader** | Same as Company Leader |
| **Church Admin** | Everything: review/flag all reports, assign follow-up cases, publish announcements & events, manage all companies/members, export the weekly report |
| **Church Office** | Like Admin for members & follow-ups, but cannot review/flag reports |

Leaders only ever see **their own company's** data. The app hides everyone else's.

---

## 2. One-time setup (Supabase dashboard)

You'll do these in your Supabase project at `supabase.com` → your project.

### Create the companies
SQL Editor → run, e.g.:
```sql
insert into companies (name) values ('Company Eagles'), ('Company Doves');
```
(Or copy an existing row's pattern.) Each company is a small group (~10–20 people).

### Create a login for each leader
Authentication → **Users** → **Add user**:
- Enter their email and a password **you choose** (type it in — no email is sent).
- Tick **Auto Confirm User** so they can sign in immediately.

Then tell the app what they are: Table Editor → **profiles** → find their row →
set **role** (`company_leader` or `assistant_leader`) and **company_id** (pick the
company they lead). Save.

> You hand the leader their email + the password you set. That's their login.

### Add members to a company
Two ways:
- **In the app:** open **More → Companies → (the company) → Add a member.** Leaders
  can do this for their own company too.
- **In bulk (dashboard):** Table Editor → **members** → insert rows with the
  person's name and the company's `company_id`.

Removing/deactivating a member is admin/office only (in the app, the **×** on a
member row).

---

## 3. The weekly rhythm

1. **Leaders submit.** Each company leader opens **Report**, taps anyone who was
   away, optionally adds a note, and hits **Submit report** (one per company per
   week). They can Save a draft and finish later.
2. **Absentees become follow-ups automatically.** The moment a report is
   submitted, every absent member becomes a follow-up case in **Care**.
3. **You review.** Open **Report** (as admin you see the review queue). Open any
   submitted report; **Mark reviewed**, or **Flag** it with a reason the leader
   will see.
4. **You assign care.** In **Care**, new cases sit under "New from this week."
   Open one, choose a leader, add context, mark urgent if needed, **Assign**.
5. **Leaders follow up.** The assigned leader records each contact (Called /
   Messaged / Visited) and eventually **Marks resolved**.
6. **You export.** When the week's reports are in, open **Report → Export week
   summary** → **Download CSV** (to email the office / lead pastor) or **Print /
   Save as PDF**.

---

## 4. Announcements & events

- **More → Announcements → + New notice.** Write a title and message, pick the
  audience (everyone / leaders / admins), tick **Urgent** to pin it to the top.
- **More → Events → + New event.** Title, date, time, location, audience.

Both are admin-only to create; everyone reads them.

---

## 5. Tasks

Everyone has a personal checklist under **Tasks** (add, tick off, delete). As
admin you can also assign a task to a specific leader when you add it.

---

## 6. Resetting a leader's password

- **No email needed:** the simplest path is to delete and re-add the user with a
  new password in Authentication → Users (re-set their role/company afterward), or
  ask them to pick a password you type in the Add-user dialog.
- **Email reset** (Authentication → Users → the user → *Send password recovery*)
  only works if the address is a real inbox **and** you've configured custom SMTP
  (Supabase's built-in email is rate-limited and not meant for production). For a
  small team, setting passwords directly is simpler.

---

## 7. Good to know

- **Reports lock after submission.** A leader can't edit a report once it's in;
  if something's wrong, flag it and they'll see why (admins can still adjust).
- **One report per company per week.** The week runs Monday–Sunday.
- **Privacy:** the export footer marks it confidential — it's for the office and
  lead pastor, not for circulation.
- **Installing the app:** open the site on a phone and use "Add to Home Screen"
  for an app-like icon and full-screen experience.
