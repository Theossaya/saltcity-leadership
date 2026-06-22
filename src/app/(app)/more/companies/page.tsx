import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { initialsOf } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import { ChevronIcon } from '@/components/ui/Icons'

export default async function CompaniesPage() {
  const { profile } = await requireAuth()

  // Leaders go straight to their own company — cross-company data stays hidden
  if (!isAdminOrOffice(profile.role)) {
    if (profile.company_id) redirect(`/more/companies/${profile.company_id}`)
    return (
      <>
        <Greeting>
          No <em>company.</em>
        </Greeting>
        <p className="mx-5 mt-3 text-[14px] text-ink-2 leading-[1.5]">
          You haven&rsquo;t been assigned a company yet. The church office can set this up.
        </p>
      </>
    )
  }

  const supabase = createClient()
  const [{ data: companies }, { data: members }] = await Promise.all([
    supabase.from('companies').select('id, name').order('name'),
    supabase.from('members').select('company_id').eq('status', 'active'),
  ])

  const counts = new Map<string, number>()
  for (const m of members ?? []) counts.set(m.company_id, (counts.get(m.company_id) ?? 0) + 1)

  return (
    <>
      <Greeting>Companies.</Greeting>

      <SectionLabel label="All companies" action={String((companies ?? []).length)} />
      <RowList>
        {(companies ?? []).map((c) => (
          <Row
            key={c.id}
            href={`/more/companies/${c.id}`}
            lead={<Avatar initials={initialsOf(c.name)} />}
            title={c.name}
            sub={`${counts.get(c.id) ?? 0} members`}
            tail={<ChevronIcon />}
          />
        ))}
      </RowList>
    </>
  )
}
