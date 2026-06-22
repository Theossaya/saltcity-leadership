import Image from 'next/image'
import { BellIcon, DotsIcon } from './Icons'

interface Props {
  role: string
  name: string
  hasNotif?: boolean
}

const roleLabel: Record<string, string> = {
  company_leader: 'Company Leader',
  assistant_leader: 'Assistant Leader',
  church_admin: 'Church Admin',
  church_office: 'Church Office',
}

export default function AppHeader({ role, name, hasNotif }: Props) {
  return (
    <header className="flex items-center gap-3 px-5 pt-4 pb-3 bg-bg z-10 relative">
      <div
        className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center flex-shrink-0"
        style={{ boxShadow: '0 5px 14px -8px rgba(107,37,64,0.6)' }}
      >
        <Image src="/logo-white.svg" alt="SaltCity" width={21} height={21} className="w-[21px] h-auto" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-semibold text-ink leading-tight tracking-[-0.014em]">
          SaltCity Central
        </div>
        <div className="text-[11.5px] text-ink-3 mt-0.5 tracking-[-0.004em]">
          <span className="font-semibold text-ink-2">{roleLabel[role] ?? role}</span>
          {' · '}
          {name}
        </div>
      </div>
      <div className="flex gap-0.5">
        <button
          className="w-9 h-9 rounded-[11px] flex items-center justify-center text-ink-2
                     hover:bg-bg-2 transition-colors relative"
          aria-label="Notifications"
        >
          <BellIcon className="w-[18px] h-[18px]" />
          {hasNotif && (
            <span className="absolute top-[7px] right-[9px] w-[7px] h-[7px] rounded-full bg-urgent border-2 border-bg" />
          )}
        </button>
        <button
          className="w-9 h-9 rounded-[11px] flex items-center justify-center text-ink-2
                     hover:bg-bg-2 transition-colors"
          aria-label="More options"
        >
          <DotsIcon className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  )
}
