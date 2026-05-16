import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, PlusCircle, Pencil, Eye, EyeOff } from 'lucide-react'
import { DEMO_LISTINGS } from '@/lib/demo-data'
import type { Listing } from '@/types'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

const STAGE_LABEL: Record<string, string> = {
  idea: 'Idea Stage', mvp: 'MVP', revenue: 'Revenue', funded: 'Funded',
}
const ROLE_LABEL: Record<string, string> = {
  cofounder: 'Co-Founder', developer: 'Developer', designer: 'Designer',
  marketing: 'Marketing', sales: 'Sales', investor: 'Investor', other: 'Other',
}
const STAGE_STYLE: Record<string, string> = {
  idea: 'text-[#A0A0B0] bg-white/[0.06]',
  mvp: 'text-blue-400 bg-blue-500/10',
  revenue: 'text-emerald-400 bg-emerald-500/10',
  funded: 'text-amber-400 bg-amber-500/10',
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.floor(ms / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function RequestRow({ listing }: { listing: Listing }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#111118] hover:bg-[#131320] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-[#F0F0F5] truncate text-sm">{listing.title}</p>
          {listing.is_active ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full shrink-0">
              <Eye className="h-2.5 w-2.5" />Aktiv
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-[#6B7280] bg-white/[0.04] px-1.5 py-0.5 rounded-full shrink-0">
              <EyeOff className="h-2.5 w-2.5" />Inaktiv
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#4B4B5A]">
          <span>{ROLE_LABEL[listing.role_category] ?? listing.role_category}</span>
          <span>·</span>
          <span>{timeAgo(listing.created_at)}</span>
        </div>
      </div>

      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STAGE_STYLE[listing.stage] ?? 'text-[#A0A0B0] bg-white/[0.06]'}`}>
        {STAGE_LABEL[listing.stage] ?? listing.stage}
      </span>

      <Link
        href={`/listings/${listing.id}`}
        className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A0B0] hover:text-[#F0F0F5] transition-colors border border-white/[0.06]"
      >
        <Pencil className="h-3 w-3" />Ansehen
      </Link>
    </div>
  )
}

export default async function RequestsPage() {
  let listings: Listing[] = []
  let isDemo = false

  if (!isSupabaseConfigured()) {
    listings = DEMO_LISTINGS.slice(0, 3) as unknown as Listing[]
    isDemo = true
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    listings = (data ?? []) as Listing[]
  }

  return (
    <div className="px-6 py-6 flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-[#6B7280]" />
            <h1 className="text-xl font-bold text-[#F0F0F5]">Requests</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            {isDemo ? 'Demo-Modus — ' : ''}{listings.length} {listings.length === 1 ? 'Inserat' : 'Inserate'}
          </p>
        </div>
        <Link
          href="/listings/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Neues Inserat
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-10 w-10 mx-auto mb-3 text-[#2A2A35]" />
          <p className="font-medium text-[#A0A0B0]">Noch keine Inserate</p>
          <p className="text-sm text-[#6B7280] mt-1 mb-5">Poste dein erstes Inserat und finde deinen Mitgründer</p>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Inserat erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {listings.map(listing => (
            <RequestRow key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
