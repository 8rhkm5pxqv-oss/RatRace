'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Users, PlusCircle, MessageSquare, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { label: 'Feed', href: '/', icon: LayoutGrid },
  { label: 'Founders', href: '/founders', icon: Users },
  { label: 'Post', href: '/listings/new', icon: PlusCircle, highlight: true },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Watchlist', href: '/watchlist', icon: Bookmark },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0A0A0F]/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 h-16">
        {ITEMS.map(({ label, href, icon: Icon, highlight }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-0',
                highlight
                  ? 'bg-violet-600 hover:bg-violet-500 text-white -mt-4 p-3 rounded-xl shadow-lg shadow-violet-900/40'
                  : isActive
                  ? 'text-[#F0F0F5]'
                  : 'text-[#4B4B5A] hover:text-[#A0A0B0]'
              )}
            >
              <Icon className={cn('shrink-0', highlight ? 'h-5 w-5' : 'h-5 w-5')} />
              {!highlight && <span className="text-[10px] font-medium">{label}</span>}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
