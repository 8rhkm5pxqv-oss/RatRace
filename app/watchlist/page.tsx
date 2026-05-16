'use client'

import { useState, useEffect } from 'react'
import { Bookmark, Trash2 } from 'lucide-react'
import FeedCard from '@/components/FeedCard'
import { DEMO_LISTINGS } from '@/lib/demo-data'
import type { Listing } from '@/types'

export default function WatchlistPage() {
  const [ids, setIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ratrace_watchlist') ?? '[]')
      setIds(saved)
    } catch {
      setIds([])
    }
    setMounted(true)
  }, [])

  function clearAll() {
    localStorage.setItem('ratrace_watchlist', '[]')
    setIds([])
  }

  // For demo mode: filter DEMO_LISTINGS by saved IDs
  const listings = (DEMO_LISTINGS as unknown as Listing[]).filter(l => ids.includes(l.id))

  if (!mounted) return null

  return (
    <div className="px-6 py-6 flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="h-5 w-5 text-[#6B7280]" />
            <h1 className="text-xl font-bold text-[#F0F0F5]">Watchlist</h1>
          </div>
          <p className="text-sm text-[#6B7280]">{ids.length} gespeicherte Inserate</p>
        </div>
        {ids.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Alle entfernen
          </button>
        )}
      </div>

      {ids.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="h-10 w-10 mx-auto mb-3 text-[#2A2A35]" />
          <p className="font-medium text-[#A0A0B0]">Watchlist ist leer</p>
          <p className="text-sm text-[#6B7280] mt-1">
            Klick auf das <Bookmark className="h-3.5 w-3.5 inline mb-0.5" /> Icon bei einem Inserat
          </p>
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map(listing => (
            <FeedCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[#A0A0B0]">Gespeicherte Inserate werden hier angezeigt.</p>
          <p className="text-sm text-[#6B7280] mt-1">
            (Verbinde Supabase für persistente Watchlists)
          </p>
        </div>
      )}
    </div>
  )
}
