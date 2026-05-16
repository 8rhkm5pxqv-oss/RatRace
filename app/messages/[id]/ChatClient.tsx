'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Message, Profile } from '@/types'

interface Props {
  conversationId: string
  currentUserId: string
  otherProfile: Profile
  listing: { id: string; title: string } | null
  initialMessages: Message[]
}

export default function ChatClient({ conversationId, currentUserId, otherProfile, listing, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        const { data } = await supabase.from('messages').select('*, profiles(*)').eq('id', payload.new.id).single()
        if (data) setMessages(prev => [...prev, data as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, supabase])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    setInput('')
    await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: currentUserId, content })
    setSending(false)
  }

  const initials = otherProfile?.full_name?.split(' ').map(n => n[0]).join('') ?? otherProfile?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-screen">
      {/* Header */}
      <div className="bg-[#0A0A0F]/80 backdrop-blur border-b border-white/[0.06] px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/messages" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'text-[#A0A0B0] hover:text-[#F0F0F5] h-8 w-8')}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Avatar className="h-9 w-9">
          <AvatarImage src={otherProfile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-violet-700/60 text-white text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${otherProfile?.id}`} className="font-semibold text-[#F0F0F5] hover:underline text-sm">
            {otherProfile?.full_name || otherProfile?.username}
          </Link>
          {listing && (
            <p className="text-xs text-[#6B7280] truncate">
              Re: <Link href={`/listings/${listing.id}`} className="hover:text-[#A0A0B0] transition-colors">{listing.title}</Link>
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-[#4B4B5A] text-sm py-8">Starte die Unterhaltung!</p>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMine
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-[#1A1A24] border border-white/[0.06] text-[#F0F0F5] rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-[11px] mt-1 ${isMine ? 'text-violet-300' : 'text-[#4B4B5A]'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] bg-[#0A0A0F] px-4 py-3 shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Nachricht eingeben..."
            className="flex-1 bg-[#1A1A24] border-white/[0.08] text-[#F0F0F5] placeholder:text-[#4B4B5A] focus:border-violet-500/50 h-10"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  )
}
