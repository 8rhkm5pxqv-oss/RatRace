import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Briefcase, TrendingUp, Calendar, ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DEMO_LISTINGS } from '@/lib/demo-data'
import type { Listing } from '@/types'
import ContactButton from './ContactButton'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

const ROLE_LABELS: Record<string, string> = {
  cofounder: 'Mitgründer', developer: 'Developer', designer: 'Designer',
  marketing: 'Marketing', sales: 'Sales', investor: 'Investor', other: 'Sonstiges',
}
const STAGE_LABELS: Record<string, string> = { idea: 'Idee', mvp: 'MVP', revenue: 'Revenue', funded: 'Funded' }
const STAGE_STYLES: Record<string, string> = {
  idea: 'bg-white/[0.06] text-[#A0A0B0]',
  mvp: 'bg-blue-500/10 text-blue-400',
  revenue: 'bg-emerald-500/10 text-emerald-400',
  funded: 'bg-amber-500/10 text-amber-400',
}
const COMP_LABELS: Record<string, string> = { equity: 'Equity', salary: 'Gehalt', both: 'Equity + Gehalt' }
const ROUND_LABELS: Record<string, string> = {
  'pre-seed': 'Pre-Seed', 'seed': 'Seed', 'series-a': 'Series A', 'series-b': 'Series B',
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let listing: any = null
  let user: any = null

  if (!isSupabaseConfigured()) {
    listing = (DEMO_LISTINGS as any[]).find(l => l.id === id) ?? null
  } else {
    const supabase = await createClient()
    const [{ data: listingData }, { data: { user: authUser } }] = await Promise.all([
      supabase.from('listings').select('*, profiles(*)').eq('id', id).single(),
      supabase.auth.getUser(),
    ])
    listing = listingData
    user = authUser
  }

  if (!listing) notFound()

  const l = listing as Listing & { seeks_investment?: boolean; investment_round?: string; monthly_revenue_range?: string }
  const profile = l.profiles
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('') ?? profile?.username?.[0]?.toUpperCase() ?? '?'
  const isOwner = user?.id === l.user_id

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-[#A0A0B0] hover:text-[#F0F0F5]')}>
        <ArrowLeft className="h-4 w-4 mr-1" />Zurück
      </Link>

      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_STYLES[l.stage]}`}>
            {STAGE_LABELS[l.stage]}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-[#A0A0B0] flex items-center gap-1">
            <Briefcase className="h-3 w-3" />{ROLE_LABELS[l.role_category]}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {COMP_LABELS[l.compensation_type]}
            {l.compensation_type !== 'salary' && l.equity_percent != null && ` · ${l.equity_percent}%`}
          </span>
          {l.seeks_investment && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-medium">
              💰 Sucht Investment{l.investment_round ? ` · ${ROUND_LABELS[l.investment_round] ?? l.investment_round}` : ''}
            </span>
          )}
          {l.monthly_revenue_range && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
              Revenue: {l.monthly_revenue_range}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-[#F0F0F5]">{l.title}</h1>

        <p className="text-[#6B7280] text-sm flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(l.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <hr className="border-white/[0.06]" />

        <div className="text-[#C0C0D0] whitespace-pre-wrap leading-relaxed text-sm">
          {l.description}
        </div>
      </div>

      {/* Author card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-violet-700/60 text-white text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/profile/${profile?.id}`} className="font-semibold text-[#F0F0F5] hover:text-white hover:underline">
              {profile?.full_name || profile?.username}
            </Link>
            {profile?.location && (
              <p className="text-sm text-[#6B7280] flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5" />{profile.location}
              </p>
            )}
            {profile?.bio && <p className="text-sm text-[#A0A0B0] mt-1 line-clamp-2">{profile.bio}</p>}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.skills.slice(0, 5).map((skill: string) => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-white/[0.04] text-[#A0A0B0]">{skill}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {!isOwner && user && <ContactButton listingId={l.id} ownerId={l.user_id} />}
        {!user && (
          <Link href="/auth/login" className={cn(buttonVariants({ size: 'sm' }), 'bg-violet-600 hover:bg-violet-500 border-0 text-white shrink-0')}>
            Kontakt aufnehmen
          </Link>
        )}
        {isOwner && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-[#A0A0B0] shrink-0">Dein Inserat</span>
        )}
      </div>
    </div>
  )
}
