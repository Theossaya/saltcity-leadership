'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HomeIcon, DocIcon, HeartIcon, CheckIcon, DotsIcon } from './Icons'

const tabs = [
  { id: 'home', href: '/', label: 'Home', Icon: HomeIcon },
  { id: 'report', href: '/report', label: 'Report', Icon: DocIcon },
  { id: 'care', href: '/care', label: 'Care', Icon: HeartIcon },
  { id: 'tasks', href: '/tasks', label: 'Tasks', Icon: CheckIcon },
  { id: 'more', href: '/more', label: 'More', Icon: DotsIcon },
]

export default function BottomNav() {
  const pathname = usePathname()
  // Optimistic target: the tab the user just tapped, highlighted immediately so
  // the press never feels dead while the next screen's data loads. Cleared once
  // the navigation commits (pathname changes).
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  const committedActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 px-4 pointer-events-none z-20"
      style={{ paddingBottom: 'calc(18px + env(safe-area-inset-bottom))' }}
    >
      <div className="absolute inset-x-0 bottom-0 h-[90px] bg-gradient-to-b from-transparent to-bg pointer-events-none" />
      <div
        className="relative flex bg-surface rounded-pill p-[5px] pointer-events-auto border border-[var(--rule)]"
        style={{ boxShadow: 'var(--shadow-lift)' }}
      >
        {tabs.map(({ id, href, label, Icon }) => {
          const active = pendingHref ? href === pendingHref : committedActive(href)
          const loading = pendingHref === href && !committedActive(href)
          return (
            <Link
              key={id}
              href={href}
              onClick={() => {
                if (!committedActive(href)) setPendingHref(href)
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-[3px] min-w-0
                          py-[7px] rounded-pill text-[10px] font-medium
                          transition-colors duration-150 active:scale-95
                          ${active ? 'text-primary' : 'text-ink-3'}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`w-[19px] h-[19px] ${loading ? 'animate-pulse' : ''}`} />
              <span className="truncate max-w-full">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
