import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatClient from './ChatClient'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      id, listing_id,
      participant_1, participant_2,
      listings(id, title),
      profile_1:profiles!conversations_participant_1_fkey(*),
      profile_2:profiles!conversations_participant_2_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  const isParticipant = conversation.participant_1 === user.id || conversation.participant_2 === user.id
  if (!isParticipant) redirect('/messages')

  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles(*)')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const other = conversation.participant_1 === user.id ? (conversation as any).profile_2 : (conversation as any).profile_1

  return (
    <ChatClient
      conversationId={id}
      currentUserId={user.id}
      otherProfile={other}
      listing={(conversation as any).listings}
      initialMessages={messages || []}
    />
  )
}
