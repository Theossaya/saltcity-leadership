'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BellIcon, ArrowLeftIcon } from './Icons'

const TAB_ROOTS = ['/', '/report', '/care', '/tasks', '/more']

const iconBtn =
  'w-9 h-9 rounded-[11px] flex items-center justify-center text-ink-2 hover:bg-bg-2 active:bg-bg-2 active:scale-95 transition-all [&_svg]:w-[18px] [&_svg]:h-[18px]'

// Back button on sub-pages (the old three-dots did nothing), plus a bell that
// actually goes to Announcements.
export default function HeaderActions() {
  const pathname = usePathname()
  const router = useRouter()
  const isSubPage = !TAB_ROOTS.includes(pathname)

  return (
    <div className="flex gap-0.5">
      {isSubPage && (
        <button onClick={() => router.back()} aria-label="Go back" className={iconBtn}>
          <ArrowLeftIcon />
        </button>
      )}
      <Link href="/more/announcements" aria-label="Announcements" className={iconBtn}>
        <BellIcon />
      </Link>
    </div>
  )
}
