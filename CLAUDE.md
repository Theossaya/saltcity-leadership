# SaltCity Leadership PWA — Project Context

> This file is read by Claude Code at the start of every session.
> It is the single source of truth for what this project is, what decisions have been made, and what the rules are.
> **This is a fresh build from scratch.** There is no existing codebase to preserve.

---

## What This Product Is

**SaltCity Leadership** is a mobile-first Progressive Web App for church leadership operations at SaltCity Church.

It is a warm pastoral operations companion — not a CRM, not a project management tool, not a SaaS dashboard. It helps church leaders do their weekly ministry work in the small windows of time they have between life and ministry.

---

## Who Uses It

| Role | Permissions summary |
|---|---|
| **Company Leader** | Submit weekly reports for their company, mark absent members, add members to their own company, manage their assigned follow-up cases, update their tasks, read announcements and events |
| **Assistant Leader** | Same as Company Leader, scoped to their company |
| **Church Admin** | Everything — review all reports, flag, assign follow-up cases, create tasks/announcements/events, manage all companies and members, export the weekly company report |
| **Church Office** | Same as Admin for member management and follow-up; cannot review/flag reports |

A **company** is a small group within the church (~10–20 members). Each company has a leader and an assistant leader.

Leaders see **less** than admins. The app actively hides cross-company data from leaders.

---

## Core Workflows

These are the core workflows. (Revised June 2026 — see "Revisions" below.)

1. **Weekly company report** — A leader submits one report per company per week: marks absent members and adds brief notes. Admin reviews it and may flag it. When the week's reports are in, the admin can export a per-company summary (CSV + print/PDF) for the church office and lead pastor. This is the backbone of the app.
2. **Absentee follow-up** — Absent members from reports auto-generate follow-up cases. Admin (or church office) assigns a case to a leader. Assigned leader records contact attempts (called / messaged / visited) and eventually closes the case.
3. **Tasks** — Leaders and admins manage a personal checklist. Admins can also assign tasks to leaders.
4. **Announcements** — Admin publishes notices (normal or urgent) to all or specific audiences. Leaders read them.
5. **Events** — Admin publishes upcoming services and leadership events. Leaders view them.
6. **Companies / Members** — Admin manages the member roster across all companies (add/remove). A company leader can **add** members to their own company; removal/deactivation stays with admin/office. Leaders see only their own company directory.

### Revisions (June 2026)

The build diverged from the original frozen spec on three product decisions (owner-approved):

- **Visitor count removed.** A fixed-roster company system tracks members, not anonymous weekly visitors. Leaders add real newcomers to the roster instead. (`visitor_count` column dropped.)
- **Leaders add members.** Company leaders may add to their own company's roster; admin/office still handle removals.
- **Admin weekly export added.** CSV download + print-friendly summary at `/export`, admin/office only.

Two RLS bugs from the original `SCHEMA.md` were also fixed (see SCHEMA.md "Corrections"): security-definer functions needed a pinned `search_path` (signups failed without it), and `reports_update` needed a `WITH CHECK` (leaders could not submit without it).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 14+**, App Router, TypeScript |
| Styling | **Tailwind CSS** wired to CSS custom property tokens |
| Database + Auth | **Supabase** (PostgreSQL + Supabase Auth + Row Level Security) |
| Hosting | Vercel (or any platform supporting Next.js) |
| PWA | `next-pwa` or manual service worker + `manifest.json` |

Full setup instructions in `HANDOFF.md`.
Full schema + RLS policies in `SCHEMA.md`.

---

## Approved Design Direction

**"Warm Alive, restrained."**

The visual design is fully approved. The reference is `SaltCity Final.html` — open it in a browser, click any artboard label to see a screen fullscreen.

- Berry/plum (`#6B2540`) SaltCity identity
- Warm off-white (`#F4EFE8`) background — not cream
- One primary hero card per screen, 3–4 modules max
- Hairline lists, not boxed-card grids
- Status as coloured dots + words — very few pills
- Two fonts only: **Instrument Sans** (all UI) + **Instrument Serif** italic (one accent word per screen)
- Fast, minimal, mobile-native

Full design spec in `DESIGN.md`.
Full CSS token definitions in `styles-final.css`.
Component markup reference in `components-final.jsx`.

---

## Design Principles (binding, apply when ambiguous)

1. Every screen answers: **"What do I need to do now?"**
2. **One primary action per screen.**
3. **3–4 modules per screen maximum.** Dashboards preview 1–3 items; full data is on the destination page.
4. **Bounded dashboard fetches** — `.take(1–3)`. Never load full lists on a dashboard.
5. **No dead-click feel** — `:active` scale feedback before routes resolve.
6. **No modals, no toasts** — inline state flips and a thin transient banner under the header.
7. **Status only when it changes a decision** — dot + 2–3 words, not a pill on every row.
8. **No explanatory subtitles under greetings** — the H1 is the whole greeting.

---

## Key Files in This Project

| File | What it is |
|---|---|
| `CLAUDE.md` | This file — product context, rules, stack |
| `HANDOFF.md` | Full from-scratch build brief — setup, file structure, implementation order |
| `SCHEMA.md` | Database schema, RLS policies, Supabase setup |
| `DESIGN.md` | Design spec — tokens, typography, components, page rules, copy rules |
| `SaltCity Final.html` | **Approved pixel reference** — 11 screens on a pan/zoom canvas |
| `styles-final.css` | Final CSS token definitions — copy `:root` block into `globals.css` |
| `components-final.jsx` | Component markup + behaviour patterns (HTML/JSX reference, not production code) |
| `screens-final-a.jsx` | Screens 1–6 markup reference |
| `screens-final-b.jsx` | Screens 7–11 markup reference |
| `assets/logo.svg` | SaltCity logo for light backgrounds |
| `assets/logo-white.svg` | SaltCity logo for dark/berry backgrounds |

---

## What Must Never Change Without Design Approval

- The approved colour token values (`DESIGN.md §2`)
- The two-font system (Instrument Sans + Instrument Serif)
- The five-tab bottom nav (Home / Report / Care / Tasks / More)
- The SaltCity logo and identity mark
- The core six workflows listed above
