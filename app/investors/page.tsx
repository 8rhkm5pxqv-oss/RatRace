import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, Zap } from 'lucide-react'
import { DEMO_LISTINGS } from '@/lib/demo-data'
import type { Listing } from '@/types'

const ROUND_LABELS: Record<string, string> = {
  'pre-seed': 'Pre-Seed',
  'seed': 'Seed',
  'series-a': 'Series A',
  'series-b': 'Series B',
}
const REVENUE_LABELS: Record<string, string> = {
  '<10k': '< €10k / Monat',
  '10k-100k': '€10k – €100k / Monat',
  '>100k': '> €100k / Monat',
}

function DealCard({ listing }: { listing: Listing }) {
  const l = listing as any
  const profile = listing.profiles
  const initials =
    profile?.full_name?.split(' ').map((n: string) => n[0]).join('') ??
    profile?.username?.[0]?.toUpperCase() ??
    '?'

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className="relative h-full rounded-xl border border-amber-500/20 bg-[#111118] p-5 transition-all hover:border-amber-500/40 hover:bg-[#14141d] hover:shadow-[0_0_20px_rgba(245,158,11,0.06)]">
        {l.investment_round && (
          <div className="absolute top-3 right-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
              {ROUND_LABELS[l.investment_round] ?? l.investment_round}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A1A24] border border-white/[0.06] flex items-center justify-center text-base font-bold text-[#F0F0F5] shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-[#F0F0F5]">{profile?.full_name || profile?.username}</p>
            {profile?.location && <p className="text-xs text-[#6B7280]">{profile.location}</p>}
          </div>
        </div>

        <h3 className="font-semibold text-[#F0F0F5] line-clamp-2 mb-2 group-hover:text-white transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-[#6B7280] line-clamp-2 mb-4">{listing.description}</p>

        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-2 py-1 rounded-md font-medium ${
            listing.stage === 'funded' ? 'bg-amber-500/10 text-amber-400' :
            listing.stage === 'revenue' ? 'bg-emerald-500/10 text-emerald-400' :
            'bg-blue-500/10 text-blue-400'
          }`}>
            {listing.stage === 'idea' ? 'Idee' : listing.stage === 'mvp' ? 'MVP' : listing.stage === 'revenue' ? 'Revenue' : 'Funded'}
          </span>
          {l.monthly_revenue_range && (
            <span className="text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400">
              {REVENUE_LABELS[l.monthly_revenue_range] ?? l.monthly_revenue_range}
            </span>
          )}
          {listing.equity_percent != null && (
            <span className="text-xs px-2 py-1 rounded-md bg-violet-500/10 text-violet-400">
              {listing.equity_percent}% Equity
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

async function DealFlowGrid({ round }: { round?: string }) {
  let listings: Listing[] = []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl === 'your-project-url') {
    listings = (DEMO_LISTINGS as any[])
      .filter(l => l.seeks_investment && (!round || round === 'all' || l.investment_round === round)) as Listing[]
  } else {
    const supabase = await createClient()
    let query = supabase
      .from('listings')
      .select('*, profiles(*)')
      .eq('is_active', true)
      .eq('seeks_investment', true)
      .order('stage', { ascending: false })
      .order('created_at', { ascending: false })

    if (round && round !== 'all') query = query.eq('investment_round', round)
    const { data } = await query.limit(30)
    listings = (data ?? []) as Listing[]
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-16 text-[#6B7280]">
        <p className="text-[#A0A0B0] font-medium">Noch keine Investment-Deals verfügbar</p>
        <p className="text-sm mt-1">Poste dein Startup und aktiviere &quot;Sucht Investition&quot;</p>
        <Link href="/listings/new" className="inline-block mt-4 text-sm text-violet-400 hover:text-violet-300">
          Jetzt posten →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map(listing => (
        <DealCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

export default async function InvestorsPage({ searchParams }: { searchParams: Promise<{ round?: string }> }) {
  const { round } = await searchParams

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="border-b border-white/[0.04] pb-8 pt-8 px-6" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.1) 0%, transparent 70%)' }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-5 w-5 text-amber-400" />
          <h1 className="text-xl font-bold text-[#F0F0F5]">Deals</h1>
        </div>
        <p className="text-sm text-[#6B7280] mb-5">
          Startups die aktiv Investoren suchen — gefiltert nach Round und Stage.
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Alle Rounds', value: 'all' },
            { label: 'Pre-Seed', value: 'pre-seed' },
            { label: 'Seed', value: 'seed' },
            { label: 'Series A', value: 'series-a' },
            { label: 'Series B', value: 'series-b' },
          ].map(f => (
            <Link
              key={f.value}
              href={`/investors${f.value !== 'all' ? `?round=${f.value}` : ''}`}
              className={`text-sm px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                (f.value === 'all' && !round) || round === f.value
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/[0.04] text-[#A0A0B0] hover:bg-white/[0.08] hover:text-[#F0F0F5] border border-transparent'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-[#111118]">
          <div>
            <p className="text-sm font-medium text-[#F0F0F5]">Du suchst Investoren für dein Startup?</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Erstelle ein Inserat und aktiviere &quot;Sucht Investition&quot;</p>
          </div>
          <Link
            href="/listings/new"
            className="shrink-0 text-sm px-4 py-2 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5"
          >
            <Zap className="h-4 w-4" />Listing erstellen
          </Link>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map(i => <div key={i} className="h-52 rounded-xl bg-[#111118] animate-pulse" />)}
          </div>
        }>
          <DealFlowGrid round={round} />
        </Suspense>
      </div>
    </div>
  )
}
