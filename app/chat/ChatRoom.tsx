'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Send, Hash, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Channel {
  id: string
  label: string
  description: string
}

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string | null
  profiles: { id: string; username: string; full_name: string | null; avatar_url: string | null } | null
}

interface Props {
  channels: Channel[]
  activeChannel: Channel
  initialMessages: Message[]
  currentUserId: string | null
}

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

export default function ChatRoom({ channels, activeChannel, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    const channel = supabase
      .channel(`community:${activeChannel.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `channel=eq.${activeChannel.id}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('community_messages')
          .select('*, profiles(id, username, full_name, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeChannel.id])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending || !currentUserId) return

    setSending(true)
    setInput('')

    const supabase = createClient()
    const { error } = await supabase.from('community_messages').insert({
      user_id: currentUserId,
      channel: activeChannel.id,
      content,
    })

    if (error) toast.error('Fehler beim Senden')
    setSending(false)
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-screen">
      {/* Channel Sidebar */}
      <aside className="w-52 shrink-0 border-r border-white/[0.06] bg-[#0D0D14] flex flex-col hidden sm:flex">
        <div className="p-4 border-b border-white/[0.04]">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Community</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {channels.map(ch => (
            <Link
              key={ch.id}
              href={`/chat?channel=${ch.id}`}
              className={cn(
                'flex flex-col px-3 py-2 rounded-lg transition-colors',
                activeChannel.id === ch.id
                  ? 'bg-violet-500/15 text-[#F0F0F5]'
                  : 'text-[#6B7280] hover:bg-white/[0.04] hover:text-[#A0A0B0]'
              )}
            >
              <span className="text-sm font-medium">{ch.label}</span>
              <span className="text-[11px] text-[#4B4B5A] mt-0.5">{ch.description}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur flex items-center gap-3 shrink-0">
          <Hash className="h-5 w-5 text-[#6B7280] shrink-0" />
          <div>
            <h1 className="font-semibold text-[#F0F0F5] text-sm">{activeChannel.label}</h1>
            <p className="text-xs text-[#6B7280]">{activeChannel.description}</p>
          </div>
          {/* Mobile channel switcher */}
          <div className="ml-auto flex gap-1 sm:hidden">
            {channels.map(ch => (
              <Link
                key={ch.id}
                href={`/chat?channel=${ch.id}`}
                className={cn(
                  'text-xs px-2 py-1 rounded-lg transition-colors',
                  activeChannel.id === ch.id ? 'bg-violet-500/20 text-violet-300' : 'text-[#6B7280] hover:bg-white/[0.04]'
                )}
              >
                {ch.id === 'general' ? '#gen' : ch.id === 'suche-mitgruender' ? '#suche' : ch.id === 'investoren' ? '#inv' : '#s&t'}
              </Link>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Hash className="h-10 w-10 text-[#2A2A35] mx-auto mb-3" />
              <p className="text-[#A0A0B0] font-medium">Starte das Gespräch!</p>
              <p className="text-sm text-[#4B4B5A] mt-1">Sei der Erste in {activeChannel.label}</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const profile = msg.profiles
            const isSame = i > 0 && messages[i - 1].user_id === msg.user_id &&
              new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() < 5 * 60 * 1000
            const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') ?? profile?.username?.[0]?.toUpperCase() ?? '?'

            return (
              <div key={msg.id} className={cn('flex gap-3', isSame && 'mt-0.5')}>
                {!isSame ? (
                  <Link href={profile ? `/profile/${profile.id}` : '#'} className="shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-violet-700/60 text-white text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <div className="w-8 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {!isSame && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <Link href={profile ? `/profile/${profile.id}` : '#'} className="text-sm font-semibold text-[#F0F0F5] hover:underline">
                        {profile?.full_name || profile?.username || 'Anonym'}
                      </Link>
                      <span className="text-[11px] text-[#4B4B5A]">{formatTime(msg.created_at)}</span>
                    </div>
                  )}
                  <p className="text-sm text-[#C0C0D0] leading-relaxed break-words">{msg.content}</p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 shrink-0">
          {currentUserId ? (
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Schreibe in ${activeChannel.label}...`}
                className="flex-1 bg-[#1A1A24] border-white/[0.08] text-[#F0F0F5] placeholder:text-[#4B4B5A] focus:border-violet-500/50 h-10"
                autoComplete="off"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-[#111118]">
              <Lock className="h-4 w-4 text-[#6B7280] shrink-0" />
              <p className="text-sm text-[#6B7280] flex-1">
                <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">Anmelden</Link>
                {' '}um Nachrichten zu schreiben
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
