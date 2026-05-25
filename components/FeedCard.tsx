'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Bookmark } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import MessageButton from './MessageButton'
import type { Listing } from '@/types'

function getWatchlist(): string[] {
  try { return JSON.parse(localStorage.getItem('ratrace_watchlist') ?? '[]') } catch { return [] }
}
function toggleWatchlist(id: string): boolean {
  const list = getWatchlist()
  const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
  localStorage.setItem('ratrace_watchlist', JSON.stringify(next))
  return next.includes(id)
}

const ROLE_LABEL: Record<string, string> = {
  cofounder: 'Co-Founder',
  developer: 'Developer',
  designer: 'Designer',
  marketing: 'Marketing',
  sales: 'Sales',
  investor: 'Investor',
  other: 'Other',
}
const ROLE_COLOR: Record<string, string> = {
  cofounder: 'text-blue-400',
  developer: 'text-violet-400',
  designer: 'text-pink-400',
  marketing: 'text-emerald-400',
  sales: 'text-orange-400',
  investor: 'text-amber-400',
  other: 'text-[#6B7280]',
}
const STAGE_LABEL: Record<string, string> = {
  idea: 'Idea', mvp: 'MVP', revenue: 'Revenue', funded: 'Funded',
}
const STAGE_STYLE: Record<string, string> = {
  idea: 'text-[#A0A0B0] bg-white/[0.05] border-white/[0.06]',
  mvp: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  revenue: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  funded: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}
const COMP_LABEL: Record<string, string> = {
  equity: 'Equity', salary: 'Salary', both: 'Equity + Salary',
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.floor(ms / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? '1d ago' : `${d}d ago`
}

export default function FeedCard({ listing }: { listing: Listing }) {
  const router = useRouter()
  const [bookmarked, setBookmarked] = useState(false)
  useEffect(() => { setBookmarked(getWatchlist().includes(listing.id)) }, [listing.id])

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation()
    setBookmarked(toggleWatchlist(listing.id))
  }

  const profile = listing.profiles
  const initials =
    profile?.full_name?.split(' ').map(n => n[0]).join('') ??
    profile?.username?.[0]?.toUpperCase() ??
    '?'
  const tags = profile?.skills?.slice(0, 4) ?? []

  return (
    <div
      onClick={() => router.push(`/profile/${listing.user_id}`)}
      className="cursor-pointer group rounded-xl border border-white/[0.06] bg-[#111118] px-5 py-4 transition-all duration-200 hover:border-white/[0.1] hover:bg-[#131321]"
    >
      {/* Header: avatar + name + time | stage badge */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-violet-700/50 text-white text-[9px]">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5 min-w-0 text-xs">
            <span className="font-medium text-[#C0C0D0] truncate">
              {profile?.full_name || profile?.username || 'Anonym'}
            </span>
            <span className="text-[#2E2E3A] shrink-0">·</span>
            <span className="text-[#4B4B5A] shrink-0">{timeAgo(listing.created_at)}</span>
          </div>
        </div>
        <span className={cn(
          'shrink-0 text-[11px] px-2.5 py-0.5 rounded-full font-medium border',
          STAGE_STYLE[listing.stage] ?? 'text-[#A0A0B0] bg-white/[0.05] border-white/[0.06]'
        )}>
          {STAGE_LABEL[listing.stage] ?? listing.stage}
        </span>
      </div>

      {/* Role label */}
      <p className={cn('text-[10px] font-semibold uppercase tracking-widest mb-1.5', ROLE_COLOR[listing.role_category] ?? 'text-[#6B7280]')}>
        Looking for {ROLE_LABEL[listing.role_category] ?? listing.role_category}
      </p>

      {/* Title */}
      <h3 className="font-semibold text-[#F0F0F5] text-[15px] leading-snug mb-1.5 group-hover:text-white transition-colors duration-150">
        {listing.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-2 mb-3">
        {listing.description}
      </p>

      {/* Skills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-[#5A5A6A] border border-white/[0.05]">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: meta | actions */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-3 text-xs text-[#4B4B5A] min-w-0">
          {profile?.location && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{profile.location}</span>
            </span>
          )}
          <span className="shrink-0">{COMP_LABEL[listing.compensation_type]}</span>
          {listing.equity_percent != null && listing.compensation_type !== 'salary' && (
            <span className="shrink-0">{listing.equity_percent}% equity</span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleBookmark}
            className={cn(
              'p-1.5 rounded-lg transition-all duration-150',
              bookmarked
                ? 'text-violet-400 hover:text-violet-300'
                : 'text-[#2E2E3A] hover:text-[#6B7280] hover:bg-white/[0.04]'
            )}
          >
            <Bookmark className={cn('h-3.5 w-3.5', bookmarked && 'fill-current')} />
          </button>
          <MessageButton listingId={listing.id} ownerId={listing.user_id} />
        </div>
      </div>
    </div>
  )
}
