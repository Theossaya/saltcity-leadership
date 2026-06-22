'use client'
import { useState } from 'react'
import { SearchIcon } from './Icons'
import { initialsOf, firstNameOf } from '@/lib/utils'

interface Member {
  id: string
  full_name: string
}

interface Props {
  members: Member[]
  absentIds: string[]
  onToggle: (id: string) => void
  disabled?: boolean
}

export default function MemberGrid({ members, absentIds, onToggle, disabled }: Props) {
  const [search, setSearch] = useState('')
  const absent = new Set(absentIds)

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
          const isAbsent = absent.has(m.id)
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isAbsent}
              disabled={disabled}
              onClick={() => onToggle(m.id)}
              className={`flex items-center gap-2 px-[11px] py-[9px] rounded-[12px] min-h-[44px]
                          border cursor-pointer text-left transition-all duration-100 min-w-0
                          disabled:opacity-60 disabled:pointer-events-none
                          ${isAbsent ? 'bg-urgent-bg border-transparent' : 'bg-surface border-[var(--rule)]'}`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center
                            text-[9.5px] font-bold flex-shrink-0
                            ${isAbsent ? 'bg-urgent text-white' : 'bg-bg-2 text-ink-2'}`}
              >
                {initialsOf(m.full_name)}
              </span>
              <span
                className={`text-[13px] font-medium truncate tracking-[-0.008em]
                            ${isAbsent ? 'text-urgent' : 'text-ink'}`}
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
