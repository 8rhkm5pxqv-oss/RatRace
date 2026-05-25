'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

const ROLES = [
  { value: 'all', label: 'All roles' },
  { value: 'cofounder', label: 'Co-Founder' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'investor', label: 'Investor' },
]

const STAGES = [
  { value: 'all', label: 'All stages' },
  { value: 'idea', label: 'Idea' },
  { value: 'mvp', label: 'MVP' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'funded', label: 'Funded' },
]

const COMPS = [
  { value: 'all', label: 'Any comp' },
  { value: 'equity', label: 'Equity' },
  { value: 'salary', label: 'Salary' },
  { value: 'both', label: 'Equity + Salary' },
]

const Divider = () => (
  <div className="w-px shrink-0 self-stretch bg-white/[0.07] mx-1" />
)

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete(key)
    else params.set(key, value)
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  const role = searchParams.get('role') ?? 'all'
  const stage = searchParams.get('stage') ?? 'all'
  const comp = searchParams.get('comp') ?? 'all'

  const pill = (param: string, value: string, label: string, active: boolean) => (
    <button
      key={value}
      onClick={() => setFilter(param, value)}
      className={cn(
        'shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 whitespace-nowrap',
        active
          ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/40'
          : 'bg-white/[0.04] text-[#6B7280] border border-white/[0.06] hover:bg-white/[0.07] hover:text-[#A0A0B0] hover:border-white/[0.1]'
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
      {ROLES.map(({ value, label }) => pill('role', value, label, role === value))}
      <Divider />
      {STAGES.map(({ value, label }) => pill('stage', value, label, stage === value))}
      <Divider />
      {COMPS.map(({ value, label }) => pill('comp', value, label, comp === value))}
    </div>
  )
}
