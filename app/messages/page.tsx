import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare } from 'lucide-react'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

export default async function MessagesPage() {
  if (!isSupabaseConfigured()) redirect('/auth/login')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, created_at, listing_id,
      participant_1, participant_2,
      listings(id, title),
      profile_1:profiles!conversations_participant_1_fkey(*),
      profile_2:profiles!conversations_participant_2_fkey(*)
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold text-[#F0F0F5]">Nachrichten</h1>

      {!conversations || conversations.length === 0 ? (
        <div className="text-center py-16 text-[#6B7280]">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium text-[#A0A0B0]">Noch keine Nachrichten</p>
          <p className="text-sm mt-1">Kontaktiere jemanden über ein Inserat</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: any) => {
            const other = conv.participant_1 === user.id ? conv.profile_2 : conv.profile_1
            const initials = other?.full_name?.split(' ').map((n: string) => n[0]).join('') ?? other?.username?.[0]?.toUpperCase() ?? '?'

            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-4 flex items-center gap-4 hover:border-white/10 hover:bg-[#14141d] transition-all">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={other?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-violet-700/60 text-white text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#F0F0F5] text-sm">{other?.full_name || other?.username}</p>
                    {conv.listings && (
                      <p className="text-xs text-[#6B7280] truncate mt-0.5">Re: {conv.listings.title}</p>
                    )}
                  </div>
                  <span className="text-xs text-[#4B4B5A] shrink-0">
                    {new Date(conv.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
