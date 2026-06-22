'use client'
import { useState } from 'react'
import { SearchIcon, CheckIcon } from './Icons'
import { initialsOf, firstNameOf } from '@/lib/utils'

interface Member {
  id: string
  full_name: string
}

interface Props {
  members: Member[]
  selectedIds: string[]
  onToggle: (id: string) => void
  disabled?: boolean
  /** 'present' = green selected (who showed up); 'absent' = red selected. */
  tone?: 'present' | 'absent'
}

const toneCls = {
  present: {
    tile: 'bg-ok-bg border-transparent',
    avatar: 'bg-ok text-white',
    name: 'text-ok',
  },
  absent: {
    tile: 'bg-urgent-bg border-transparent',
    avatar: 'bg-urgent text-white',
    name: 'text-urgent',
  },
}

export default function MemberGrid({ members, selectedIds, onToggle, disabled, tone = 'absent' }: Props) {
  const [search, setSearch] = useState('')
  const selected = new Set(selectedIds)
  const t = toneCls[tone]

  const filtered = members.filter((m) => m.full_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="px-5">
      <div className="flex items-center gap-2 px-3.5 py-[11px] bg-surface rounded-input border border-[var(--rule-strong)] mb-2.5">
        <SearchIcon className="w-4 h-4 text-ink-4 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members"
          className="flex-1 bg-transparent border-0 outline-none text-[14.5px] text-ink
                     placeholder:text-ink-4 tracking-[-0.006em] min-w-0"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((m) => {
          const on = selected.has(m.id)
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => onToggle(m.id)}
              className={`flex items-center gap-2 px-[11px] py-[9px] rounded-[12px] min-h-[44px]
                          border cursor-pointer text-left transition-all duration-100 min-w-0
                          active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none
                          ${on ? t.tile : 'bg-surface border-[var(--rule)]'}`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center
                            text-[9.5px] font-bold flex-shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5
                            ${on ? t.avatar : 'bg-bg-2 text-ink-2'}`}
              >
                {on && tone === 'present' ? <CheckIcon /> : initialsOf(m.full_name)}
              </span>
              <span
                className={`text-[13px] font-medium truncate tracking-[-0.008em]
                            ${on ? t.name : 'text-ink'}`}
              >
                {firstNameOf(m.full_name)}
              </span>
            </button>
          )
        })}
      </div>
      {filtered.length === 0 && (
        <div className="text-[13px] text-ink-3 py-4 text-center">No members match.</div>
      )}
    </div>
  )
}
