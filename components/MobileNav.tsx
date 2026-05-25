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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.05] bg-[#0A0A0F]/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-1 h-[60px]">
        {ITEMS.map(({ label, href, icon: Icon, highlight }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 min-w-0',
                highlight
                  ? 'bg-violet-600 hover:bg-violet-500 text-white -mt-5 p-3 rounded-2xl shadow-lg shadow-violet-900/50'
                  : isActive
                  ? 'text-white'
                  : 'text-[#3A3A4A] hover:text-[#6B7280]'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!highlight && (
                <span className={cn('text-[9px] font-medium tracking-wide', isActive ? 'text-white' : 'text-[#3A3A4A]')}>
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      {/* Safe area spacer */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
