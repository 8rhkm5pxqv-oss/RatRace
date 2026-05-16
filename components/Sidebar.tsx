'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid, MessageSquare, TrendingUp, Hash,
  PlusCircle, LogOut, LogIn, Users, Bookmark, Settings, FileText,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

const NAV_MAIN = [
  { label: 'Feed', href: '/', icon: LayoutGrid },
  { label: 'Founders', href: '/founders', icon: Users },
  { label: 'Deals', href: '/investors', icon: TrendingUp, amber: true },
]
const NAV_PERSONAL = [
  { label: 'Requests', href: '/requests', icon: FileText },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Watchlist', href: '/watchlist', icon: Bookmark },
  { label: 'Community', href: '/chat', icon: Hash },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials =
    profile?.full_name?.split(' ').map(n => n[0]).join('') ??
    profile?.username?.[0]?.toUpperCase() ??
    '?'

  function NavLink({ label, href, icon: Icon, amber }: { label: string; href: string; icon: any; amber?: boolean }) {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-white/[0.08] text-[#F0F0F5]'
            : amber
            ? 'text-amber-400/70 hover:bg-amber-500/[0.06] hover:text-amber-400'
            : 'text-[#6B7280] hover:bg-white/[0.04] hover:text-[#A0A0B0]'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    )
  }

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#0A0A0F] h-screen sticky top-0 z-40">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3">
        <Link href="/">
          <Image src="/logo.png" alt="RatRace" width={140} height={140} className="w-full max-w-[140px]" priority />
        </Link>
      </div>

      {/* New Post */}
      <div className="px-3 mb-2">
        <Link
          href="/listings/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_MAIN.map(item => <NavLink key={item.href} {...item} />)}

        <div className="pt-3 pb-1">
          <p className="px-3 text-[10px] font-semibold text-[#3A3A4A] uppercase tracking-widest">Personal</p>
        </div>

        {NAV_PERSONAL.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* Settings + User */}
      <div className="px-3 pb-4 pt-1 border-t border-white/[0.06] space-y-1 shrink-0">
        <NavLink label="Settings" href="/settings" icon={Settings} />

        {profile ? (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <Link href={`/profile/${profile.id}`}>
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-violet-700 text-white text-[10px]">{initials}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${profile.id}`} className="text-xs font-medium text-[#F0F0F5] truncate hover:underline block">
                {profile.full_name || profile.username}
              </Link>
              <p className="text-[10px] text-[#4B4B5A] truncate">@{profile.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 text-[#4B4B5A] hover:text-red-400 transition-colors shrink-0"
              title="Abmelden"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#6B7280] hover:bg-white/[0.04] hover:text-[#A0A0B0] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Anmelden
          </Link>
        )}
      </div>
    </aside>
  )
}
