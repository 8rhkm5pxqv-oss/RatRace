'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const isConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

interface Props {
  listingId: string
  ownerId: string
  className?: string
}

export default function MessageButton({ listingId, ownerId, className }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handle(e: React.MouseEvent) {
    e.stopPropagation()

    if (!isConfigured()) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }
    if (user.id === ownerId) {
      setLoading(false)
      return
    }

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${ownerId}),and(participant_1.eq.${ownerId},participant_2.eq.${user.id})`)
      .eq('listing_id', listingId)
      .maybeSingle()

    if (existing) {
      router.push(`/messages/${existing.id}`)
      return
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ listing_id: listingId, participant_1: user.id, participant_2: ownerId })
      .select()
      .single()

    if (error) {
      toast.error('Fehler beim Öffnen des Chats')
      setLoading(false)
      return
    }
    router.push(`/messages/${data.id}`)
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      title="Nachricht schreiben"
      className={cn(
        'p-1.5 rounded-lg transition-colors disabled:opacity-40',
        'hover:bg-white/[0.06] text-[#4B4B5A] hover:text-violet-400',
        className
      )}
    >
      <MessageSquare className="h-3.5 w-3.5" />
    </button>
  )
}
