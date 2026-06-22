import Image from 'next/image'
import { requireAuth } from '@/lib/auth'
import { signOut } from '@/app/(auth)/login/actions'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import {
  MegaphoneIcon,
  CalendarIcon,
  UsersIcon,
  BellIcon,
  ChevronIcon,
  PlusIcon,
  LogoutIcon,
} from '@/components/ui/Icons'

function LeadIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-8 h-8 rounded-[10px] bg-bg-2 flex items-center justify-center text-ink-2 [&_svg]:w-[17px] [&_svg]:h-[17px]">
      {children}
    </div>
  )
}

export default async function MorePage() {
  await requireAuth()

  return (
    <>
      <Greeting>More.</Greeting>

      <SectionLabel label="Sections" />
      <RowList>
        <Row
          href="/more/announcements"
          lead={<LeadIcon><MegaphoneIcon /></LeadIcon>}
          title="Announcements"
          tail={<ChevronIcon />}
        />
        <Row
          href="/more/events"
          lead={<LeadIcon><CalendarIcon /></LeadIcon>}
          title="Events"
          tail={<ChevronIcon />}
        />
        <Row
          href="/more/companies"
          lead={<LeadIcon><UsersIcon /></LeadIcon>}
          title="Companies"
          tail={<ChevronIcon />}
        />
      </RowList>

      <SectionLabel label="Account" />
      <RowList>
        <Row
          href="/more/settings"
          lead={<LeadIcon><BellIcon /></LeadIcon>}
          title="Settings & notifications"
          tail={<ChevronIcon />}
        />
      </RowList>

      <SectionLabel label="Coming soon" />
      <RowList>
        <Row dimmed lead={<LeadIcon><PlusIcon /></LeadIcon>} title="Giving records" tail={<span className="text-[11.5px] text-ink-3">Soon</span>} />
        <Row dimmed lead={<LeadIcon><PlusIcon /></LeadIcon>} title="Discipleship paths" tail={<span className="text-[11.5px] text-ink-3">Soon</span>} />
      </RowList>

      <div className="px-5 pt-5">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap
                       font-medium leading-none px-5 py-[15px] text-[15px] rounded-[14px]
                       bg-transparent text-urgent shadow-[inset_0_0_0_1px_var(--rule-strong)]
                       [&_svg]:w-4 [&_svg]:h-4"
          >
            <LogoutIcon />
            Sign out
          </button>
        </form>
      </div>

      <div className="px-5 pt-[18px] text-center">
        <Image src="/logo.svg" alt="SaltCity" width={68} height={15} className="inline-block opacity-45 h-[15px] w-auto" />
        <div className="mt-2 text-[11.5px] text-ink-3">SaltCity Leadership · v1.4</div>
      </div>
    </>
  )
}
