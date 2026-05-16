import { createClient } from '@/lib/supabase/server'
import ChatRoom from './ChatRoom'

const CHANNELS = [
  { id: 'general', label: '#general', description: 'Allgemeine Gespräche' },
  { id: 'suche-mitgruender', label: '#suche-mitgründer', description: 'Mitgründer finden' },
  { id: 'investoren', label: '#investoren', description: 'VC & Investor-Talk' },
  { id: 'show-and-tell', label: '#show-and-tell', description: 'Euer Startup vorstellen' },
]

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ channel?: string }> }) {
  const { channel = 'general' } = await searchParams
  const activeChannel = CHANNELS.find(c => c.id === channel) ?? CHANNELS[0]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let messages: any[] = []
  let currentUserId: string | null = null

  if (supabaseUrl && supabaseUrl !== 'your-project-url') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    currentUserId = user?.id ?? null

    const { data } = await supabase
      .from('community_messages')
      .select('*, profiles(id, username, full_name, avatar_url)')
      .eq('channel', activeChannel.id)
      .order('created_at', { ascending: true })
      .limit(100)

    messages = data ?? []
  }

  return (
    <ChatRoom
      channels={CHANNELS}
      activeChannel={activeChannel}
      initialMessages={messages}
      currentUserId={currentUserId}
    />
  )
}
