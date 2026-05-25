'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Bookmark, ArrowUpRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import MessageButton from './MessageButton'
import TranslatableBlock from './TranslatableBlock'
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
  cofounder: 'Co-Founder', developer: 'Developer', designer: 'Designer',
  marketing: 'Marketing', sales: 'Sales', investor: 'Investor', other: 'Other',
}
const ROLE_DOT: Record<string, string> = {
  cofounder: 'bg-blue-400', developer: 'bg-violet-400', designer: 'bg-pink-400',
  marketing: 'bg-emerald-400', sales: 'bg-orange-400', investor: 'bg-amber-400', other: 'bg-zinc-500',
}
const STAGE_LABEL: Record<string, string> = {
  idea: 'Idea', mvp: 'MVP', revenue: 'Revenue', funded: 'Funded',
}
const STAGE_STYLE: Record<string, string> = {
  idea: 'text-zinc-400 bg-zinc-800/60 border-zinc-700/50',
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
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
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
    profile?.username?.[0]?.toUpperCase() ?? '?'
  const tags = profile?.skills?.slice(0, 3) ?? []

  return (
    <div
      onClick={() => router.push(`/profile/${listing.user_id}`)}
      className="group relative cursor-pointer rounded-xl border border-white/[0.07] bg-[#141414] px-6 py-5 transition-all duration-200 hover:border-white/[0.13] hover:bg-[#181818]"
    >
      {/* Top row: role dot + label | time + stage */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', ROLE_DOT[listing.role_category] ?? 'bg-zinc-500')} />
          <span className="text-xs font-medium text-zinc-400">
            Looking for {ROLE_LABEL[listing.role_category] ?? listing.role_category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600">{timeAgo(listing.created_at)}</span>
          <span className={cn('text-[11px] px-2 py-0.5 rounded-md font-medium border', STAGE_STYLE[listing.stage] ?? 'text-zinc-400 bg-zinc-800/60 border-zinc-700/50')}>
            {STAGE_LABEL[listing.stage] ?? listing.stage}
          </span>
        </div>
      </div>

      {/* Title */}
      <TranslatableBlock
        text={listing.title}
        as="h3"
        className="font-semibold text-[#ededed] text-base leading-snug mb-2 group-hover:text-white transition-colors duration-150"
      />

      {/* Description */}
      <TranslatableBlock
        text={listing.description}
        className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-4"
      />

      {/* Skills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-400 border border-zinc-700/40">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: author | meta | actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-violet-600/70 text-white text-[9px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-zinc-500 truncate">
            {profile?.full_name || profile?.username || 'Anonym'}
          </span>
          {profile?.location && (
            <>
              <span className="text-zinc-700 shrink-0">·</span>
              <span className="text-xs text-zinc-600 flex items-center gap-1 shrink-0">
                <MapPin className="h-3 w-3" />{profile.location}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <span className="text-[11px] text-zinc-600 mr-1">{COMP_LABEL[listing.compensation_type]}{listing.equity_percent != null && listing.compensation_type !== 'salary' ? ` · ${listing.equity_percent}%` : ''}</span>
          <button
            onClick={handleBookmark}
            className={cn('p-1.5 rounded-lg transition-all duration-100', bookmarked ? 'text-violet-400' : 'text-zinc-700 hover:text-zinc-400 hover:bg-white/[0.04]')}
          >
            <Bookmark className={cn('h-3.5 w-3.5', bookmarked && 'fill-current')} />
          </button>
          <MessageButton listingId={listing.id} ownerId={listing.user_id} />
        </div>
      </div>
    </div>
  )
}
