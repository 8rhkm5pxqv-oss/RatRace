import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Pencil, ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ListingCard from '@/components/ListingCard'
import TranslatableBlock from '@/components/TranslatableBlock'
import { DEMO_PROFILES, DEMO_LISTINGS } from '@/lib/demo-data'
import type { Listing } from '@/types'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let profile: any = null
  let user: any = null
  let listings: Listing[] = []

  if (!isSupabaseConfigured()) {
    profile = DEMO_PROFILES.find(p => p.id === id) ?? null
    listings = (DEMO_LISTINGS as unknown as Listing[]).filter(l => l.user_id === id)
  } else {
    const supabase = await createClient()
    const [{ data: profileData }, { data: { user: authUser } }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.auth.getUser(),
    ])
    profile = profileData
    user = authUser

    if (profile) {
      const { data } = await supabase
        .from('listings')
        .select('*, profiles(*)')
        .eq('user_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      listings = (data ?? []) as Listing[]
    }
  }

  if (!profile) notFound()

  const isOwn = user?.id === id
  const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('') ?? profile.username?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-zinc-500 hover:text-zinc-200')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>

      <div className="rounded-xl border border-white/[0.07] bg-[#141414] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-violet-600/70 text-white text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h1 className="text-xl font-semibold text-white">{profile.full_name || profile.username}</h1>
              <p className="text-zinc-600 text-sm">@{profile.username}</p>
              {profile.location && (
                <p className="text-sm text-zinc-500 flex items-center gap-1 pt-0.5">
                  <MapPin className="h-3.5 w-3.5" />{profile.location}
                </p>
              )}
            </div>
          </div>
          {isOwn && (
            <Link href="/profile/edit" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20 hover:bg-white/[0.04] text-xs')}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Link>
          )}
        </div>

        {profile.bio && (
          <>
            <hr className="border-white/[0.06] my-4" />
            <TranslatableBlock text={profile.bio} className="text-zinc-400 leading-relaxed text-sm" />
          </>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <>
            <hr className="border-white/[0.06] my-4" />
            <div>
              <h2 className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-2.5">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill: string) => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-400 border border-zinc-700/40">{skill}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {listings && listings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest px-1">
            {isOwn ? 'My listings' : 'Listings'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(listings as Listing[]).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
