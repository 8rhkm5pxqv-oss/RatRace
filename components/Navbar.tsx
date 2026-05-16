'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Rocket, MessageSquare, PlusCircle, User, LogOut, LogIn, Hash, TrendingUp } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface Props {
  profile: Profile | null
}

export default function Navbar({ profile }: Props) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') ?? profile?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <span className="text-gradient-violet hidden sm:block">CoFounder</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="text-sm text-[#A0A0B0] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
            Feed
          </Link>
          <Link href="/chat" className="text-sm text-[#A0A0B0] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" />Chat
          </Link>
          <Link href="/investors" className="text-sm text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-400/[0.08] transition-colors flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />Für Investoren
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <Link
                href="/listings/new"
                className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:flex gap-1.5 bg-violet-600 hover:bg-violet-500 border-0 text-white')}
              >
                <PlusCircle className="h-4 w-4" />Inserieren
              </Link>
              <Link href="/messages" className="text-[#A0A0B0] hover:text-white p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer">
                  <Avatar className="h-8 w-8 ring-2 ring-white/10">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-violet-700 text-white text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#1A1A24] border-white/[0.08]">
                  <DropdownMenuItem
                    className="cursor-pointer p-0 text-[#A0A0B0] hover:text-white"
                    render={<Link href={`/profile/${profile.id}`} className="flex items-center gap-2 w-full px-3 py-2" />}
                  >
                    <User className="h-4 w-4" />Mein Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer p-0 text-[#A0A0B0] hover:text-white md:hidden"
                    render={<Link href="/listings/new" className="flex items-center gap-2 w-full px-3 py-2" />}
                  >
                    <PlusCircle className="h-4 w-4" />Inserieren
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-400 cursor-pointer hover:text-red-300 px-3 py-2"
                  >
                    <LogOut className="h-4 w-4" />Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-[#A0A0B0] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                Anmelden
              </Link>
              <Link href="/auth/signup" className={cn(buttonVariants({ size: 'sm' }), 'bg-violet-600 hover:bg-violet-500 border-0 text-white gap-1.5')}>
                <LogIn className="h-4 w-4" />Registrieren
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
