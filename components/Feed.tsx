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
      <div className="px-6 py-5 space-y-3">
        {listings.length === 0 ? (
          <div className="text-center py-16 text-[#6B7280]">
            <p className="text-base font-medium text-[#A0A0B0]">Keine Inserate gefunden</p>
            <p className="text-sm mt-1">Versuche andere Filtereinstellungen</p>
          </div>
        ) : (
          listings.map(listing => (
            <FeedCard
              key={listing.id}
              listing={listing}
            />
          ))
        )}
      </div>
    </div>
  )
}
