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
  cofounder: 'Looking for Co-Founder',
  developer: 'Looking for Developer',
  designer: 'Looking for Designer',
  marketing: 'Looking for Marketing',
  sales: 'Looking for Sales',
  investor: 'Investor',
  other: 'Looking for Help',
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
  idea: 'Idea Stage', mvp: 'MVP', revenue: 'Revenue', funded: 'Funded',
}
const STAGE_STYLE: Record<string, string> = {
  idea: 'text-[#A0A0B0] bg-white/[0.06]',
  mvp: 'text-blue-400 bg-blue-500/10',
  revenue: 'text-emerald-400 bg-emerald-500/10',
  funded: 'text-amber-400 bg-amber-500/10',
}
const COMP_LABEL: Record<string, string> = {
  equity: 'Equity', salary: 'Gehalt', both: 'Equity + Gehalt',
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.floor(ms / 3600000)
  if (h < 1) return 'Active just now'
  if (h < 24) return `Active ${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Active 1d ago'
  return `Active ${d}d ago`
}

interface Props {
  listing: Listing
}

export default function FeedCard({ listing }: Props) {
  const router = useRouter()
  const [bookmarked, setBookmarked] = useState(false)
  useEffect(() => { setBookmarked(getWatchlist().includes(listing.id)) }, [listing.id])

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation()
    setBookmarked(toggleWatchlist(listing.id))
  }

  function handleClick() {
    router.push(`/profile/${listing.user_id}`)
  }

  const profile = listing.profiles
  const initials =
    profile?.full_name?.split(' ').map(n => n[0]).join('') ??
    profile?.username?.[0]?.toUpperCase() ??
    '?'
  const tags = profile?.skills?.slice(0, 4) ?? []

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-xl border border-white/[0.06] bg-[#111118] p-5 transition-all duration-150 hover:border-white/[0.1] hover:bg-[#131320]"
    >
      <div className="flex gap-5">
        {/* Left: main content */}
        <div className="flex-1 min-w-0">
          <p className={cn('text-[11px] font-semibold uppercase tracking-wide mb-1.5', ROLE_COLOR[listing.role_category] ?? 'text-[#6B7280]')}>
            {ROLE_LABEL[listing.role_category] ?? listing.role_category}
          </p>
          <h3 className="font-semibold text-[#F0F0F5] text-[15px] leading-snug mb-1.5">
            {listing.title}
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-2 mb-3">
            {listing.description}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-[#A0A0B0] border border-white/[0.06]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-[#4B4B5A]">
            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {profile.location}
              </span>
            )}
            <span>{COMP_LABEL[listing.compensation_type]}</span>
            {listing.equity_percent != null && listing.compensation_type !== 'salary' && (
              <span>{listing.equity_percent}% equity</span>
            )}
          </div>
        </div>

        {/* Right: stage badge + founder */}
        <div className="shrink-0 flex flex-col items-end gap-3" style={{ minWidth: 110 }}>
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap', STAGE_STYLE[listing.stage] ?? 'text-[#A0A0B0] bg-white/[0.06]')}>
            {STAGE_LABEL[listing.stage] ?? listing.stage}
          </span>

          <div className="flex flex-col items-end gap-1 flex-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-violet-700/60 text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <p className="text-xs font-medium text-[#A0A0B0] text-right leading-tight">
              {profile?.full_name || profile?.username || 'Anonym'}
            </p>
            <p className="text-[11px] text-[#4B4B5A] text-right">
              {timeAgo(listing.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                bookmarked
                  ? 'text-violet-400 hover:text-violet-300'
                  : 'hover:bg-white/[0.06] text-[#4B4B5A] hover:text-[#A0A0B0]'
              )}
              title={bookmarked ? 'Von Watchlist entfernen' : 'Zur Watchlist hinzufügen'}
            >
              <Bookmark className={cn('h-3.5 w-3.5', bookmarked && 'fill-current')} />
            </button>
            <MessageButton
              listingId={listing.id}
              ownerId={listing.user_id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
