'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={searchParams.get('role') ?? 'all'}
        onValueChange={v => updateFilter('role', v ?? 'all')}
      >
        <SelectTrigger className="w-[150px] bg-[#111118] border-white/[0.08] text-[#A0A0B0] hover:border-white/20 focus:border-violet-500/50">
          <SelectValue placeholder="Rolle" />
        </SelectTrigger>
        <SelectContent className="bg-[#1A1A24] border-white/[0.08]">
          <SelectItem value="all">Alle Rollen</SelectItem>
          <SelectItem value="cofounder">Mitgründer</SelectItem>
          <SelectItem value="developer">Developer</SelectItem>
          <SelectItem value="designer">Designer</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="investor">Investor</SelectItem>
          <SelectItem value="other">Sonstiges</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('stage') ?? 'all'}
        onValueChange={v => updateFilter('stage', v ?? 'all')}
      >
        <SelectTrigger className="w-[150px] bg-[#111118] border-white/[0.08] text-[#A0A0B0] hover:border-white/20 focus:border-violet-500/50">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent className="bg-[#1A1A24] border-white/[0.08]">
          <SelectItem value="all">Alle Stages</SelectItem>
          <SelectItem value="idea">Idee</SelectItem>
          <SelectItem value="mvp">MVP</SelectItem>
          <SelectItem value="revenue">Revenue</SelectItem>
          <SelectItem value="funded">Funded</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('comp') ?? 'all'}
        onValueChange={v => updateFilter('comp', v ?? 'all')}
      >
        <SelectTrigger className="w-[150px] bg-[#111118] border-white/[0.08] text-[#A0A0B0] hover:border-white/20 focus:border-violet-500/50">
          <SelectValue placeholder="Vergütung" />
        </SelectTrigger>
        <SelectContent className="bg-[#1A1A24] border-white/[0.08]">
          <SelectItem value="all">Alle Vergütungen</SelectItem>
          <SelectItem value="equity">Equity</SelectItem>
          <SelectItem value="salary">Gehalt</SelectItem>
          <SelectItem value="both">Equity + Gehalt</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
