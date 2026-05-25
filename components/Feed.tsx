'use client'

import FeedCard from './FeedCard'
import type { Listing } from '@/types'

interface Props {
  listings: Listing[]
  currentUserId?: string | null
}

export default function Feed({ listings }: Props) {
  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="px-5 py-4 space-y-2">
        {listings.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-sm font-medium text-zinc-500">Keine Inserate gefunden</p>
            <p className="text-xs mt-1 text-zinc-600">Versuche andere Filtereinstellungen</p>
          </div>
        ) : (
          listings.map(listing => (
            <FeedCard key={listing.id} listing={listing} />
          ))
        )}
      </div>
    </div>
  )
}
