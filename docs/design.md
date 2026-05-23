# SaltCity Leadership Briefing System — Design Handoff

> **Status:** Approved. Production-ready.
> **Owner:** Design.
> **Audience:** Implementation agents and engineers building the SaltCity Leadership PWA in the existing Next.js App Router + Tailwind codebase.
> **Source of truth:** This document, plus the approved Warm Berry and Calm Teal screenshots/reference exports stored under `docs/design-references/` when available.
> **Reference-file rule:** Files such as `SaltCity-Briefing.html`, `styles-v2.css`, `components-v2.jsx`, `screens-v2.jsx`, and `screens-v2b.jsx` are visual/design references only. Do not import them directly into the production app. Production implementation must adapt the design system to the existing `src/` project structure.

This document is the binding design spec. If a build choice contradicts this file, this file wins.

---

## Brand Assets

Production logo assets live in:

- `public/brand/logo.svg` — use on light backgrounds
- `public/brand/logo-white.svg` — use inside dark/primary logo marks and dark authority blocks

Design reference copies may also exist in `docs/design-references/`, but production components must import or reference the assets from `public/brand/`.

The header mark uses `logo-white.svg` inside the primary-coloured mark. Do not replace the SaltCity mark with a user avatar.

---

## 1. Design Philosophy

SaltCity is a **warm pastoral operations companion for church leadership.** It is not a CMS, not a CRM, not a KPI dashboard. It exists to help a tired company leader, assistant leader, assigned leader, or church admin do faithful work in the small minutes they have between life and ministry.

The app must feel:

- **Warm** — colour, type, and language carry care.
- **Beautiful** — visual quality is part of pastoral dignity.
- **Calm** — low visual noise, no urgency theatre.
- **Pastoral** — language honours people, not "users" or "records."
- **Structured** — every screen has a clear hierarchy.
- **Operational** — the work still gets done quickly.
- **Mobile-first** — designed around a 390px-wide mobile screen and touch-native behaviour.
- **Easy for tired leaders** — one decision per moment, big targets, gentle copy.

### Product framing rules

These framings determine layout, copy, and component selection. Implementation agents must not reframe these screens as something else.

| Surface | Framing to keep | Framing to reject |
|---|---|---|
| Dashboard | **Warm leadership briefing** | Navigation page · KPI dashboard |
| Reports | **Guided weekly submission flow** | Form dump · CRUD page |
| Follow-up | **Pastoral care operations** | Ticket queue · CRM lead list |
| Tasks | **Leadership checklist** | Project management board |
| Announcements | **Official notice board** | Activity feed · social wall |
| Events | **Service and leadership calendar** | Generic event listing |
| Companies | **Member and leadership directory** | Org chart · user admin |
| More | **Index** | Placeholder menu · settings dump |

---

## 2. Approved Themes

Two themes are approved.

| Theme | Production root class | Design-export alias | Identity | Status |
|---|---|---|---|---|
| **Warm Berry** | `html.theme-warm-berry` | `.pal-a` | Berry / clay / olive on soft cream | **Default** |
| **Calm Teal** | `html.theme-calm-teal` | `.pal-b` | Deep teal / coral / sage on warm off-white | Alternate |

### Theme implementation rules

- Production code must use `html.theme-warm-berry` and `html.theme-calm-teal` as the canonical class names.
- `.pal-a` and `.pal-b` are design-export aliases only. They may appear in reference files but should not be used as the production theme API.
- Theme is a single class toggle on the app root. No behaviour changes between themes.
- Same layout, same components, same hierarchy. Only token values change.
- User-visible theme selection may live later under **More → Settings → Display & language**. The selected theme should persist to user preferences or a cookie when that settings work is implemented.
- Build Warm Berry first. Add Calm Teal tokens alongside it. Do not create extra themes in this release.

---

## 3. Theme Tokens

Every screen reads tokens. **No hard-coded colours, radii, shadows, or font families in product code.**

All token names are stable across themes. Only values change.

### Surface and ink

| Token | Role |
|---|---|
| `--bg` | App page background |
| `--bg-tint` | Subtle hover/inset surface |
| `--bg-deep` | Inert tinted block, date tile, light-mode pill backdrop |
| `--surface` | Primary card/module surface |
| `--surface-2` | Accent, read-only, or coming-soon surface |
| `--ink` | Primary text and dark authority blocks |
| `--ink-2` | Secondary text |
| `--ink-3` | Metadata, labels, captions |
| `--ink-4` | Very low-priority metadata and decorative index numerals |
| `--rule` | 1px hairline divider inside cards |
| `--rule-strong` | Input/ghost-button outlines |

### Colour roles

| Token | Role | Typical use |
|---|---|---|
| `--primary` | Brand identity colour | Logo mark background, Word card, CompanyHero, primary actions |
| `--primary-ink` | Foreground on `--primary` | Text inside primary surfaces |
| `--primary-soft` | Tonal primary background | Captions and soft primary accents |
| `--warm` | Operational accent | Reminder progress, secondary operational emphasis |
| `--warm-soft` | Warm operational surface | ReminderCard background |
| `--calm` | Resolved/completion accent | Check fill, ok-state text |
| `--calm-soft` | Calm tinted surface | Accent Notice / settled states |
| `--gold` | Reserved high accent | Date tile details, rare premium accents |

### Status token pairs

Each pair is a label colour plus matching background. Always use both halves.

| Token pair | Meaning |
|---|---|
| `--status-urgent` / `--status-urgent-bg` | Urgent / Flagged |
| `--status-care` / `--status-care-bg` | Care active / Submitted / Assigned / In progress |
| `--status-ok` / `--status-ok-bg` | Reviewed / Resolved / Done |
| `--quiet` / `--quiet-bg` | Missing / Open / Archived / Read-only / Soon |

### Shape, elevation, type

```css
--r-input: 12px;
--r-card: 16px;
--r-pill: 999px;
--shadow-lift: 0 1px 0 rgba(ink, 0.04), 0 12px 30px -22px rgba(ink, 0.26);
--serif: 'Newsreader', Georgia, serif;
--sans: 'Public Sans', system-ui, sans-serif;
--mono: 'JetBrains Mono', ui-monospace, monospace;
```

There is only one shadow token. There are exactly three radius tokens.

No 4px, 8px, 20px, or 24px rounded corners in the V2 design system.

---

## 4. Warm Berry Token Values

```css
html.theme-warm-berry {
  /* Surface & ink */
  --bg: #F3EADC;
  --bg-tint: #ECDFCB;
  --bg-deep: #E0CFB4;
  --surface: #FBF3E6;
  --surface-2: #F6E6D9;
  --ink: #2C1E26;
  --ink-2: #5A4A54;
  --ink-3: #897C84;
  --ink-4: #B5ACA9;
  --rule: rgba(44, 30, 38, 0.09);
  --rule-strong: rgba(44, 30, 38, 0.20);

  /* Colour roles */
  --primary: #6E2A40;
  --primary-ink: #FCF1E3;
  --primary-soft: #E9C9C1;
  --warm: #B5703F;
  --warm-soft: #F2D9C0;
  --calm: #6D7A4A;
  --calm-soft: #DDE0BC;
  --gold: #B58A3C;

  /* Status */
  --status-urgent: #8C2A29;
  --status-urgent-bg: #ECD0CC;
  --status-care: #9B5E22;
  --status-care-bg: #F3E0C2;
  --status-ok: #4D6B43;
  --status-ok-bg: #D9E3CC;
  --quiet: #756370;
  --quiet-bg: #E5DBDC;

  /* Shape & elevation */
  --r-input: 12px;
  --r-card: 16px;
  --r-pill: 999px;
  --shadow-lift: 0 1px 0 rgba(44, 30, 38, 0.04),
    0 12px 30px -22px rgba(44, 30, 38, 0.28);
}
```

---

## 5. Calm Teal Token Values

```css
html.theme-calm-teal {
  /* Surface & ink */
  --bg: #F6F1E7;
  --bg-tint: #EEE7D8;
  --bg-deep: #E1D7C2;
  --surface: #FCF8EE;
  --surface-2: #F1E2D6;
  --ink: #14323C;
  --ink-2: #3F535E;
  --ink-3: #7A8590;
  --ink-4: #B5BCC3;
  --rule: rgba(20, 50, 60, 0.08);
  --rule-strong: rgba(20, 50, 60, 0.18);

  /* Colour roles */
  --primary: #18525E;
  --primary-ink: #F4FBFB;
  --primary-soft: #C8DBDB;
  --warm: #C97560;
  --warm-soft: #F1D6C8;
  --calm: #587B68;
  --calm-soft: #D5E0D2;
  --gold: #B58A3C;

  /* Status */
  --status-urgent: #A53F2F;
  --status-urgent-bg: #F2D2C7;
  --status-care: #B36F37;
  --status-care-bg: #F1DCC2;
  --status-ok: #4F7560;
  --status-ok-bg: #D2E0D2;
  --quiet: #76828D;
  --quiet-bg: #DFE3E7;

  /* Shape & elevation */
  --r-input: 12px;
  --r-card: 16px;
  --r-pill: 999px;
  --shadow-lift: 0 1px 0 rgba(20, 50, 60, 0.04),
    0 12px 30px -22px rgba(20, 50, 60, 0.26);
}
```

---

## 6. Typography System

### Font families

| Family | Stack | Role |
|---|---|---|
| Serif | `'Newsreader', Georgia, serif` | Emotional/editorial moments |
| Sans | `'Public Sans', system-ui, sans-serif` | Operational content |
| Mono | `'JetBrains Mono', ui-monospace, monospace` | Labels and minor metadata |

Load `Newsreader`, `Public Sans`, and `JetBrains Mono` with weights `400`, `500`, `600`, `700`. Include Newsreader italic `400/500`.

### Usage rules

- Use **serif** for greetings, page titles, scripture/leadership word, module titles, card headings, stat numerals, and pastoral italic notes.
- Use **sans** for body copy, lists, forms, buttons, navigation, person names, task titles, and table-like content.
- Use **mono** for section labels, small uppercase metadata, pill labels, dates, timestamps, index numerals, and role chips.
- Do not use serif for buttons, form values, or list metadata.
- Do not use mono for body copy.

### Scale

| Role | Family | Size | Tracking | Weight | Line height |
|---|---|---:|---:|---:|---:|
| Greeting title | Serif | 32px | -0.02em | 500 | 1.05 |
| Page subtitle | Serif italic | 15px | normal | 400 | 1.50 |
| Module title | Serif | 21px | -0.012em | 500 | 1.20 |
| Card heading | Serif | 17–18px | -0.008em | 500 | 1.22 |
| Stat numeral | Serif | 22–28px | -0.015em | 500 | 1.00 |
| Pastoral italic note | Serif italic | 13.5px | normal | 400 | 1.45 |
| Greeting eyebrow | Mono uppercase | 9.5px | 0.18em | 600 | 1.00 |
| Section eyebrow | Mono uppercase | 11px | 0.16em | 700 | 1.00 |
| Pill/status | Mono uppercase | 9.5px | 0.12em | 600 | 1.00 |
| Form label | Mono uppercase | 9.5px | 0.14em | 600 | 1.00 |
| Index numeral | Mono | 11px | 0.04em | 600 | 1.00 |
| Body sans | Sans | 13–13.5px | normal | 400–500 | 1.50–1.55 |
| Meta sans | Sans | 11.5–12px | normal | 500 | 1.40 |
| Person name | Sans | 14.5px | -0.005em | 600 | 1.20 |
| Task title | Sans | 14px | -0.005em | 500 | 1.35 |
| Button label | Sans | 13.5px | 0.005em | 600 | 1.00 |
| Header title | Sans | 14px | -0.005em | 600 | 1.10 |
| Header role chip | Mono uppercase | 9px | 0.16em | 500 | 1.10 |

Global text rules:

```css
html {
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}

.v2-serif-title,
.v2-module-title,
.v2-card-heading {
  text-wrap: pretty;
}
```

---

## 7. Layout and Spacing Rules

### Frame

- Design reference width: `390px`.
- Production width: responsive mobile-first layout.
- The app fills the safe viewport.
- Do not add desktop-first layout assumptions in the MVP.

### Outer margins

- Page horizontal padding: `20px`.
- Greeting horizontal padding: `20px`.
- Section labels and modules align to the same 20px rhythm.

### Vertical rhythm

| From → To | Gap |
|---|---:|
| Header bottom → Greeting top | 16px |
| Greeting bottom → first module | 18px |
| Section label bottom → first card | 10px |
| Module → next section label | 22px |
| Card → card inside same section | 10px |
| Last scrollable element → bottom nav | 30px tail + 96px scroll padding |

### Module padding

| Module | Padding |
|---|---:|
| Standard card | 18px |
| ReminderCard | 18px |
| Notice | 18px |
| Word | 20px |
| EventCard | 18px |
| More index list | 4px 20px |

### Internal row spacing

- PersonRow, TaskRow, MemberRow, and IndexRow use vertical padding around `13–14px`.
- Do not use `<hr>` for row separators.
- Use an inset hairline: `box-shadow: inset 0 1px 0 var(--rule)` on every row after the first.

---

## 8. Header Rules

The header is `V2Head` and is identical across screens.

### Composition

1. Logo mark:
   - 30 × 30px.
   - Radius: `8px` inside the 12px input radius family.
   - Background: `--primary`.
   - Contains `logo-white.svg` at roughly 20px wide.
2. Identity stack:
   - Line 1: `SaltCity Central` or `SaltCity Church`.
   - Line 2: role and short user name, e.g. `COMPANY LEADER · Bola A.`
3. Actions:
   - Bell/notification icon.
   - More/overflow icon or logout icon, depending on current product affordance.
   - 32 × 32px hit area.
   - Radius: `10px`.

### Hard rules

- One identity line only.
- Do not stack `SaltCity Central / Bola Company Leader / Company Leader / Company Alpha`.
- Do not replace the SaltCity mark with a profile photo.
- Do not add notification count badges by default. If needed, use one small dot.
- Header does not need to be sticky in the MVP.

---

## 9. Bottom Navigation Rules

The bottom nav is `V2Nav`: a typographic pill-rail.

### Items

Use five items:

```txt
Home · Report · Care · Tasks · More
```

Do not rename them to generic admin labels like `Dashboard`, `Reports`, `Follow-up`, unless the product naming decision changes across the whole app. In UI language, use **Care** instead of **Follow-up** where the route can remain `/follow-up`.

### Shape

- Outer wrapper fixed or absolute at the bottom of the app frame.
- Inner rail:
  - background `--surface`
  - radius `--r-pill`
  - padding `6px`
  - shadow `--shadow-lift`
- Active item:
  - background `--ink`
  - colour `--bg`
  - pill radius
- Icon + label, but keep the label readable.
- The nav may use lucide-style stroke icons, 1.6–1.8 stroke width.

### Safe-area rule

- Scroll region gets `padding-bottom: 96px`.
- Bottom nav padding bottom includes `env(safe-area-inset-bottom)`.
- Content must never disappear under the nav.

---

## 10. Component System

All V2 screens should be built from this toolkit.

### Chrome

- `V2Head` — app header.
- `V2Nav` — bottom navigation.
- `V2Greeting` — eyebrow + serif title + serif italic subtitle.
- `V2Sect` — mono uppercase section label + optional right action.

### Display modules

- `Word` — scripture / leadership word.
- `ReminderCard` — operational hero module.
- `Notice` — official notice module.
- `NoticeUrgent` — urgent official notice.
- `EventCard` — event preview.
- `DateTile` — month/day/date tile.
- `CompanyHero` — company overview.
- `AuthorityBlock` — dark urgent/pastoral directive block.

### List rows

- `PersonRow` — avatar + name + sub + optional note + pill.
- `TaskRow` — check + task title + meta line.
- `IndexRow` — numbered More-page row.
- `MemberRow` — compact member row.

### Primitives

- `Pill`
- `Avatar`
- `Check`
- `MemberChip`
- `Counter`
- `Progress`
- `StepRail`
- `Field`
- `Button`

### Legacy component rule

For the V2 redesign, do not use generic Card/Tile/Box patterns as the final design language.

The current repo may already have legacy `Card` usage. Replace legacy Card usage progressively during the V2 migration. Do not create a new generic `Card` abstraction for the V2 system unless it is only an internal surface primitive used by named V2 modules.

---

## 11. Status System

Statuses use background, label text, and clear wording. Never rely on colour alone.

| Conceptual state | Pill tone | Labels |
|---|---|---|
| Urgent / Flagged | urgent | `Urgent`, `Flagged` |
| Care active / Submitted / Assigned / In progress | care | `Care`, `Assigned`, `Submitted`, `In progress`, `General notice` |
| Reviewed / Resolved / Done | ok | `Reviewed`, `Resolved`, `Done` |
| Missing / Open / Archived / Read-only | quiet | `Missing`, `Open`, `Archived`, `Read-only`, `Soon` |

Rules:

- A row may show at most one pill.
- Extra state moves to subtext, not another pill.
- No new pill tones without updating this document.
- The check shape may carry done state, but the task row still needs text clarity.

---

## 12. Screen-by-Screen Rules

Every screen follows:

```txt
Header → Greeting → modules → tail spacer → Bottom nav
```

### 12.1 Dashboard — Company Leader

Framing: warm leadership briefing.

Order:

1. `V2Greeting`
   - eyebrow: current date
   - title: `Good evening, <em>Bola.</em>`
   - subtitle: one short pastoral-operational sentence.
2. `Word`
   - weekly scripture or leadership word.
3. `V2Sect("This week")` → `ReminderCard`
   - report state
   - progress
   - primary action: Continue / Open report
   - secondary action: Later / View draft when useful
4. `V2Sect("People to remember", action="See all care")`
   - 2–3 `PersonRow` previews.
5. `V2Sect("Small things to close", action="All tasks")`
   - 2–4 `TaskRow`s.
6. `V2Sect("Sunday is coming")`
   - next service/event via `EventCard`.
7. `V2Sect("From the desk")`
   - latest notice via `Notice`.

Do not turn this screen into a grid of links.

### 12.2 Dashboard — Church Admin

Framing: operations briefing across leadership.

Order:

1. `V2Greeting`
   - title: `Good evening, <em>Pastor.</em>` or admin user equivalent.
   - subtitle names the concrete state: missing submissions, urgent care, review queue.
2. `Word`
3. `V2Sect("Reports · Week 21")` → `ReminderCard`
   - submission progress
   - reviewed/submitted/flagged/missing counts
   - Review queue action
   - Nudge missing action when available
4. `V2Sect("Missing submissions")`
   - rows for late companies.
5. `V2Sect("Urgent care")`
   - `AuthorityBlock` when urgent care exists.
6. `V2Sect("Admin checklist")`
   - task preview.
7. `V2Sect("From the desk")`
   - urgent Notice first, otherwise accent Notice.

### 12.3 Reports — Draft

Framing: guided weekly submission flow.

Order:

1. `V2Greeting`
   - eyebrow: `Weekly Report · Week ## · Date range`
   - title: `Company Alpha <em>draft.</em>`
   - subtitle: `Three quiet steps. Tap absent members, add notes, submit.`
2. `StepRail`
   - `1 Attendance · 2 Notes · 3 Submit`
3. `V2Sect("Step 1 · Attendance", action="14 members")`
   - Counter row: Present / Absent / Visitors
   - Pastoral instruction: everyone is present by default.
   - Marked absent: `MemberChip` absent state
   - Present by default: default `MemberChip`s
4. `V2Sect("Step 2 · Notes")`
   - visitor count
   - general notes
   - support needed
   - testimonies
5. Submit row:
   - secondary: Save progress
   - primary: Submit report
6. Footer:
   - autosave time / report window note when implemented.

Rules:

- Attendance defaults to present.
- The leader marks only absentees.
- Do not make this page feel like manual database entry.
- Do not block submission on optional notes unless business logic already requires it.

### 12.4 Reports — Reviewed / Submitted

Framing: read-only confirmation.

Order:

1. `V2Greeting`
   - title: `Company Alpha — <em>reviewed.</em>` or submitted equivalent.
2. Inline `Pill(ok)` or `Pill(care)`.
3. `V2Sect("Submission record")`
   - submitted date
   - reviewed date/person if available
   - report week
   - status
4. `V2Sect("Attendance")`
   - Present / Absent / Visitors counters
   - absentee records list
5. `V2Sect("Notes from the week")`
   - general notes
   - support
   - testimonies

No edit, delete, or resubmit controls on reviewed reports.

### 12.5 Admin Reports Overview

Framing: weekly submission progress.

Order:

1. `V2Greeting`
2. `ReminderCard`
   - overall progress
   - reviewed/submitted/flagged/missing counts
3. `V2Sect("Needs your attention", action="Nudge all")`
   - flagged and missing rows
   - actions: Review now / Send nudge / Open
4. `V2Sect("Awaiting review")`
   - submitted company reports
5. `V2Sect("Reviewed this week")`
   - compact reviewed list.

### 12.6 Follow-up Care

Framing: pastoral care operations.

Order:

1. `V2Greeting`
   - title: `Care for your <em>absent members.</em>`
2. Soft counter strip:
   - Active / Urgent / Resolved
3. `V2Sect("Urgent · please look first")`
   - `AuthorityBlock`
   - person name
   - context
   - last contact narrative
   - actions: Update case / Hand to pastor
4. `V2Sect("Assigned to you", action="Open all")`
   - card with assigned cases
   - next action
   - pastoral note
   - update controls
5. `V2Sect("Resolved · with thanks")`
   - resolved history rows.

Language must remain pastoral. Avoid ticketing words.

### 12.7 Tasks

Framing: leadership checklist.

Order:

1. `V2Greeting`
   - title: `Five to close <em>this week.</em>`
2. Counter strip:
   - Total / High prio / Done
3. Sections:
   - Today
   - This week
   - Done
4. Rows:
   - `TaskRow`
   - circular check
   - task title
   - company/context
   - status/priority text

Done items use filled `Check` and text strikethrough.

### 12.8 Announcements

Framing: official notice board.

Order:

1. `V2Greeting`
   - title: `From the desk.`
2. Urgent featured notice when present:
   - `NoticeUrgent`
   - title, body, audience, expiry, acknowledge action.
3. `V2Sect("Active notices")`
   - stacked notices with hairline separation.
4. `V2Sect("Archive")`
   - compact archived notices.

Long notice body uses sans text for readability.

### 12.9 Events

Framing: service and leadership calendar.

Order:

1. `V2Greeting`
   - title: `Services & gatherings.`
2. `V2Sect("Regular schedule")`
   - rows for Sunday / Wednesday / Friday or actual church rhythms.
3. `V2Sect("Upcoming")`
   - EventCards with DateTiles.
   - First upcoming event may use dark DateTile.

### 12.10 Companies

Framing: member and leadership directory.

Order:

1. `V2Greeting`
   - title: company name.
2. `CompanyHero`
   - descriptor
   - members
   - attendance
   - care cases
3. `V2Sect("Leadership")`
   - leader and assistant rows.
4. `V2Sect("Members", action="12 active")`
   - MemberRows.
5. Admin-only add-member affordance where already supported.

Company leaders see read-only company visibility.

### 12.11 More

Framing: index.

Order:

1. `V2Greeting`
   - title: `Everything else.`
2. `V2Sect("Available")`
   - IndexRows for Announcements, Events, Companies, Care archive, Reports archive.
3. `V2Sect("Coming soon", action="Not yet available")`
   - tinted surface
   - quiet Soon pills
4. `V2Sect("Settings")`
   - Notifications
   - Display & language
   - Account & access
   - About SaltCity
5. Sign out action.
6. Small footer tagline.

---

## 13. Form and Interaction Rules

### Inputs

- Use `Field` for all inputs and textareas.
- Label sits above input in mono uppercase.
- Input background: `--bg`.
- Focus: stronger inset rule using `--ink`.
- Placeholder copy uses serif italic.
- Numeric fields use `inputmode="numeric"` where possible.

### Buttons

- Primary action uses `Button` variant `primary` or `ink` depending on surrounding surface.
- Secondary action uses `soft`.
- Destructive actions are rare and use text treatment in `--status-urgent`, not a loud red block.
- Button labels must be action-specific:
  - `Continue report`
  - `Submit report`
  - `Save progress`
  - `Update case`
  - `Mark contacted`
  - `Acknowledge`

### Interaction

- No modal confirmations in the MVP.
- No toast popovers.
- State changes are shown inline.
- Optimistic updates are acceptable for low-risk controls such as task checks and contact marks, but the server remains the source of truth.

---

## 14. Empty State Rules

Empty states are full-width and sit inside the relevant section.

Rules:

- No illustrations.
- No mascots.
- No decorative empty SVGs.
- Use one centered serif italic line.
- Optional one soft button below it.

Examples:

- Care: `No active care cases this week. Give thanks.`
- Tasks: `Nothing pressing. Rest is part of the work.`
- Announcements: `No notices today.`
- Members: `This company has no members yet.`

Use the same card surface the section would normally use. Do not switch to a novelty treatment.

---

## 15. Error and Success Notice Rules

There are two notice surfaces:

1. Inline form/module notices.
2. Transient banners below the header.

### Field errors

- Input inset rule becomes `--status-urgent`.
- Helper text:
  - sans
  - 12px
  - `--status-urgent`
  - short and human.
- Do not prefix helper text with an icon by default.

### Module errors

- Use an in-place serif italic line in `--status-urgent`.
- Add a soft retry button if action is available.
- Do not use modal overlays.

### Transient banners

- Appear below header.
- Full width.
- Height around 48px.
- Radius 0.
- Success:
  - background `--status-ok-bg`
  - text `--status-ok`
- Error:
  - background `--status-urgent-bg`
  - text `--status-urgent`
- Auto-dismiss after 4 seconds when technically feasible.
- Never cover the bottom nav or urgent content.

---

## 16. Accessibility and Mobile Usability Rules

### Contrast

- Ink on page and surface must meet WCAG AA.
- Status pills must be readable at small sizes.
- `--ink-4` is reserved for decorative/non-essential metadata.
- Test new colour combinations before shipping.

### Touch targets

- Minimum interactive target: 44 × 44px.
- Buttons inside cards should have at least 12px vertical padding.
- Icon-only buttons need an accessible label.

### Text and language

- Copy should be calm, pastoral, direct.
- Avoid clinical product terms in user-facing text.
- Use people's names when available.
- Avoid vague copy like `record updated`.
- Prefer `Care note saved.` or `Report review saved.`

### Motion

- Keep motion subtle.
- Active nav pill can animate in 150ms.
- No bouncy, playful, or heavy transitions.

---

## 17. Implementation Notes for the Existing Next.js + Tailwind Repo

### Scope

This repo already uses a `src/` project structure. Adapt all suggested file paths to the existing structure.

Do not create a parallel root-level `app/` directory.

Suggested production structure:

```txt
src/
  app/
    layout.tsx
    dashboard/page.tsx
    reports/page.tsx
    follow-up/page.tsx
    tasks/page.tsx
    announcements/page.tsx
    events/page.tsx
    companies/page.tsx
    more/page.tsx
  components/
    v2/
      chrome/
        V2Head.tsx
        V2Nav.tsx
        V2Greeting.tsx
        V2Sect.tsx
      modules/
        Word.tsx
        ReminderCard.tsx
        Notice.tsx
        EventCard.tsx
        DateTile.tsx
        CompanyHero.tsx
        AuthorityBlock.tsx
      rows/
        PersonRow.tsx
        TaskRow.tsx
        IndexRow.tsx
        MemberRow.tsx
      primitives/
        Pill.tsx
        Avatar.tsx
        Check.tsx
        MemberChip.tsx
        Counter.tsx
        Progress.tsx
        StepRail.tsx
        Field.tsx
        Button.tsx
  styles/
    globals.css
```

If the actual repo already has different folders, adapt without changing the route architecture.

### Tailwind mapping

Map tokens to Tailwind through CSS variables.

```ts
theme: {
  extend: {
    colors: {
      bg: 'var(--bg)',
      'bg-tint': 'var(--bg-tint)',
      'bg-deep': 'var(--bg-deep)',
      surface: 'var(--surface)',
      'surface-2': 'var(--surface-2)',
      ink: 'var(--ink)',
      'ink-2': 'var(--ink-2)',
      'ink-3': 'var(--ink-3)',
      'ink-4': 'var(--ink-4)',
      primary: 'var(--primary)',
      'primary-ink': 'var(--primary-ink)',
      'primary-soft': 'var(--primary-soft)',
      warm: 'var(--warm)',
      'warm-soft': 'var(--warm-soft)',
      calm: 'var(--calm)',
      'calm-soft': 'var(--calm-soft)',
      urgent: 'var(--status-urgent)',
      'urgent-bg': 'var(--status-urgent-bg)',
      care: 'var(--status-care)',
      'care-bg': 'var(--status-care-bg)',
      ok: 'var(--status-ok)',
      'ok-bg': 'var(--status-ok-bg)',
      quiet: 'var(--quiet)',
      'quiet-bg': 'var(--quiet-bg)',
    },
    borderRadius: {
      input: 'var(--r-input)',
      card: 'var(--r-card)',
      pill: 'var(--r-pill)',
    },
    boxShadow: {
      lift: 'var(--shadow-lift)',
    },
    fontFamily: {
      serif: ['Newsreader', 'Georgia', 'serif'],
      sans: ['Public Sans', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
    letterSpacing: {
      eyebrow: '0.18em',
      section: '0.16em',
      pill: '0.12em',
      label: '0.14em',
    },
  },
}
```

### Theme root

Read the selected theme on the server when possible and apply:

```tsx
<html className={theme === "calm-teal" ? "theme-calm-teal" : "theme-warm-berry"}>
```

Warm Berry is the fallback.

### Reference files

If present, place design-export files under:

```txt
docs/design-references/
  SaltCity-Briefing.html
  styles-v2.css
  components-v2.jsx
  screens-v2.jsx
  screens-v2b.jsx
  warm-berry-screens/
  calm-teal-screens/
```

These files are references only. Do not import them into `src/`.

### PWA notes

- Manifest name: `SaltCity Leadership`.
- Short name: `SaltCity`.
- Theme colour for default: `#6E2A40`.
- Background colour: `#F3EADC`.
- Any offline/installation work is secondary to the MVP visual migration unless already planned.

---

## 18. What Must Not Be Changed By Implementation Agents

If a build agent has questions about anything in this list, stop and ask.

- Do not add new themes.
- Do not rename token names.
- Do not replace `html.theme-warm-berry` / `html.theme-calm-teal` with `.pal-a` / `.pal-b` in production code.
- Do not change the approved typography families.
- Do not add new radii.
- Do not add new shadow tiers.
- Do not turn dashboard into a list of navigation cards.
- Do not use repeated `Open X →` cards as the main pattern.
- Do not use generic Card/Tile/Box as the final V2 design language.
- Do not remove the pastoral tone from care, reports, or tasks.
- Do not add modals/toasts as the primary feedback system.
- Do not use colour alone for status.
- Do not introduce emoji or decorative illustrations.
- Do not make the bottom nav hide on scroll.
- Do not let content sit under the bottom nav.
- Do not change Supabase schema, RLS, server actions, permissions, routes, or business logic as part of a visual migration unless a build error makes a tiny typed adjustment unavoidable.

---

## 19. Migration Strategy

Implement the design in controlled passes.

### Pass 1 — V2 foundation

- Add theme tokens.
- Load fonts.
- Add Tailwind mappings.
- Add V2 primitives.
- Add V2 chrome.
- Apply V2 shell to the dashboard only.

### Pass 2 — Dashboard

- Rebuild company leader dashboard from the design system.
- Rebuild church admin dashboard from the design system.
- Keep existing queries and business logic.

### Pass 3 — Reports

- Apply V2 report draft flow.
- Apply V2 reviewed/submitted read-only view.
- Apply V2 admin reports overview.
- Do not change report submission logic.

### Pass 4 — Care and Tasks

- Apply V2 care queue.
- Apply V2 task checklist.
- Keep existing update actions and RLS.

### Pass 5 — Secondary screens

- Announcements.
- Events.
- Companies.
- More.

### Pass 6 — Theme switch

- Add Calm Teal toggle only after Warm Berry is visually stable.
- Keep the fallback as Warm Berry.

---

## 20. Final Product Rule

The app is not trying to feel like software first.

It should feel like a calm, beautiful, practical companion for church leaders who need to remember people, close reports, care for absentees, and keep the weekly rhythm moving.

Functionality must stay fast. The interface must stay warm.
