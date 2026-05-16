import Link from 'next/link'
import { MapPin, Briefcase, TrendingUp, Zap } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Listing } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  cofounder: 'Mitgründer', developer: 'Developer', designer: 'Designer',
  marketing: 'Marketing', sales: 'Sales', investor: 'Investor', other: 'Sonstiges',
}
const STAGE_LABELS: Record<string, string> = {
  idea: 'Idee', mvp: 'MVP', revenue: 'Revenue', funded: 'Funded',
}
const STAGE_STYLES: Record<string, string> = {
  idea: 'bg-white/[0.06] text-[#A0A0B0]',
  mvp: 'bg-blue-500/10 text-blue-400',
  revenue: 'bg-emerald-500/10 text-emerald-400',
  funded: 'bg-amber-500/10 text-amber-400',
}
const COMP_STYLES: Record<string, string> = {
  equity: 'bg-emerald-500/10 text-emerald-400',
  salary: 'bg-blue-500/10 text-blue-400',
  both: 'bg-violet-500/10 text-violet-400',
}
const COMP_LABELS: Record<string, string> = {
  equity: 'Equity', salary: 'Gehalt', both: 'Equity + Gehalt',
}

interface Props {
  listing: Listing
}

export default function ListingCard({ listing }: Props) {
  const profile = listing.profiles
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') ?? profile?.username?.[0]?.toUpperCase() ?? '?'
  const isNew = (Date.now() - new Date(listing.created_at).getTime()) < 24 * 60 * 60 * 1000
  const seeksInvestment = (listing as any).seeks_investment

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className="relative h-full rounded-xl border border-white/[0.06] bg-[#111118] p-5 transition-all duration-200 hover:border-violet-500/30 hover:bg-[#14141d] hover:shadow-[0_0_20px_rgba(124,58,237,0.08)]">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-violet-700/60 text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-[#F0F0F5]">{profile?.full_name || profile?.username}</p>
              {profile?.location && (
                <p className="text-xs text-[#6B7280] flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{profile.location}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isNew && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" />Neu
              </span>
            )}
            {seeksInvestment && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                💰 Investment
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_STYLES[listing.stage]}`}>
              {STAGE_LABELS[listing.stage]}
            </span>
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-[#F0F0F5] line-clamp-2 leading-snug mb-2 group-hover:text-white transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-[#6B7280] line-clamp-3 leading-relaxed mb-4">
          {listing.description}
        </p>

        {/* Footer badges */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 rounded-md bg-white/[0.04] text-[#A0A0B0] flex items-center gap-1">
            <Briefcase className="h-3 w-3" />{ROLE_LABELS[listing.role_category] ?? listing.role_category}
          </span>
          <span className={`text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 ${COMP_STYLES[listing.compensation_type]}`}>
            <TrendingUp className="h-3 w-3" />
            {COMP_LABELS[listing.compensation_type]}
            {listing.compensation_type !== 'salary' && listing.equity_percent != null && ` · ${listing.equity_percent}%`}
          </span>
        </div>

        <p className="text-[11px] text-[#4B4B5A] mt-3">
          {new Date(listing.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </Link>
  )
}
