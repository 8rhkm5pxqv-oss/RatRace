import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Listing } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  cofounder: 'Co-Founder', developer: 'Developer', designer: 'Designer',
  marketing: 'Marketing', sales: 'Sales', investor: 'Investor', other: 'Other',
}
const STAGE_LABELS: Record<string, string> = {
  idea: 'Idea', mvp: 'MVP', revenue: 'Revenue', funded: 'Funded',
}
const STAGE_STYLES: Record<string, string> = {
  idea: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50',
  mvp: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  revenue: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  funded: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}
const COMP_LABELS: Record<string, string> = {
  equity: 'Equity', salary: 'Salary', both: 'Equity + Salary',
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const profile = listing.profiles
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') ?? profile?.username?.[0]?.toUpperCase() ?? '?'
  const seeksInvestment = (listing as any).seeks_investment

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className="h-full rounded-xl border border-white/[0.07] bg-[#141414] p-5 transition-all duration-200 hover:border-white/[0.13] hover:bg-[#181818]">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-violet-600/70 text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-zinc-200">{profile?.full_name || profile?.username}</p>
              {profile?.location && (
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />{profile.location}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {seeksInvestment && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                Investment
              </span>
            )}
            <span className={cn('text-[11px] px-2 py-0.5 rounded-md font-medium border', STAGE_STYLES[listing.stage])}>
              {STAGE_LABELS[listing.stage]}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-zinc-100 line-clamp-2 leading-snug mb-2 group-hover:text-white transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4">
          {listing.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
          <span className="text-xs text-zinc-500">{ROLE_LABELS[listing.role_category] ?? listing.role_category}</span>
          <span className="text-xs text-zinc-600">
            {COMP_LABELS[listing.compensation_type]}
            {listing.compensation_type !== 'salary' && listing.equity_percent != null && ` · ${listing.equity_percent}%`}
          </span>
        </div>
      </div>
    </Link>
  )
}
