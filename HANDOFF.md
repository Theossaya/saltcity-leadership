# SaltCity Leadership PWA — Full Build Handoff

> **For:** Claude Code
> **Date:** June 11, 2026
> **This is a fresh build from scratch.** No existing codebase.
> Read `CLAUDE.md` first for product context, then `SCHEMA.md` for the database, then this file for implementation.

---

## 0. What You Are Building

A mobile-first PWA for SaltCity Church leadership operations. Six core workflows: weekly reports, absentee follow-up, tasks, announcements, events, company/member management.

Design is fully approved — see `SaltCity Final.html` as the pixel reference and `DESIGN.md` for the full spec.

---

## 1. Project Initialisation

```bash
# Create Next.js project
npx create-next-app@latest saltcity-leadership \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd saltcity-leadership

# Install dependencies
npm install @supabase/ssr @supabase/supabase-js
npm install next-pwa
npm install -D @types/node
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 2. File Structure

```
src/
  app/
    layout.tsx                    ← root layout, fonts, metadata
    middleware.ts                 ← Supabase session refresh + auth guard
    (auth)/
      login/
        page.tsx                  ← Login screen
        actions.ts                ← signIn, signOut server actions
    (app)/
      layout.tsx                  ← AppShell (Header + BottomNav)
      page.tsx                    ← Dashboard (leader or admin based on role)
      report/
        page.tsx                  ← Report draft / submitted
        actions.ts                ← saveDraft, submitReport
      care/
        page.tsx                  ← Follow-up (leader = assigned, admin = queue)
        [id]/
          page.tsx                ← Single case detail
        actions.ts                ← assignCase, recordContact, resolveCase
      tasks/
        page.tsx
        actions.ts                ← createTask, toggleTask, deleteTask
      more/
        page.tsx                  ← More index
        announcements/
          page.tsx
          [id]/page.tsx
          actions.ts              ← createAnnouncement (admin)
        events/
          page.tsx
          actions.ts              ← createEvent (admin)
        companies/
          page.tsx
          [id]/
            page.tsx
            actions.ts            ← addMember, removeMember (admin)
        settings/
          page.tsx

  components/
    ui/
      AppHeader.tsx
      BottomNav.tsx
      Greeting.tsx
      SectionLabel.tsx
      Hero.tsx
      Row.tsx
      Avatar.tsx
      StatusDot.tsx
      Button.tsx
      Field.tsx
      MemberGrid.tsx
      Stepper.tsx
      Notice.tsx
      EventRow.tsx
      Check.tsx
      Skeleton.tsx
      FeedbackBanner.tsx
    report/
      ReportHero.tsx
      AttendanceSection.tsx
      VisitorSection.tsx
      NotesSection.tsx
    care/
      CaseCard.tsx
      CaseQueue.tsx
    admin/
      ReportQueue.tsx

  lib/
    supabase/
      server.ts
      client.ts
      middleware.ts
    database.types.ts             ← generated from Supabase
    utils.ts                      ← week helpers, date formatting
    auth.ts                       ← getSession, getProfile helpers

  styles/
    globals.css                   ← tokens + base styles

public/
  manifest.json
  logo.svg
  logo-white.svg
  icons/
    icon-192.png
    icon-512.png
    icon-maskable.png
  sw.js                           ← service worker (via next-pwa)
```

---

## 3. Globals & Tokens

### src/styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg:           #F4EFE8;
  --bg-2:         #EAE3D8;
  --surface:      #FFFFFF;
  --surface-warm: #FBEEE3;
  --surface-calm: #E4ECE7;

  --ink:          #241A21;
  --ink-2:        #5A4E55;
  --ink-3:        #968A90;
  --ink-4:        #C7BFC2;
  --rule:         rgba(36,26,33,0.07);
  --rule-strong:  rgba(36,26,33,0.14);

  --primary:      #6B2540;
  --primary-ink:  #FFEFE2;
  --primary-soft: #E6BDC7;
  --accent:       #E2674A;
  --accent-soft:  #F9D6C9;
  --calm:         #4C8579;
  --calm-soft:    #C9DED8;
  --gold:         #B4853E;

  --urgent:       #B23A48;
  --urgent-bg:    #F6DCDD;
  --care:         #A96E26;
  --care-bg:      #F4E6CC;
  --ok:           #4C8579;
  --ok-bg:        #D5E5DF;

  --r-input:      13px;
  --r-card:       18px;
  --r-pill:       999px;

  --shadow-lift:  0 1px 2px rgba(36,26,33,0.03), 0 10px 24px -20px rgba(36,26,33,0.22);
  --shadow-hero:  0 22px 48px -30px rgba(107,37,64,0.42);
}

* { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans), system-ui, sans-serif;
  letter-spacing: -0.006em;
}

/* Active scale feedback on all buttons */
button:active { transform: scale(0.985); transition: transform 60ms ease; }

/* Skeleton pulse */
@keyframes pulse-opacity {
  0%, 100% { opacity: 0.45; }
  50%       { opacity: 0.85; }
}
.sc-skel {
  background: var(--bg-2);
  border-radius: 8px;
  animation: pulse-opacity 1.4s ease-in-out infinite;
}
```

### tailwind.config.ts

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:             'var(--bg)',
        'bg-2':         'var(--bg-2)',
        surface:        'var(--surface)',
        'surface-warm': 'var(--surface-warm)',
        'surface-calm': 'var(--surface-calm)',
        ink:            'var(--ink)',
        'ink-2':        'var(--ink-2)',
        'ink-3':        'var(--ink-3)',
        'ink-4':        'var(--ink-4)',
        primary:        'var(--primary)',
        'primary-ink':  'var(--primary-ink)',
        'primary-soft': 'var(--primary-soft)',
        accent:         'var(--accent)',
        'accent-soft':  'var(--accent-soft)',
        calm:           'var(--calm)',
        'calm-soft':    'var(--calm-soft)',
        urgent:         'var(--urgent)',
        'urgent-bg':    'var(--urgent-bg)',
        care:           'var(--care)',
        'care-bg':      'var(--care-bg)',
        ok:             'var(--ok)',
        'ok-bg':        'var(--ok-bg)',
      },
      borderRadius: {
        input: 'var(--r-input)',
        card:  'var(--r-card)',
        pill:  'var(--r-pill)',
      },
      boxShadow: {
        lift: 'var(--shadow-lift)',
        hero: 'var(--shadow-hero)',
      },
      fontFamily: {
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 4. Root Layout & Fonts

### src/app/layout.tsx

```tsx
import type { Metadata } from 'next'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import '@/styles/globals.css'

const sans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
})

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SaltCity Leadership',
  description: 'Pastoral operations companion for SaltCity church leadership',
  manifest: '/manifest.json',
  themeColor: '#6B2540',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'SaltCity' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

## 5. Auth & Middleware

### src/middleware.ts

```ts
import { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico|webp)).*)'],
}
```

### src/lib/auth.ts

```ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from './database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function requireAuth(): Promise<{ userId: string; profile: Profile }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  return { userId: user.id, profile }
}

export function isAdminOrOffice(role: Profile['role']) {
  return role === 'church_admin' || role === 'church_office'
}
```

### src/app/(auth)/login/actions.ts

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = createClient()
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

---

## 6. App Shell

### src/app/(app)/layout.tsx

```tsx
import { requireAuth } from '@/lib/auth'
import AppHeader from '@/components/ui/AppHeader'
import BottomNav from '@/components/ui/BottomNav'

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAuth()

  return (
    <div className="relative flex flex-col h-[100dvh] bg-bg overflow-hidden max-w-[430px] mx-auto">
      <AppHeader
        role={profile.role}
        name={profile.full_name.split(' ')[0]}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[92px] [-webkit-overflow-scrolling:touch]">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

---

## 7. Core UI Components

All components read from CSS custom properties via Tailwind tokens. Build in this order.

### AppHeader

```tsx
// src/components/ui/AppHeader.tsx
import Image from 'next/image'

interface Props {
  role: string
  name: string
  hasNotif?: boolean
}

const roleLabel: Record<string, string> = {
  company_leader:   'Company Leader',
  assistant_leader: 'Assistant Leader',
  church_admin:     'Church Admin',
  church_office:    'Church Office',
}

export default function AppHeader({ role, name, hasNotif }: Props) {
  return (
    <header className="flex items-center gap-3 px-5 py-4 bg-bg z-10 relative">
      <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center flex-shrink-0"
           style={{ boxShadow: '0 5px 14px -8px rgba(107,37,64,0.6)' }}>
        <Image src="/logo-white.svg" alt="SaltCity" width={21} height={21}/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-semibold text-ink leading-tight tracking-[-0.014em]">
          SaltCity Central
        </div>
        <div className="text-[11.5px] text-ink-3 mt-0.5 tracking-[-0.004em]">
          <span className="font-semibold text-ink-2">{roleLabel[role] ?? role}</span>
          {' · '}{name}
        </div>
      </div>
      <div className="flex gap-0.5">
        <button className="w-9 h-9 rounded-[11px] flex items-center justify-center text-ink-2
                           hover:bg-bg-2 transition-colors relative"
                aria-label="Notifications">
          <BellIcon />
          {hasNotif && (
            <span className="absolute top-[7px] right-[9px] w-[7px] h-[7px] rounded-full bg-urgent
                             border-2 border-bg"/>
          )}
        </button>
        <button className="w-9 h-9 rounded-[11px] flex items-center justify-center text-ink-2
                           hover:bg-bg-2 transition-colors"
                aria-label="More options">
          <DotsIcon />
        </button>
      </div>
    </header>
  )
}
```

### BottomNav

```tsx
// src/components/ui/BottomNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { id: 'home',   href: '/',            label: 'Home',   Icon: HomeIcon   },
  { id: 'report', href: '/report',      label: 'Report', Icon: DocIcon    },
  { id: 'care',   href: '/care',        label: 'Care',   Icon: HeartIcon  },
  { id: 'tasks',  href: '/tasks',       label: 'Tasks',  Icon: CheckIcon  },
  { id: 'more',   href: '/more',        label: 'More',   Icon: DotsIcon   },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="absolute bottom-0 left-0 right-0 px-4 pointer-events-none z-20"
         style={{ paddingBottom: 'calc(18px + env(safe-area-inset-bottom))' }}>
      {/* fade gradient */}
      <div className="absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-b from-transparent to-bg pointer-events-none"/>
      <div className="relative flex bg-surface rounded-pill p-[5px] pointer-events-auto
                      border border-[var(--rule)]"
           style={{ boxShadow: 'var(--shadow-lift)' }}>
        {tabs.map(({ id, href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={id} href={href}
                  className={`flex-1 flex flex-col items-center justify-center gap-[3px]
                              py-[7px] rounded-pill text-[10px] font-medium
                              transition-colors duration-150
                              ${active ? 'text-primary' : 'text-ink-3'}`}
                  aria-current={active ? 'page' : undefined}>
              <Icon className="w-[19px] h-[19px]" />
              <span className="truncate max-w-full">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

### Greeting

```tsx
// src/components/ui/Greeting.tsx
interface Props {
  day?: string
  children: React.ReactNode   // MUST be JSX — never pass HTML string
}

export default function Greeting({ day, children }: Props) {
  return (
    <div className="px-5 pt-2 pb-1">
      {day && <div className="text-[12px] text-ink-3 mb-1.5 tracking-[-0.004em]">{day}</div>}
      <h1 className="text-[26px] font-medium leading-[1.08] tracking-[-0.026em] text-ink m-0
                     [&_em]:font-serif [&_em]:italic [&_em]:font-normal [&_em]:text-primary
                     [&_em]:tracking-[-0.01em] text-balance">
        {children}
      </h1>
    </div>
  )
}
```

### Hero

```tsx
// src/components/ui/Hero.tsx
interface Props {
  label: string
  title: React.ReactNode      // may include <em> for serif italic accent
  meta?: React.ReactNode
  progress?: number           // 0 to 1
  actions: React.ReactNode    // max 2 buttons
}

export default function Hero({ label, title, meta, progress, actions }: Props) {
  return (
    <div className="mx-5 mt-[14px] rounded-card bg-primary text-primary-ink relative overflow-hidden"
         style={{ boxShadow: 'var(--shadow-hero)' }}>
      {/* Coral glow */}
      <div className="absolute -right-10 -top-10 w-[170px] h-[170px] rounded-full bg-accent
                      opacity-30 blur-[26px] z-0 pointer-events-none"/>
      <div className="relative z-10 px-5 py-5">
        <div className="text-[12px] text-primary-soft font-medium mb-2 tracking-[-0.004em]">
          {label}
        </div>
        <div className="text-[20px] font-medium leading-[1.15] tracking-[-0.02em] text-primary-ink
                        text-balance [&_em]:font-serif [&_em]:italic [&_em]:font-normal
                        [&_em]:text-accent-soft">
          {title}
        </div>
        {meta && (
          <div className="text-[12.5px] text-primary-soft mt-3 tracking-[-0.004em]
                          [&_b]:text-primary-ink [&_b]:font-semibold">
            {meta}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-3 h-[5px] bg-white/20 rounded-pill overflow-hidden">
            <div className="h-full bg-accent-soft rounded-pill transition-[width] duration-500"
                 style={{ width: `${progress * 100}%` }}/>
          </div>
        )}
        <div className="flex gap-2 mt-4">{actions}</div>
      </div>
    </div>
  )
}
```

### Row

```tsx
// src/components/ui/Row.tsx
interface Props {
  lead?: React.ReactNode
  title: string
  sub?: React.ReactNode
  tail?: React.ReactNode
  dimmed?: boolean
}

export default function Row({ lead, title, sub, tail, dimmed }: Props) {
  return (
    <li className={`flex gap-[13px] items-center py-[13px] min-h-[52px]
                    ${dimmed ? 'opacity-50' : ''}`}>
      {lead && <div className="flex-shrink-0">{lead}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-ink tracking-[-0.014em]
                        leading-[1.3] truncate">
          {title}
        </div>
        {sub && (
          <div className="text-[12.5px] text-ink-3 mt-0.5 tracking-[-0.004em]
                          flex items-center gap-1.5 flex-wrap leading-[1.35]">
            {sub}
          </div>
        )}
      </div>
      {tail && <div className="flex-shrink-0 flex items-center gap-2 text-ink-4">{tail}</div>}
    </li>
  )
}

// List wrapper — apply hairline separators
export function RowList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={`mx-5 [&>li+li]:border-t [&>li+li]:border-[var(--rule)] ${className ?? ''}`}>
      {children}
    </ul>
  )
}
```

### Avatar

```tsx
// src/components/ui/Avatar.tsx
const sizeMap = { sm: 'w-[30px] h-[30px] text-[11px]', md: 'w-10 h-10 text-[13px]', lg: 'w-[46px] h-[46px] text-[15px]' }
const ringMap = {
  urgent: 'shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--urgent)]',
  care:   'shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--care)]',
  ok:     'shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--ok)]',
}

interface Props { initials: string; size?: 'sm' | 'md' | 'lg'; ring?: 'urgent' | 'care' | 'ok' }

export default function Avatar({ initials, size = 'md', ring }: Props) {
  return (
    <div className={`rounded-full bg-bg-2 text-ink-2 font-semibold flex items-center
                     justify-center flex-shrink-0 ${sizeMap[size]} ${ring ? ringMap[ring] : ''}`}>
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}
```

### StatusDot

```tsx
// src/components/ui/StatusDot.tsx
const toneMap = {
  urgent: 'text-urgent before:bg-urgent',
  care:   'text-care   before:bg-care',
  ok:     'text-ok     before:bg-ok',
}

interface Props { tone?: 'urgent' | 'care' | 'ok'; children: string }

export default function StatusDot({ tone, children }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium
                      before:content-[''] before:w-[7px] before:h-[7px]
                      before:rounded-full before:flex-shrink-0
                      ${tone ? toneMap[tone] : 'text-ink-3 before:bg-ink-3'}`}>
      {children}
    </span>
  )
}
```

### Button

```tsx
// src/components/ui/Button.tsx
import { forwardRef } from 'react'

type Variant = 'berry' | 'ink' | 'light' | 'ghost' | 'onhero' | 'accent'
type Size    = 'sm' | 'md' | 'lg'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  pending?: boolean
  children: React.ReactNode
}

const variantCls: Record<Variant, string> = {
  berry:  'bg-primary text-primary-ink',
  ink:    'bg-ink text-bg',
  light:  'bg-white text-primary font-semibold',
  ghost:  'bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--rule-strong)]',
  onhero: 'bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]',
  accent: 'bg-accent text-white',
}
const sizeCls: Record<Size, string> = {
  sm: 'px-3 py-2 text-[12.5px] rounded-[10px] gap-[5px]',
  md: 'px-4 py-[13px] text-[14px] rounded-[13px]',
  lg: 'px-5 py-[15px] text-[15px] rounded-[14px]',
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'ink', size = 'md', full, pending, className, children, ...rest }, ref
) {
  return (
    <button
      ref={ref}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap
                  font-medium leading-none transition-transform duration-75 active:scale-[0.985]
                  disabled:opacity-60 disabled:pointer-events-none
                  ${variantCls[variant]} ${sizeCls[size]} ${full ? 'w-full' : ''} ${className ?? ''}`}
      {...rest}>
      {children}
    </button>
  )
})
export default Button
```

### Field

```tsx
// src/components/ui/Field.tsx
interface Props {
  label: string
  children: React.ReactNode   // input or textarea
  error?: string
}

export default function Field({ label, children, error }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-ink-2 tracking-[-0.006em]">{label}</label>
      {children}
      {error && <span className="text-[12px] text-urgent font-medium">{error}</span>}
    </div>
  )
}

// Shared input/textarea classes — export as constants so they stay consistent
export const inputCls = `w-full bg-surface border border-[var(--rule-strong)] rounded-input
  px-3.5 py-[13px] text-[15px] text-ink font-normal tracking-[-0.006em] leading-[1.4]
  outline-none focus:border-ink placeholder:text-ink-4`

export const textareaCls = `${inputCls} resize-none min-h-[80px] leading-[1.5] text-[14.5px]`
```

### MemberGrid

```tsx
// src/components/ui/MemberGrid.tsx
'use client'
import { useState } from 'react'

interface Member { id: string; full_name: string }

interface Props {
  members: Member[]
  initialAbsentIds?: string[]
  onChange: (absentIds: string[]) => void
}

export default function MemberGrid({ members, initialAbsentIds = [], onChange }: Props) {
  const [search, setSearch] = useState('')
  const [absent, setAbsent] = useState<Set<string>>(new Set(initialAbsentIds))

  const toggle = (id: string) => {
    const next = new Set(absent)
    next.has(id) ? next.delete(id) : next.add(id)
    setAbsent(next)
    onChange(Array.from(next))
  }

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (name: string) => name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="px-5">
      {/* Search */}
      <div className="flex items-center gap-2 px-3.5 py-[11px] bg-surface rounded-input
                      border border-[var(--rule-strong)] mb-2.5">
        <SearchIcon className="w-4 h-4 text-ink-4 flex-shrink-0"/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members"
          className="flex-1 bg-transparent border-0 outline-none text-[14.5px] text-ink
                     placeholder:text-ink-4 tracking-[-0.006em]"/>
      </div>
      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map(m => {
          const isAbsent = absent.has(m.id)
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isAbsent}
              onClick={() => toggle(m.id)}
              className={`flex items-center gap-2 px-[11px] py-[9px] rounded-[12px]
                          border cursor-pointer text-left transition-all duration-100
                          ${isAbsent
                            ? 'bg-urgent-bg border-transparent'
                            : 'bg-surface border-[var(--rule)]'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center
                                text-[9.5px] font-bold flex-shrink-0
                                ${isAbsent ? 'bg-urgent text-white' : 'bg-bg-2 text-ink-2'}`}>
                {initials(m.full_name)}
              </span>
              <span className={`text-[13px] font-medium truncate tracking-[-0.008em]
                                ${isAbsent ? 'text-urgent' : 'text-ink'}`}>
                {m.full_name.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

### Skeleton

```tsx
// src/components/ui/Skeleton.tsx
interface Props { height?: number; className?: string }

export default function Skeleton({ height = 20, className }: Props) {
  return <div className={`sc-skel ${className ?? ''}`} style={{ height }} aria-hidden/>
}

export function HeroSkeleton() {
  return (
    <div className="mx-5 mt-[14px] rounded-card bg-primary/20 overflow-hidden"
         style={{ height: 160 }}/>
  )
}

export function RowSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="mx-5 space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center py-[13px] border-t border-[var(--rule)]
                                first:border-t-0">
          <Skeleton height={40} className="w-10 rounded-full flex-shrink-0"/>
          <div className="flex-1 space-y-2">
            <Skeleton height={15} className="w-3/4"/>
            <Skeleton height={12} className="w-1/2"/>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### FeedbackBanner

```tsx
// src/components/ui/FeedbackBanner.tsx
'use client'
import { useEffect } from 'react'

interface Props {
  type: 'success' | 'error'
  message: string
  onDismiss: () => void
}

export default function FeedbackBanner({ type, message, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className={`px-5 py-3 text-[13px] font-medium tracking-[-0.004em]
                     ${type === 'success' ? 'bg-ok-bg text-ok' : 'bg-urgent-bg text-urgent'}`}
         role="alert">
      {message}
    </div>
  )
}
```

---

## 8. Server Actions Reference

### Report actions (src/app/(app)/report/actions.ts)

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveDraft(data: {
  reportId?: string
  companyId: string
  weekStart: string
  weekNumber: number
  year: number
  absentIds: string[]
  visitorCount: number
  notes: string
}) {
  const supabase = createClient()
  const { userId } = await requireAuth()

  // Upsert the report
  const { data: report, error } = await supabase
    .from('weekly_reports')
    .upsert({
      id:           data.reportId,
      company_id:   data.companyId,
      submitted_by: userId,
      week_start:   data.weekStart,
      week_number:  data.weekNumber,
      year:         data.year,
      status:       'draft',
      visitor_count: data.visitorCount,
      notes:        data.notes,
    }, { onConflict: 'company_id,week_start' })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Upsert attendance for all members
  const allMembers = await supabase
    .from('members')
    .select('id')
    .eq('company_id', data.companyId)
    .eq('status', 'active')

  if (allMembers.data) {
    await supabase.from('attendance_records').upsert(
      allMembers.data.map(m => ({
        report_id: report.id,
        member_id: m.id,
        present:   !data.absentIds.includes(m.id),
      })),
      { onConflict: 'report_id,member_id' }
    )
  }

  revalidatePath('/report')
  return { reportId: report.id }
}

export async function submitReport(reportId: string) {
  const supabase = createClient()
  await requireAuth()

  const { error } = await supabase
    .from('weekly_reports')
    .update({ status: 'submitted' })
    .eq('id', reportId)

  if (error) return { error: error.message }
  // Trigger fires here (handle_report_submitted) — creates follow-up cases automatically

  revalidatePath('/report')
  revalidatePath('/')
  return { success: true }
}
```

### Follow-up actions (src/app/(app)/care/actions.ts)

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function assignCase(caseId: string, assignTo: string, contextNote?: string) {
  const { profile } = await requireAuth()
  if (!isAdminOrOffice(profile.role)) return { error: 'Unauthorized' }

  const supabase = createClient()
  const { error } = await supabase.from('follow_up_cases').update({
    assigned_to:  assignTo,
    assigned_by:  profile.id,
    status:       'assigned',
    context_note: contextNote,
  }).eq('id', caseId)

  if (error) return { error: error.message }
  revalidatePath('/care')
  return { success: true }
}

export async function recordContact(data: {
  caseId: string
  method: 'called' | 'messaged' | 'visited'
  note?: string
}) {
  const { userId } = await requireAuth()
  const supabase = createClient()

  const { error } = await supabase.from('follow_up_contacts').insert({
    case_id:     data.caseId,
    recorded_by: userId,
    method:      data.method,
    note:        data.note,
  })

  if (error) return { error: error.message }

  // Flip case to active once first contact is made
  await supabase.from('follow_up_cases')
    .update({ status: 'active' })
    .eq('id', data.caseId)
    .eq('status', 'assigned')

  revalidatePath('/care')
  return { success: true }
}

export async function resolveCase(caseId: string) {
  const supabase = createClient()
  await requireAuth()

  const { error } = await supabase.from('follow_up_cases').update({
    status:      'resolved',
    resolved_at: new Date().toISOString(),
  }).eq('id', caseId)

  if (error) return { error: error.message }
  revalidatePath('/care')
  revalidatePath('/')
  return { success: true }
}
```

### Task actions (src/app/(app)/tasks/actions.ts)

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createTask(title: string, dueDate?: string) {
  const { userId } = await requireAuth()
  const supabase = createClient()

  const { error } = await supabase.from('tasks').insert({
    title,
    created_by: userId,
    assigned_to: userId,
    due_date: dueDate,
  })

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}

export async function toggleTask(taskId: string, currentStatus: 'open' | 'done') {
  const supabase = createClient()
  await requireAuth()

  const { error } = await supabase.from('tasks')
    .update({ status: currentStatus === 'open' ? 'done' : 'open' })
    .eq('id', taskId)

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}
```

---

## 9. Page Data Patterns

### Dashboard — Leader (src/app/(app)/page.tsx)

```ts
// Server component — bounded fetches
const { profile } = await requireAuth()

// Only load what the dashboard needs — bounded
const { weekStart, weekNumber, year } = getCurrentWeek()

const [report, followups, nextEvent] = await Promise.all([
  supabase.from('weekly_reports')
    .select('id, status, visitor_count, updated_at')
    .eq('company_id', profile.company_id)
    .eq('week_start', weekStart)
    .maybeSingle(),

  supabase.from('follow_up_cases')
    .select('id, urgency, status, member:members(full_name)')
    .eq('assigned_to', profile.id)
    .in('status', ['assigned', 'active'])
    .order('urgency', { ascending: false })
    .limit(2),

  supabase.from('events')
    .select('id, title, event_date, event_time, location')
    .gte('event_date', weekStart)
    .order('event_date', { ascending: true })
    .limit(1)
    .maybeSingle(),
])
```

### Dashboard — Admin (src/app/(app)/page.tsx — admin branch)

```ts
const [reportSummary, problems, urgentCare, latestNotice] = await Promise.all([
  // How many companies submitted this week
  supabase.from('weekly_reports')
    .select('status')
    .eq('week_start', weekStart),

  // Flagged + missing — bounded at 3
  supabase.from('weekly_reports')
    .select('id, status, company:companies(name), submitted_by:profiles(full_name)')
    .eq('week_start', weekStart)
    .in('status', ['flagged'])
    .limit(3),

  // One urgent care case
  supabase.from('follow_up_cases')
    .select('id, urgency, member:members(full_name), company:companies(name)')
    .eq('status', 'active')
    .eq('urgency', 'urgent')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle(),

  // Latest non-urgent announcement
  supabase.from('announcements')
    .select('id, title, body, published_at')
    .eq('active', true)
    .neq('priority', 'urgent')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle(),
])
```

---

## 10. Week Helper

```ts
// src/lib/utils.ts
export function getCurrentWeek() {
  const now   = new Date()
  const day   = now.getDay()
  const diff  = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)

  const weekStart  = monday.toISOString().split('T')[0]
  const weekNumber = getISOWeek(monday)
  const year       = monday.getFullYear()

  return { weekStart, weekNumber, year }
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function formatReportCompletion(report: { status: string } | null): string {
  if (!report) return 'not started'
  if (report.status === 'submitted') return 'submitted'
  if (report.status === 'reviewed') return 'reviewed'
  if (report.status === 'flagged') return 'flagged'
  return 'in progress'
}
```

---

## 11. PWA Setup

### public/manifest.json

```json
{
  "name": "SaltCity Leadership",
  "short_name": "SaltCity",
  "description": "Pastoral operations companion for SaltCity church leadership",
  "theme_color": "#6B2540",
  "background_color": "#F4EFE8",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "scope": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### next.config.ts (with next-pwa)

```ts
import withPWA from 'next-pwa'

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  // any other Next.js config here
})

export default config
```

---

## 12. Accessibility Checklist

Before shipping each screen:

- [ ] All colours meet WCAG AA (`--ink` on `--bg`, `--ink-2` on `--surface`, status colours on their `-bg` pairs)
- [ ] Every interactive element has `:focus-visible` ring (`outline: 2px solid var(--primary); outline-offset: 2px`)
- [ ] Icon buttons have `aria-label`
- [ ] `StatusDot` text is in the row's accessible name, not just colour
- [ ] `MemberGrid` tiles are `<button>` with `aria-pressed` for absent state
- [ ] Bottom nav items have `aria-current="page"` on active item
- [ ] Scroll container clears nav (92px padding-bottom)
- [ ] Touch targets ≥ 44×44px on all interactive elements
- [ ] `<em>` in greetings/titles is JSX children — never `dangerouslySetInnerHTML`

---

## 13. Implementation Order

Work through this in sequence. Each step ships independently.

1. **Project init** — Next.js, Tailwind, Supabase packages, env vars
2. **Supabase setup** — run all SQL from `SCHEMA.md` (enums, tables, RLS, triggers)
3. **Tokens + fonts** — `globals.css`, `tailwind.config.ts`, `app/layout.tsx`
4. **Supabase clients** — `lib/supabase/server.ts`, `client.ts`, `middleware.ts`
5. **Auth** — middleware, login page, signIn/signOut actions, `requireAuth()`
6. **AppShell** — `AppHeader`, `BottomNav`, `(app)/layout.tsx`
7. **Primitives** — `Button`, `Avatar`, `StatusDot`, `Check`, `Skeleton`, `Row/RowList`, `Field`, `Greeting`, `SectionLabel`
8. **Hero + Notice + EventRow** — the structural display modules
9. **MemberGrid + Stepper** — report-specific inputs
10. **FeedbackBanner** — shared feedback
11. **Leader Dashboard** — bounded fetches + suspense skeletons
12. **Admin Dashboard** — bounded fetches + suspense skeletons
13. **Report Flow** — draft, member grid, submit; auto-save with 2-min debounce
14. **Follow-up** — leader assigned view + admin queue
15. **Tasks** — grouped checklist, optimistic toggle
16. **Announcements, Events, Companies, More** — full screens
17. **Admin create flows** — announcements, events, assign case, add member
18. **PWA** — manifest, icons, service worker
19. **QA** — accessibility checklist, no wrapped buttons, member grid at 30, nav clearance

---

## 14. What Claude Code Gets From This Project

Hand Claude Code these files — they contain everything needed to build the app from scratch:

| File | Hand over? | Why |
|---|---|---|
| `CLAUDE.md` | ✅ Required | Auto-injected context. Place in repo root. |
| `HANDOFF.md` | ✅ Required | This file — full build brief |
| `SCHEMA.md` | ✅ Required | Database schema, RLS, triggers, seed data |
| `DESIGN.md` | ✅ Required | Full design spec, copy rules, component rules |
| `SaltCity Final.html` | ✅ Required | Pixel reference — open in browser |
| `styles-final.css` | ✅ Useful | CSS token values + all class definitions |
| `components-final.jsx` | ✅ Useful | Component markup reference (HTML, not production code) |
| `screens-final-a.jsx` | ✅ Useful | Screens 1–6 markup reference |
| `screens-final-b.jsx` | ✅ Useful | Screens 7–11 markup reference |
| `assets/logo.svg` | ✅ Required | Copy into `public/` |
| `assets/logo-white.svg` | ✅ Required | Copy into `public/` |
| Older HTML/CSS/JSX files | ❌ Skip | Staging only — not needed |

---

## 15. Non-Goals

- No dark mode
- No push notifications (show in settings as "coming soon")
- No in-app messaging between leaders
- No file/photo uploads
- No giving records or financial data
- No discipleship tracking
- No offline data sync beyond basic PWA caching of the app shell
