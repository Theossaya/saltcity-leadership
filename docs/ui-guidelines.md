# UI Guidelines

## Product Feel

The final visual direction is **Premium Pastoral Operations**.

The app should feel like a private leadership command center with premium pastoral warmth. It should combine mobile banking clarity, editorial restraint, and operational urgency. The interface must feel polished, intentional, and specific to leadership operations, not weakly vibe-coded.

It should not look like:

- A public church website.
- A church flyer.
- A colourful ministry poster.
- A generic SaaS dashboard.
- A soft bulletin board.
- An over-decorated church app.

Leaders should be able to open the app and immediately understand what needs attention, what has already been handled, and what action they personally need to take next.

## Visual Direction

- Use a warm off-white app background.
- Use white or near-white cards.
- Use deep charcoal text for primary content.
- Use muted text for secondary information.
- Use one restrained deep accent: plum-black, deep navy, or charcoal-teal.
- Do not use gold or orange religious styling.
- Do not use loud gradients.
- Do not use stock church imagery.
- Do not use decorative hero sections.
- Do not use cluttered mobile tables.

Preferred palette:

- Background: `#F6F1EB` or `#F4F1EC`
- Surface: `#FFFFFF` or `#FBFAF8`
- Text: `#151217`
- Muted text: `#6E6763`
- Primary accent: `#241126` or `#2A1630`
- Secondary accent: `#0E1A2B` or `#102033`
- Border: `#E4DDD5`

## Mobile First

- Design for small screens first.
- Prioritize one clear primary action per screen.
- Keep forms short and grouped by task.
- Touch targets should be at least `44px` high, preferably `48px`.
- Use large buttons for primary actions.
- Avoid tiny icon-only controls unless they have generous padding.
- Keep navigation simple and predictable.
- Bottom navigation must feel app-like and thumb-friendly.
- Ensure report submission can be completed quickly during or after church activities.
- Use lists and cards instead of dense tables on mobile.

## Core Screens

Important MVP screens include:

- Login
- Company dashboard
- Weekly report form
- Absentee entry
- Follow-up list
- Task details
- Announcements
- Documents
- Admin overview

## Dashboard Structure

The dashboard should answer: **What needs my attention?**

- Start with one strong `What needs attention?` section.
- Use one primary attention card, then three or four supporting operational cards.
- Avoid showing too many equal cards at once.
- Prioritize the next action over raw metrics.
- For company leaders, focus on report status, absentees, follow-up, tasks, and the latest announcement.
- For admins, focus on submitted and missing reports, urgent follow-up, assigned tasks, and announcement reach.

## Interaction Principles

- Make the next operational step obvious.
- Use clear status labels such as `Draft`, `Submitted`, `Pending`, `Assigned`, and `Completed`.
- Confirm successful submissions and task completion.
- Avoid dense tables on mobile; use lists, cards, and detail views.
- Keep announcements plain text in the MVP.
- Do not introduce rich text editing unless explicitly added to scope.

## Component Principles

- Use shadcn/ui components where possible.
- Use Tailwind consistently.
- Prefer cards, lists, badges, separators, alerts, and simple forms.
- Use subtle shadows only.
- Use clear status badges.
- Keep spacing, typography, and button styles consistent.
- Use restrained color to communicate status and priority.
- Prefer simple layouts over decorative components.
- Keep pages visually consistent with AppShell.
- Design around repeat weekly use by busy leaders.
- Do not invent a new visual system without approval.

## Typography

Galano Grotesque is the primary app font. Use it with restraint, strong spacing, and a clear hierarchy so the interface feels specific to SaltCity while remaining calm and operational.

Use 400, 500, 600, and 700 weights only.

Avoid heavy decorative typography. Do not use serif-heavy editorial UI. Editorial confidence should come from spacing, contrast, hierarchy, and clear composition rather than decorative font choices.

## Screen Mood

- Dashboard: `What needs my attention?`
- Reports: guided, calm, and focused.
- Follow-up: private, sensitive, but operational.
- Tasks: clear and action-oriented.
- Admin views: structured and not overwhelming.

## Reference Direction

Use the fourth Stitch direction as the structural base. Borrow controlled editorial confidence from the third direction. Avoid the overly soft bulletin feeling of the first direction, and avoid the generic rectangular admin feel of the second direction.
