'use client'

import Link from 'next/link'
import { X, MapPin, MessageSquare, ExternalLink, Calendar, Briefcase, TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Listing } from '@/types'

const STAGE_LABEL: Record<string, string> = {
  idea: 'Idea Stage', mvp: 'MVP', revenue: 'Revenue', funded: 'Funded',
}
const COMP_LABEL: Record<string, string> = {
  equity: 'Equity', salary: 'Gehalt', both: 'Equity + Gehalt',
}
const ROLE_LABEL: Record<string, string> = {
  cofounder: 'Co-Founder', developer: 'Developer', designer: 'Designer',
  marketing: 'Marketing', sales: 'Sales', investor: 'Investor', other: 'Help',
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.floor(ms / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

interface Props {
  listing: Listing
  onClose: () => void
  currentUserId?: string | null
}

export default function ListingDetail({ listing, onClose, currentUserId }: Props) {
  const profile = listing.profiles
  const initials =
    profile?.full_name?.split(' ').map(n => n[0]).join('') ??
    profile?.username?.[0]?.toUpperCase() ??
    '?'
  const isOwn = currentUserId && currentUserId === listing.user_id

  const meta = [
    { label: 'Stage', value: STAGE_LABEL[listing.stage] ?? listing.stage, icon: TrendingUp },
    { label: 'Looking For', value: ROLE_LABEL[listing.role_category] ?? listing.role_category, icon: Briefcase },
    {
      label: 'Vergütung',
      value: `${COMP_LABEL[listing.compensation_type]}${listing.equity_percent != null && listing.compensation_type !== 'salary' ? ` · ${listing.equity_percent}%` : ''}`,
      icon: TrendingUp,
    },
    { label: 'Gepostet', value: timeAgo(listing.created_at), icon: Calendar },
    ...(profile?.location ? [{ label: 'Location', value: profile.location, icon: MapPin }] : []),
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] shrink-0">
        <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">About the Founder</p>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#6B7280] hover:text-[#A0A0B0] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Founder section */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-violet-700/60 text-white text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Link
                href={profile ? `/profile/${profile.id}` : '#'}
                className="font-semibold text-[#F0F0F5] hover:underline flex items-center gap-1 text-sm"
              >
                {profile?.full_name || profile?.username || 'Anonym'}
                <ExternalLink className="h-3 w-3 text-[#4B4B5A] shrink-0" />
              </Link>
              {profile?.location && (
                <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>

          {profile?.bio && (
            <p className="text-sm text-[#A0A0B0] leading-relaxed mb-3">{profile.bio}</p>
          )}

          {profile?.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map(skill => (
                <span key={skill} className="text-xs px-2 py-0.5 rounded bg-white/[0.06] text-[#A0A0B0]">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* About the project */}
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">About the Project</p>
          <p className="text-sm text-[#A0A0B0] leading-relaxed mb-4 line-clamp-4">{listing.description}</p>

          <div className="space-y-2.5">
            {meta.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between text-sm gap-2">
                <span className="text-[#6B7280] flex items-center gap-1.5 shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </span>
                <span className="text-[#A0A0B0] font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="px-5 py-4 border-t border-white/[0.06] space-y-2 shrink-0">
        {isOwn ? (
          <Link
            href={`/listings/${listing.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[#F0F0F5] text-sm font-medium transition-colors"
          >
            Mein Inserat ansehen
          </Link>
        ) : (
          <>
            <Link
              href={`/listings/${listing.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Send Message
            </Link>
            <Link
              href={`/listings/${listing.id}`}
              className="flex items-center justify-center w-full py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#A0A0B0] text-sm font-medium transition-colors"
            >
              Vollständiges Inserat
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
