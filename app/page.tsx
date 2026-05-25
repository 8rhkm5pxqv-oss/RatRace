import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Feed from '@/components/Feed'
import FilterBar from '@/components/FilterBar'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DEMO_LISTINGS } from '@/lib/demo-data'
import type { Listing } from '@/types'

interface SearchParams { role?: string; stage?: string; comp?: string; q?: string }

async function getFeedData(sp: SearchParams): Promise<{ listings: Listing[]; currentUserId: string | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl === 'your-project-url') {
    return { listings: DEMO_LISTINGS as unknown as Listing[], currentUserId: null }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('listings')
    .select('*, profiles(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (sp.role && sp.role !== 'all') query = query.eq('role_category', sp.role)
  if (sp.stage && sp.stage !== 'all') query = query.eq('stage', sp.stage)
  if (sp.comp && sp.comp !== 'all') query = query.eq('compensation_type', sp.comp)
  if (sp.q) query = query.or(`title.ilike.%${sp.q}%,description.ilike.%${sp.q}%`)

  const { data: listings } = await query.limit(50)
  return { listings: (listings ?? []) as Listing[], currentUserId: user?.id ?? null }
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const { listings, currentUserId } = await getFeedData(params)
  const hasFilter = !!(params.q || params.role || params.stage || params.comp)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top bar */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.06] shrink-0 space-y-3">
        <div className="flex items-baseline justify-between">
          <h1 className="text-sm font-medium text-zinc-400">Feed</h1>
          <span className="text-xs text-zinc-600">{listings.length} listings</span>
        </div>

        <form method="get" className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
          <Input
            name="q"
            placeholder="Search roles, skills, stage..."
            defaultValue={params.q ?? ''}
            className="pl-8 h-9 bg-zinc-900/60 border-white/[0.06] text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/30 focus:bg-zinc-900 text-sm transition-all duration-150"
          />
          {params.role && <input type="hidden" name="role" value={params.role} />}
          {params.stage && <input type="hidden" name="stage" value={params.stage} />}
          {params.comp && <input type="hidden" name="comp" value={params.comp} />}
        </form>

        <Suspense>
          <FilterBar />
        </Suspense>

        {hasFilter && (
          <a href="/" className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors inline-flex items-center gap-1">
            ✕ Clear filters
          </a>
        )}
      </div>

      <Feed listings={listings} currentUserId={currentUserId} />
    </div>
  )
}
