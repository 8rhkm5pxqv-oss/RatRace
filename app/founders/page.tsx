import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Users } from 'lucide-react'
import { DEMO_PROFILES } from '@/lib/demo-data'
import type { Profile } from '@/types'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

async function getProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return DEMO_PROFILES
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as Profile[]
}

function ProfileCard({ profile }: { profile: Profile }) {
  const initials =
    profile.full_name?.split(' ').map(n => n[0]).join('') ??
    profile.username?.[0]?.toUpperCase() ??
    '?'

  return (
    <Link href={`/profile/${profile.id}`} className="block group">
      <div className="rounded-xl border border-white/[0.06] bg-[#141414] p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-[#131321] h-full">
        <div className="flex items-start gap-4 mb-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-violet-600/70 text-white text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
              {profile.full_name || profile.username}
            </p>
            <p className="text-xs text-zinc-600">@{profile.username}</p>
            {profile.location && (
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {profile.location}
              </p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-3">
            {profile.bio}
          </p>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 4).map(skill => (
              <span key={skill} className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-[#A0A0B0] border border-white/[0.06]">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export default async function FoundersPage() {
  const profiles = await getProfiles()

  return (
    <div className="px-6 py-6">
      <div className="mb-6 border-b border-white/[0.05] pb-5">
        <h1 className="text-lg font-semibold text-white tracking-tight">Founders</h1>
        <p className="text-xs text-zinc-600 mt-0.5">
          {profiles.length} Gründer auf der Plattform
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium text-[#A0A0B0]">Noch keine Profile</p>
          <p className="text-sm mt-1">Sei der erste Gründer auf RatRace</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {profiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  )
}
