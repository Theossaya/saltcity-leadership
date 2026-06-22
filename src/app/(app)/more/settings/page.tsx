import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { signOut } from '@/app/(auth)/login/actions'
import { initialsOf } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import { BellIcon, LogoutIcon } from '@/components/ui/Icons'

const roleLabel: Record<string, string> = {
  company_leader: 'Company Leader',
  assistant_leader: 'Assistant Leader',
  church_admin: 'Church Admin',
  church_office: 'Church Office',
}

export default async function SettingsPage() {
  const { profile } = await requireAuth()
  const supabase = createClient()

  let companyName: string | null = null
  if (profile.company_id) {
    const { data } = await supabase
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .maybeSingle()
    companyName = data?.name ?? null
  }

  return (
    <>
      <Greeting>Settings.</Greeting>

      <SectionLabel label="Account" />
      <RowList>
        <Row
          lead={<Avatar initials={initialsOf(profile.full_name)} />}
          title={profile.full_name}
          sub={[roleLabel[profile.role] ?? profile.role, companyName].filter(Boolean).join(' · ')}
        />
      </RowList>

      <SectionLabel label="Notifications" />
      <RowList>
        <Row
          dimmed
          lead={
            <div className="w-8 h-8 rounded-[10px] bg-bg-2 flex items-center justify-center text-ink-2 [&_svg]:w-[17px] [&_svg]:h-[17px]">
              <BellIcon />
            </div>
          }
          title="Push notifications"
          tail={<span className="text-[11.5px] text-ink-3">Coming soon</span>}
        />
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
    </>
  )
}
