import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Pencil, ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ListingCard from '@/components/ListingCard'
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-[#A0A0B0] hover:text-[#F0F0F5]')}>
        <ArrowLeft className="h-4 w-4 mr-1" />Zurück
      </Link>

      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-violet-700/60 text-white text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#F0F0F5]">{profile.full_name || profile.username}</h1>
              <p className="text-[#6B7280] text-sm">@{profile.username}</p>
              {profile.location && (
                <p className="text-sm text-[#6B7280] flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />{profile.location}
                </p>
              )}
            </div>
          </div>
          {isOwn && (
            <Link href="/profile/edit" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-white/[0.1] text-[#A0A0B0] hover:text-[#F0F0F5] hover:border-white/20 hover:bg-white/[0.04]')}>
              <Pencil className="h-4 w-4 mr-1.5" />Bearbeiten
            </Link>
          )}
        </div>

        {profile.bio && (
          <>
            <hr className="border-white/[0.06] my-4" />
            <p className="text-[#A0A0B0] leading-relaxed whitespace-pre-wrap text-sm">{profile.bio}</p>
          </>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <>
            <hr className="border-white/[0.06] my-4" />
            <div>
              <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] text-[#A0A0B0]">{skill}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {listings && listings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#A0A0B0] uppercase tracking-wider">
            {isOwn ? 'Meine Inserate' : `Inserate`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(listings as Listing[]).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
