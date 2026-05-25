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
import TranslatableBlock from '@/components/TranslatableBlock'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

const ROLE_LABELS: Record<string, string> = {
  cofounder: 'Co-Founder', developer: 'Developer', designer: 'Designer',
  marketing: 'Marketing', sales: 'Sales', investor: 'Investor', other: 'Other',
}
const STAGE_LABELS: Record<string, string> = { idea: 'Idea', mvp: 'MVP', revenue: 'Revenue', funded: 'Funded' }
const STAGE_STYLES: Record<string, string> = {
  idea: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50',
  mvp: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  revenue: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  funded: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}
const COMP_LABELS: Record<string, string> = { equity: 'Equity', salary: 'Salary', both: 'Equity + Salary' }
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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-zinc-500 hover:text-zinc-200')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>

      <div className="rounded-xl border border-white/[0.07] bg-[#141414] p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          <span className={cn('text-[11px] px-2.5 py-1 rounded-md font-medium border', STAGE_STYLES[l.stage])}>
            {STAGE_LABELS[l.stage]}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 flex items-center gap-1">
            <Briefcase className="h-3 w-3" />{ROLE_LABELS[l.role_category]}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {COMP_LABELS[l.compensation_type]}
            {l.compensation_type !== 'salary' && l.equity_percent != null && ` · ${l.equity_percent}%`}
          </span>
          {l.seeks_investment && (
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              Seeking investment{l.investment_round ? ` · ${ROUND_LABELS[l.investment_round] ?? l.investment_round}` : ''}
            </span>
          )}
          {l.monthly_revenue_range && (
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Revenue: {l.monthly_revenue_range}
            </span>
          )}
        </div>

        <TranslatableBlock text={l.title} as="h1" className="text-xl font-semibold text-white leading-snug" />

        <p className="text-xs text-zinc-600 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(l.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <hr className="border-white/[0.06]" />

        <TranslatableBlock text={l.description} className="text-zinc-400 leading-relaxed text-sm whitespace-pre-wrap" />
      </div>

      {/* Author card */}
      <div className="rounded-xl border border-white/[0.07] bg-[#141414] p-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-violet-600/70 text-white text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/profile/${profile?.id}`} className="font-medium text-zinc-100 hover:text-white transition-colors">
              {profile?.full_name || profile?.username}
            </Link>
            {profile?.location && (
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />{profile.location}
              </p>
            )}
            {profile?.bio && (
              <TranslatableBlock text={profile.bio} className="text-xs text-zinc-500 mt-1 line-clamp-2" />
            )}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.skills.slice(0, 5).map((skill: string) => (
                  <span key={skill} className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-400 border border-zinc-700/40">{skill}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {!isOwner && user && <ContactButton listingId={l.id} ownerId={l.user_id} />}
        {!user && (
          <Link href="/auth/login" className={cn(buttonVariants({ size: 'sm' }), 'bg-violet-600 hover:bg-violet-500 border-0 text-white shrink-0 text-xs')}>
            Contact
          </Link>
        )}
        {isOwner && (
          <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-800/60 text-zinc-500 border border-zinc-700/50 shrink-0">Your listing</span>
        )}
      </div>
    </div>
  )
}
