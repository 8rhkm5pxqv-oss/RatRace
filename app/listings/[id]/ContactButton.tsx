'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  listingId: string
  ownerId: string
}

export default function ContactButton({ listingId, ownerId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleContact() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${ownerId}),and(participant_1.eq.${ownerId},participant_2.eq.${user.id})`)
      .eq('listing_id', listingId)
      .maybeSingle()

    if (existing) { router.push(`/messages/${existing.id}`); return }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ listing_id: listingId, participant_1: user.id, participant_2: ownerId })
      .select().single()

    if (error) { toast.error('Fehler beim Öffnen des Chats'); setLoading(false); return }
    router.push(`/messages/${data.id}`)
  }

  return (
    <Button
      onClick={handleContact}
      disabled={loading}
      size="sm"
      className="bg-violet-600 hover:bg-violet-500 border-0 text-white shrink-0"
    >
      <MessageSquare className="h-4 w-4 mr-1.5" />
      {loading ? 'Lädt...' : 'Kontakt aufnehmen'}
    </Button>
  )
}
